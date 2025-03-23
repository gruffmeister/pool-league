import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from 'next/server';

const client = new DynamoDBClient({ region: "eu-west-2" });
const docClient = DynamoDBDocumentClient.from(client);

export async function getEntriesBySessionKey(sessionKey) {
  const command = new QueryCommand({
    TableName: "pool-league-scorecard",
    KeyConditionExpression: "sessionKey = :sessionKeyVal",
    ExpressionAttributeValues: {
      ":sessionKeyVal": sessionKey,
    },
  });

  try {
    const { Items } = await docClient.send(command);
    return Items || [];
  } catch (error) {
    console.error("Error querying DynamoDB:", error);
    return [];
  }
}



export async function getEntriesByDate(date) {
  const command = new ScanCommand({
    TableName: "pool-league-scorecard",
    FilterExpression: "date = :dateVal",
    ExpressionAttributeValues: {
      ":dateVal": date,
    },
  });

  try {
    const { Items } = await docClient.send(command);
    return Items || [];
  } catch (error) {
    console.error("Error scanning DynamoDB:", error);
    return [];
  }
}

export async function getEntriesByDivision(division) {
    const command = new ScanCommand({
      TableName: "pool-league-scorecard",
      FilterExpression: "division = :divisionVal",
      ExpressionAttributeValues: {
        ":divisionVal": division,
      },
    });
  
    try {
      const { Items } = await docClient.send(command);
      return Items || [];
    } catch (error) {
      console.error("Error scanning DynamoDB:", error);
      return [];
    }
  }

  export async function GET(req) {
    try {
      const { searchParams } = new URL(req.url);
      const division = searchParams.get("division");

      const data = await getEntriesByDivision(division)
  
    //   if (!data.Item) {
    //     return NextResponse.json({ error: "No data found" }, { status: 404 });
    //   }
      console.log(data)
      return NextResponse.json(data);
    } catch (error) {
        console.log(error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
