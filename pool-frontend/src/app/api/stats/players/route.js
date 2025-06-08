import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'eu-west-2' });
const getStr = (attr) => (attr && attr.S ? attr.S : '');

const processMatchResult = (matchResultMap, sessionData) => {
  const results = [];

  for (const subKey in matchResultMap.M) {
    const match = matchResultMap.M[subKey].M;
    const scores = match.scores?.L || [];
    const teamName = getStr(match.teamName);

    scores.forEach((scoreEntry) => {
      const result = getStr(scoreEntry.M.result);
      const playerName = getStr(scoreEntry.M.player);
      if (!result || !playerName) return;

      results.push({
        player: playerName,
        result,
        teamName,
        date: getStr(sessionData.date),
        matchType: getStr(sessionData.matchType),
        division: getStr(sessionData.division),
      });
    });
  }

  return results;
};

const aggregatePlayerStats = (flatResults, targetDivision = null) => {
  const playerStats = {};

  flatResults.forEach(({ player, result, teamName, division }) => {
    if (targetDivision && division !== targetDivision) return;

    if (!playerStats[player]) {
      playerStats[player] = {
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

    const stats = playerStats[player];
    if (result === 'W') stats.framesWon += 1;
    if (result === 'L') stats.framesLost += 1;
  });

  // Derive matches + wins/losses
  Object.values(playerStats).forEach((player) => {
    const totalFrames = player.framesWon + player.framesLost;
    player.matchesPlayed = Math.ceil(totalFrames / 12); // assuming 12 frames per match
    player.matchesWon = player.framesWon > player.framesLost ? 1 : 0;
    player.matchesLost = player.matchesWon === 0 ? 1 : 0;
  });

  return Object.values(playerStats);
};

export async function GET(req) {
  const url = new URL(req.url);
  const divisionFilter = url.searchParams.get('division');

  try {
    const data = await client.send(new ScanCommand({ TableName: 'pool-league-scorecard' }));
    const items = data.Items || [];

    const allResults = [];

    items.forEach((item) => {
      const matchResult = item.matchResult;
      if (matchResult && matchResult.M) {
        allResults.push(
          ...processMatchResult(matchResult, {
            date: item.date,
            division: item.division,
            matchType: item.matchType,
          })
        );
      }
    });

    const stats = aggregatePlayerStats(allResults, divisionFilter);

    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
