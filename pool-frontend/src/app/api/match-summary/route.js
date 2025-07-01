import { NextResponse } from 'next/server';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({ region: 'eu-west-2' });

async function getMatchResult(sessionKey, subSessionKey) {
    const params = {
      TableName: 'pool-league-scorecard',
      Key: {
        sessionKey: { S: sessionKey }
      }
    };
  
    try {
      const data = await client.send(new GetItemCommand(params));
      if (!data.Item) return null;
  
      const item = unmarshall(data.Item);
  
      // Safely access the match result for 'home' or 'away'
      return item.matchResult?.[subSessionKey] || null;
  
    } catch (error) {
      console.error(`Error fetching ${subSessionKey} result:`, error);
      return null;
    }
  }

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionKey = searchParams.get('sessionKey');

  if (!sessionKey) {
    return NextResponse.json({ error: 'Missing sessionKey' }, { status: 400 });
  }

  const [homeResult, awayResult] = await Promise.all([
    getMatchResult(sessionKey, 'home'),
    getMatchResult(sessionKey, 'away')
  ]);

  return NextResponse.json({ homeResult, awayResult });
}
