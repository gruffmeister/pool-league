import AWS from 'aws-sdk';
import { NextResponse } from 'next/server';

// Initialize DynamoDB DocumentClient
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE_NAME; // Set your DynamoDB table name here

export async function POST(req) {
 
    const { searchParams } = new URL(req.url);
    const sessionKey = searchParams.get("sessionKey");
    const subSessionKey = searchParams.get("subSessionKey");

    if (!sessionKey || !subSessionKey) {
      return NextResponse.json({ error: "Missing sessionKey or subSessionKey" }, { status: 400 });
    }

    const matchData = await req.json();

    const params = {
      TableName: "pool-league-scorecard",
      Key: {
        'sessionKey' : sessionKey
      },
      UpdateExpression: "set #match.#subSession = :data",
      ExpressionAttributeNames: {
        "#match": "matchResult",
        "#subSession": subSessionKey
      },
      ExpressionAttributeValues: {
        ":data": matchData
      }
    };

    console.log(matchData)
    console.log(params)
  try {
    result = await dynamoDB.update(params).promise();
    console.log("Match result saved ", result );
    return result
  } catch (error) {
    console.error("DynamoDB error:", error);
    return NextResponse.json({ error: "Failed to save match result" }, { status: 500 });
  }
}
