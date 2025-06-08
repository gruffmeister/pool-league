import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { NextResponse } from 'next/server';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export async function GET() {
  try {
    const result = await client.send(
      new ScanCommand({
        TableName: 'pool-league-users',
      })
    );

    const users = result.Items || [];

    // Filter out users who already have a team assigned
    const availableUsers = users
      .filter((user) => !user.team?.S)
      .map((user) => ({
        id: user.id.S,
        name: user.name?.S || '',
        email: user.email.S,
      }));

    return NextResponse.json(availableUsers, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}
