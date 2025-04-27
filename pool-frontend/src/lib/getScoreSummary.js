// /lib/dynamo.ts

import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export async function getSessionsByParentKey(parentSessionId) {
  const command = new QueryCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'parentSessionId = :sessionKey',
    ExpressionAttributeValues: {
      ':sessionKey': { S: parentSessionId },
    },
  });

  const response = await client.send(command);
  return response.Items?.map(item => unmarshall(item));
}
