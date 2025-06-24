import { DynamoDBClient, QueryCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export async function POST(req) {
  try {
    const body = await req.json(); // 👈 Extract JSON from the request
    const { emailnorm, password, username, fullName } = body;

    const email = emailnorm.toLowerCase()
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

     // Check for existing email
     const existingUser = await client.send(
      new QueryCommand({
        TableName: 'pool-league-users',
        IndexName: 'email-index', // 🛑 Requires a GSI on email!
        KeyConditionExpression: 'email = :e',
        ExpressionAttributeValues: {
          ':e': { S: email.trim() },
        },
      })
    );

    if (existingUser.Count > 0) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    const userItem = {
      id: { S: uuidv4() },
      email: { S: email.trim() },
      password: { S: password }, // Note: should hash in real apps
      username: { S: username.trim() },
      fullName: { S: fullName.trim() },
      isCaptain: { BOOL: false },
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
