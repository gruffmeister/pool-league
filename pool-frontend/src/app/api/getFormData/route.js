export const dynamic = "force-dynamic"; 

import AWS from 'aws-sdk';
import { NextResponse } from 'next/server';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE_NAME;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionKey = searchParams.get("sessionKey");

    if (!sessionKey) {
      return NextResponse.json({ error: "Session key is required" }, { status: 400 });
    }

    const params = {
      TableName: tableName,
      Key: { sessionKey },
    };

    const data = await dynamoDB.get(params).promise();

    if (!data.Item) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    return NextResponse.json(data.Item);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



// export async function GET(request) {
//   const { sessionKey } = request.query;

//   const params = {
//     TableName: tableName,
//     Key: {
//       sessionKey: sessionKey,
//     },
//   };

//   try {
//     const result = await dynamoDB.get(params).promise();
//     if (result.Item) {
//       return NextResponse.json({ message: 'Form data saved successfully', sessionKey: sessionKey }, { status: 200 });
//     } else {
//       return NextResponse.json({ message: 'Data not found for session key' }, { status: 404 });
//     }
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     return NextResponse.json({ message: 'Error fetching data' }, { status: 500 });
//   }
// };