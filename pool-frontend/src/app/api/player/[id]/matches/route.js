import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'eu-west-2' });
const getStr = (attr) => (attr && attr.S ? attr.S : '');

export async function GET(_, { params }) {
  const playerId = params.id;

  try {
    const scanCommand = new ScanCommand({
      TableName: 'pool-league-scorecard',
    });

    const data = await client.send(scanCommand);
    const items = data.Items || [];

    const history = [];

    items.forEach((item) => {
      const matchResult = item.matchResult;
      if (!matchResult || !matchResult.M) return;

      for (const subKey in matchResult.M) {
        const match = matchResult.M[subKey].M;
        const scores = match.scores?.L || [];
        const teamName = getStr(match.teamName);
        let framesWon = 0;
        let framesLost = 0;

        scores.forEach((scoreEntry) => {
          const player = getStr(scoreEntry.M.player);
          const result = getStr(scoreEntry.M.result);

          if (player === playerId) {
            if (result === 'W') framesWon += 1;
            else if (result === 'L') framesLost += 1;
          }
        });

        if (framesWon + framesLost > 0) {
          history.push({
            id: `${item.sessionKey?.S}_${subKey}`,
            date: getStr(item.date),
            opponentName: 'Unknown', // You could infer this if needed
            won: framesWon > framesLost,
            framesWon,
            framesLost,
          });
        }
      }
    });

    return new Response(JSON.stringify(history), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching player match history:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
