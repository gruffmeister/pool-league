import AWS from 'aws-sdk';
import { NextResponse } from 'next/server';

// Initialize DynamoDB DocumentClient
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE_NAME; // Set your DynamoDB table name here

async function ensureNestedStructure(sessionKey, subSessionKey) {
    const params = {
      TableName: 'pool-league-scorecard',
      Key: { 
        sessionKey: sessionKey 
      },
      UpdateExpression: 'SET #match = if_not_exists(#match, :emptyMap)',
      ExpressionAttributeNames: {
        '#match': 'matchResult'
      },
      ExpressionAttributeValues: {
        ':emptyMap': {}
      },
      ReturnValues: 'UPDATED_NEW'
    };
  
    try {
      const result = await dynamoDB.update(params).promise();
      console.log('Initial structure created:', result);
      return result;
    } catch (error) {
      console.error('Error creating initial structure:', error);
      throw error;
    }
  }
  
  // Second update: Set the specific subsession data
  async function updateMatchData(sessionKey, subSessionKey, matchData) {
    const params = {
      TableName: 'pool-league-scorecard',
      Key: { 
        sessionKey: sessionKey 
      },
      UpdateExpression: 'SET #match.#subSession = :data',
      ExpressionAttributeNames: {
        '#match': 'matchResult',
        '#subSession': subSessionKey
      },
      ExpressionAttributeValues: {
        ':data': matchData
      },
      ReturnValues: 'UPDATED_NEW'
    };
  
    try {
      const result = await dynamoDB.update(params).promise();
      console.log('Match data updated:', result);
      return result;
    } catch (error) {
      console.error('Error updating match data:', error);
      throw error;
    }
  }
  
  // Usage example
  async function saveMatchResult(sessionKey, subSessionKey, data) {
    try {
      // First ensure the structure exists
      await ensureNestedStructure(sessionKey, subSessionKey);
      
      // Then update the specific nested attribute
      return await updateMatchData(sessionKey, subSessionKey, data);
    } catch (error) {
      console.error('Failed to save match result:', error);
      throw error;
    }
  }

export async function POST(req) {
 
    const { searchParams } = new URL(req.url);
    const sessionKey = searchParams.get("sessionKey");
    const subSessionKey = searchParams.get("subSessionKey");

    if (!sessionKey || !subSessionKey) {
      return NextResponse.json({ error: "Missing sessionKey or subSessionKey" }, { status: 400 });
    }

    const matchData = await req.json();

    console.log(matchData)
  try {
    await saveMatchResult(sessionKey, subSessionKey, matchData)
    console.log("Match result saved " );
    return NextResponse.json({ message: 'Form data saved successfully', sessionKey: sessionKey }, { status: 200 });
  } catch (error) {
    console.error("DynamoDB error:", error);
    return NextResponse.json({ error: "Failed to save match result" }, { status: 500 });
  }
}
