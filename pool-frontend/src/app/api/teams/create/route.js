import { DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
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

    const existingTeam = await client.send(
      new QueryCommand({
        TableName: 'pool-league-teams',
        IndexName: 'teamName-index', // 🛑 Requires a GSI on email!
        KeyConditionExpression: 'teamName = :e',
        ExpressionAttributeValues: {
          ':e': { S: teamName },
        },
      })
    );

    if (existingTeam.Count > 0) {
      return NextResponse.json({ message: 'Team already registered' }, { status: 409 });
    }
    // Save the team info
    const newTeam = {
      id: { S: uuidv4() },
      teamName: { S: teamName.trim() },
      location: { S: location.trim() || '' },
      captain: { S: captain.trim() },
      captainPhone: { S: captainPhone.trim() },
      players: { L: players.map((id) => ({ S: id })) },
      createdAt: { S: new Date().toISOString() }
    };

    await client.send(new PutItemCommand({
      TableName: 'pool-league-teams',
      Item: newTeam
    }));

    // Update each player with the team name and set isCaptain for the captain
    for (const playerId of players) {
      const isCaptain = playerId === captain;

      await client.send(new UpdateItemCommand({
        TableName: 'pool-league-users',
        Key: { id: { S: playerId } },
        UpdateExpression: isCaptain
          ? 'SET team = :teamName, isCaptain = :isCaptain'
          : 'SET team = :teamName',
        ExpressionAttributeValues: isCaptain
          ? {
              ':teamName': { S: teamName },
              ':isCaptain': { BOOL: true }
            }
          : {
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
