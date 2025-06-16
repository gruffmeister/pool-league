import {
    DynamoDBClient,
    UpdateItemCommand,
    PutItemCommand,
  } from '@aws-sdk/client-dynamodb';
  import { NextResponse } from 'next/server';
  
  const client = new DynamoDBClient({ region: 'eu-west-2' });
  
  export async function POST(req) {
    try {
      const body = await req.json();
      const {
        teamId,
        teamName,
        location,
        captain,
        captainPhone,
        players,
        previousCaptain,
        previousPlayers,
      } = body;
  
      if (!teamId || !teamName || !captain || players.length === 0) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
      }
  
      const updateTeamCmd = new UpdateItemCommand({
        TableName: 'pool-league-teams',
        Key: { id: { S: teamId } },
        UpdateExpression:
          'SET teamName = :teamName, #location = :location, captain = :captain, captainPhone = :captainPhone, players = :players',
        ExpressionAttributeNames: {
          '#location': 'location', // alias for reserved keyword
        },
        ExpressionAttributeValues: {
          ':teamName': { S: teamName },
          ':location': { S: location || '' },
          ':captain': { S: captain },
          ':captainPhone': { S: captainPhone },
          ':players': { L: players.map((id) => ({ S: id })) },
        },
      });
      
  
      await client.send(updateTeamCmd);
  
      // === 2. Determine removed and added players ===
      const removedPlayers = previousPlayers.filter((id) => !players.includes(id));
      const addedPlayers = players.filter((id) => !previousPlayers.includes(id));
  
      // === 3. Update removed players ===
      for (const id of removedPlayers) {
        await client.send(
          new UpdateItemCommand({
            TableName: 'pool-league-users',
            Key: { id: { S: id } },
            UpdateExpression: 'REMOVE team, isCaptain',
          })
        );
      }
  
      // === 4. Update added players ===
      for (const id of addedPlayers) {
        await client.send(
          new UpdateItemCommand({
            TableName: 'pool-league-users',
            Key: { id: { S: id } },
            UpdateExpression: 'SET team = :teamName',
            ExpressionAttributeValues: {
              ':teamName': { S: teamName },
            },
          })
        );
      }
  
      // === 5. Update captain flags ===
      if (previousCaptain !== captain) {
        // Remove old captain flag
        await client.send(
          new UpdateItemCommand({
            TableName: 'pool-league-users',
            Key: { id: { S: previousCaptain } },
            UpdateExpression: 'REMOVE isCaptain',
          })
        );
  
        // Set new captain flag
        await client.send(
          new UpdateItemCommand({
            TableName: 'pool-league-users',
            Key: { id: { S: captain } },
            UpdateExpression: 'SET isCaptain = :trueVal',
            ExpressionAttributeValues: {
              ':trueVal': { BOOL: true },
            },
          })
        );
      }
  
      return NextResponse.json({ message: 'Team updated successfully' }, { status: 200 });
    } catch (err) {
      console.error('Error updating team:', err);
      return NextResponse.json({ message: 'Failed to update team' }, { status: 500 });
    }
  }
  