import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'eu-west-2' });
const getStr = (attr) => (attr && attr.S ? attr.S : '');

// Extract from query param
const getDivisionFilter = (req) => {
  try {
    const url = new URL(req.url);
    return url.searchParams.get('division');
  } catch {
    return null;
  }
};

const processMatchResult = (matchResultMap, sessionData) => {
    const results = [];
  
    for (const subKey in matchResultMap.M) {
      const match = matchResultMap.M[subKey].M;
      const scores = match.scores?.L || [];
      const teamName = getStr(match.teamName);
  
      scores.forEach((scoreEntry, i) => {
        const result = getStr(scoreEntry.M.result);
        const playerName = getStr(scoreEntry.M.player);
        if (!result || !playerName) return;
  
        // Try to infer opponent
        const opponentEntry = scores[i ^ 1]; // bitwise XOR to alternate pairs: 0<->1, 2<->3...
        const opponentName = getStr(opponentEntry?.M?.player);
  
        results.push({
          player: playerName,
          opponentName: opponentName !== playerName ? opponentName : 'Unknown',
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

const aggregateTeamStats = (flatResults) => {
  const teamStats = {};

  flatResults.forEach(({ result, teamName }) => {
    if (!teamStats[teamName]) {
      teamStats[teamName] = {
        id: teamName,
        name: teamName,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        matchesDrawn: 0,
        points: 0,
        framesWon: 0,
        framesLost: 0,
        frameDiff: 0,
      };
    }

    const stats = teamStats[teamName];
    stats.framesWon += result === 'W' ? 1 : 0;
    stats.framesLost += result === 'L' ? 1 : 0;
  });

  Object.values(teamStats).forEach((team) => {
    const totalFrames = team.framesWon + team.framesLost;
    team.matchesPlayed = Math.ceil(totalFrames / 12);
    team.matchesDrawn = team.framesWon === team.framesLost ? 1 : 0;
    team.matchesWon = team.framesWon > team.framesLost ? 1 : 0;
    team.matchesLost = team.framesWon < team.framesLost ? 1 : 0;
    team.points = team.matchesWon * 3 + team.matchesDrawn * 1;
    team.frameDiff = team.framesWon - team.framesLost;
  });

  // Sort: by points, then frame difference
  return Object.values(teamStats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.frameDiff - a.frameDiff;
  });
};

export async function GET(req) {
  try {
    const divisionFilter = getDivisionFilter(req);

    const scanCommand = new ScanCommand({
      TableName: 'pool-league-scorecard',
    });

    const data = await client.send(scanCommand);
    const items = data.Items || [];

    const allResults = [];

    items.forEach((item) => {
      const division = getStr(item.division);

      // ✅ filter by division if provided
      if (divisionFilter && division !== divisionFilter) return;

      const matchResult = item.matchResult;
      if (matchResult && matchResult.M) {
        allResults.push(
          ...processMatchResult(matchResult, {
            date: item.date,
            matchType: item.matchType,
            division: item.division,
          })
        );
      }
    });

    const stats = aggregateTeamStats(allResults);

    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
