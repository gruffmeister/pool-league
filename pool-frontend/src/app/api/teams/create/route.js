import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      teamName,
      location,
      captain,
      captainPhone,
      players // array of user IDs
    } = body;

    if (!teamName || !captain || !captainPhone || players.length === 0) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Save the team info
    const newTeam = {
      id: { S: uuidv4() },
      teamName: { S: teamName },
      location: { S: location || '' },
      captain: { S: captain },
      captainPhone: { S: captainPhone },
      players: { L: players.map((id) => ({ S: id })) },
      createdAt: { S: new Date().toISOString() }
    };

    await client.send(new PutItemCommand({
      TableName: 'pool-league-teams',
      Item: newTeam
    }));

    // Update each player with the team name
    for (const playerId of players) {
      await client.send(new UpdateItemCommand({
        TableName: 'pool-league-users',
        Key: { id: { S: playerId } },
        UpdateExpression: 'SET team = :teamName',
        ExpressionAttributeValues: {
          ':teamName': { S: teamName }
        }
      }));
    }

    return NextResponse.json({ message: 'Team created successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ message: 'Failed to create team' }, { status: 500 });
  }
}
