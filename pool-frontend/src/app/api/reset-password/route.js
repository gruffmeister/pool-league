import { NextResponse } from 'next/server';
import {
  DynamoDBClient,
  GetItemCommand,
  DeleteItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export async function POST(req) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ message: 'Missing token or password' }, { status: 400 });
  }

  // Look up token
  const tokenRes = await client.send(
    new GetItemCommand({
      TableName: 'password-reset-tokens',
      Key: { token: { S: token } },
    })
  );

  if (!tokenRes.Item) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
  }

  const email = tokenRes.Item.email.S;

  // Find user by email
  const userRes = await client.send(
    new QueryCommand({
      TableName: 'pool-league-users',
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :e',
      ExpressionAttributeValues: {
        ':e': { S: email },
      },
    })
  );

  if (userRes.Count === 0) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const userId = userRes.Items[0].id.S;

  // Update password (still plaintext here)
  await client.send(
    new UpdateItemCommand({
      TableName: 'pool-league-users',
      Key: { id: { S: userId } },
      UpdateExpression: 'SET password = :p',
      ExpressionAttributeValues: {
        ':p': { S: password },
      },
    })
  );

  // Clean up token
  await client.send(
    new DeleteItemCommand({
      TableName: 'password-reset-tokens',
      Key: { token: { S: token } },
    })
  );

  return NextResponse.json({ message: 'Password updated successfully' });
}
