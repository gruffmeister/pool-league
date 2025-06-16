import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { NextResponse } from 'next/server';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export async function GET() {
  try {
    const result = await client.send(
      new ScanCommand({
        TableName: 'pool-league-users',
        ProjectionExpression: 'id, fullName, email',
      })
    );

    const users = result.Items.map((item) => ({
      id: item.id.S,
      name: item.fullName?.S || '',
      email: item.email?.S || '',
    }));

    return NextResponse.json(users);
  } catch (err) {
    console.error('Error fetching all users:', err);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}
