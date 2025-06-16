import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { NextResponse } from 'next/server';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ message: 'Email required' }, { status: 400 });
  }

  try {
    const scanCommand = new ScanCommand({
      TableName: 'pool-league-users',
      FilterExpression: 'email = :emailVal',
      ExpressionAttributeValues: {
        ':emailVal': { S: email }
      }
    });

    const data = await client.send(scanCommand);
    const user = data.Items?.[0];

    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    return NextResponse.json({
      email: user.email.S,
      name: user.fullName?.S || '',
      team: user.team?.S || '',
      isCaptain: user.isCaptain?.BOOL || false
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
