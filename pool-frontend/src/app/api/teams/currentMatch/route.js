import {
    DynamoDBClient,
    UpdateItemCommand,
  } from '@aws-sdk/client-dynamodb';
  import { NextResponse } from 'next/server';
  
  const client = new DynamoDBClient({ region: 'eu-west-2' });
  
  export async function POST(req) {
    try {
      const body = await req.json();
      const { sessionKey, teamIds } = body;
      console.log(body)
      const firstTeam = body.firstTeam;
      const secTeam = body.secTeam;
  
      if (!sessionKey || !Array.isArray(teamIds) || teamIds.length !== 2) {
        return NextResponse.json({ message: 'Missing or invalid input' }, { status: 400 });
      }
  
      const [homeTeamId, awayTeamId] = teamIds;
  
      // Update home team
      await client.send(
        new UpdateItemCommand({
          TableName: 'pool-league-teams',
          Key: { id: { S: homeTeamId } },
          UpdateExpression: 'SET currentMatch = :sessionKey, homeAway = :home',
          ExpressionAttributeValues: {
            ':sessionKey': { S: sessionKey },
            ':home': { S: firstTeam },
          },
        })
      );
  
      // Update away team
      await client.send(
        new UpdateItemCommand({
          TableName: 'pool-league-teams',
          Key: { id: { S: awayTeamId } },
          UpdateExpression: 'SET currentMatch = :sessionKey, homeAway = :away',
          ExpressionAttributeValues: {
            ':sessionKey': { S: sessionKey },
            ':away': { S: secTeam },
          },
        })
      );
  
      return NextResponse.json({ message: 'Both teams updated successfully' }, { status: 200 });
    } catch (err) {
      console.error('Error updating teams:', err);
      return NextResponse.json({ message: 'Failed to update teams' }, { status: 500 });
    }
  }
  