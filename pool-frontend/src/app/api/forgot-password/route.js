import { NextResponse } from 'next/server';
import { DynamoDBClient, QueryCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export async function POST(req) {
  const { emailnorm } = await req.json();

  const email = emailnorm.toLowerCase();
  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  const userCheck = await client.send(
    new QueryCommand({
      TableName: 'pool-league-users',
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :e',
      ExpressionAttributeValues: { ':e': { S: email } },
    })
  );

  if (userCheck.Count === 0) {
    return NextResponse.json({ message: 'If the email exists, a reset link has been sent.' });
  }

  const token = uuidv4();
  const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;

  await client.send(
    new PutItemCommand({
      TableName: 'password-reset-tokens',
      Item: {
        token: { S: token },
        email: { S: email },
        expiresAt: { N: expiresAt.toString() },
      },
    })
  );

  // Dev only: console log the link
  console.log(`Reset link: http://localhost:3000/reset-password?token=${token}`);

  return NextResponse.json({ link: `/reset-password?token=${token}`, message: 'Forwarding to reset page' });
}
