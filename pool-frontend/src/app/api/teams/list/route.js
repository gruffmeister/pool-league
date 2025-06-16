import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { NextResponse } from 'next/server';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export async function GET() {
  try {
    const data = await client.send(
      new ScanCommand({ TableName: 'pool-league-teams' })
    );

    const teams = (data.Items || []).map((item) => ({
      id: item.id.S,
      teamName: item.teamName.S,
      location: item.location?.S || '',
      captain: item.captain?.S || '',
      captainPhone: item.captainPhone?.S || '',
      players: item.players?.L?.map((p) => p.S) || [],
      homeAway: item.homeAway?.S || '',
      currentMatch: item.currentMatch?.S || ''
    }));

    return NextResponse.json(teams);
  } catch (err) {
    console.error('Failed to load teams:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
