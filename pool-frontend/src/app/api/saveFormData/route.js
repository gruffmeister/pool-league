import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

// Initialize DynamoDB DocumentClient
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE_NAME; // Set your DynamoDB table name here

export async function POST(request) {

    const { date, division, matchType } = await request.json();

    const sessionKey = uuidv4(); // Generate a unique session key

    // Define the DynamoDB parameters
    const params = {
      TableName: tableName,
      Item: {
        sessionKey: sessionKey,
        date: date,
        division: division,
        matchType: matchType,
        createdAt: new Date().toISOString(),
      },
    };

    try {
      // Save the data to DynamoDB
      await dynamoDB.put(params).promise();

      // Return the session key in the response
      return NextResponse.json({ message: 'Form data saved successfully', sessionKey: sessionKey }, { status: 200 });
    } catch (error) {
      console.error('Error saving form data:', error);
      return NextResponse.json({ message: 'Error saving form data' }, { status: 500 });

    }
};
