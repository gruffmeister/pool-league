import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'your-region' });
const getStr = (attr) => (attr && attr.S ? attr.S : '');

// -- Helpers --

const extractResults = (matchResultMap, sessionData) => {
  const flatPlayerResults = [];
  const flatTeamResults = [];

  for (const subKey in matchResultMap.M) {
    const match = matchResultMap.M[subKey].M;
    const scores = match.scores?.L || [];
    const teamName = getStr(match.teamName);

    scores.forEach((entry) => {
      const player = getStr(entry.M.player);
      const result = getStr(entry.M.result);
      if (!player || !result) return;

      const frameData = {
        player,
        result,
        teamName,
        date: getStr(sessionData.date),
        matchType: getStr(sessionData.matchType),
      };

      flatPlayerResults.push(frameData);
      flatTeamResults.push(frameData); // same info for team aggregation
    });
  }

  return { flatPlayerResults, flatTeamResults };
};

const aggregatePlayerStats = (flatResults) => {
  const stats = {};

  flatResults.forEach(({ player, result, teamName }) => {
    if (!stats[player]) {
      stats[player] = {
        id: player,
        name: player,
        teamName,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        framesWon: 0,
        framesLost: 0,
      };
    }

    const p = stats[player];
    p.framesWon += result === 'W' ? 1 : 0;
    p.framesLost += result === 'L' ? 1 : 0;
  });

  Object.values(stats).forEach((p) => {
    const totalFrames = p.framesWon + p.framesLost;
    p.matchesPlayed = Math.ceil(totalFrames / 12);
    p.matchesWon = p.framesWon > p.framesLost ? 1 : 0;
    p.matchesLost = p.matchesWon === 0 ? 1 : 0;
  });

  return Object.values(stats);
};

const aggregateTeamStats = (flatResults) => {
  const stats = {};

  flatResults.forEach(({ result, teamName }) => {
    if (!stats[teamName]) {
      stats[teamName] = {
        id: teamName,
        name: teamName,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        points: 0,
        framesWon: 0,
        framesLost: 0,
      };
    }

    const t = stats[teamName];
    t.framesWon += result === 'W' ? 1 : 0;
    t.framesLost += result === 'L' ? 1 : 0;
  });

  Object.values(stats).forEach((t) => {
    const totalFrames = t.framesWon + t.framesLost;
    t.matchesPlayed = Math.ceil(totalFrames / 12);
    t.matchesWon = t.framesWon > t.framesLost ? 1 : 0;
    t.matchesLost = t.matchesWon === 0 ? 1 : 0;
    t.points = t.matchesWon * 3;
  });

  return Object.values(stats);
};

// -- Main Handler --

export async function GET() {
  try {
    const scanCommand = new ScanCommand({
      TableName: 'your-table-name',
    });

    const data = await client.send(scanCommand);
    const items = data.Items || [];

    let allPlayerFrames = [];
    let allTeamFrames = [];

    items.forEach((item) => {
      if (item.matchResult?.M) {
        const { flatPlayerResults, flatTeamResults } = extractResults(item.matchResult, {
          date: item.date,
          matchType: item.matchType,
        });

        allPlayerFrames.push(...flatPlayerResults);
        allTeamFrames.push(...flatTeamResults);
      }
    });

    const players = aggregatePlayerStats(allPlayerFrames);
    const teams = aggregateTeamStats(allTeamFrames);

    return new Response(
      JSON.stringify({ players, teams }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error fetching stats summary:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
