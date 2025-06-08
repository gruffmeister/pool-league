// src/pages/api/users/lookup/route.js (or src/app/api/users/lookup/route.js if in /app)
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { NextResponse } from 'next/server';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) return NextResponse.json({ message: 'Email required' }, { status: 400 });

  try {
    const result = await client.send(
      new GetItemCommand({
        TableName: 'pool-league-users',
        Key: {
          email: { S: email }
        }
      })
    );

    if (!result.Item) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    const user = {
      email: result.Item.email.S,
      name: result.Item.name?.S || '',
      team: result.Item.team?.S || ''
    };

    return NextResponse.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
