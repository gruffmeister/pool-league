import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { NextResponse } from 'next/server';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export async function GET(req, { params }) {
  const { teamName } = await params;

  if (!teamName) {
    return NextResponse.json({ message: 'Team name is required' }, { status: 400 });
  }

  try {
    // Scan because we query by teamName (non-key)
    const result = await client.send(
      new ScanCommand({
        TableName: 'pool-league-teams',
        FilterExpression: 'teamName = :teamName',
        ExpressionAttributeValues: {
          ':teamName': { S: decodeURIComponent(teamName) },
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    const item = result.Items[0];

    const team = {
      id: item.id.S,
      teamName: item.teamName.S,
      location: item.location?.S || '',
      captain: item.captain.S,
      captainPhone: item.captainPhone.S,
      players: item.players?.L?.map((p) => p.S) || [],
    };

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ message: 'Failed to fetch team' }, { status: 500 });
  }
}
