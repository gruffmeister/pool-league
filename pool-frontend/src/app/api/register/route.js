import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export async function POST(req) {
  try {
    const body = await req.json(); // 👈 Extract JSON from the request
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const userItem = {
      id: { S: uuidv4() },
      email: { S: email },
      password: { S: password }, // Note: should hash in real apps
      createdAt: { S: new Date().toISOString() },
    };

    await client.send(
      new PutItemCommand({
        TableName: 'pool-league-users',
        Item: userItem,
      })
    );

    return NextResponse.json({ message: 'User registered successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
