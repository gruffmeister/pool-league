import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-2" });

export async function getUserByEmail(email) {
  const command = new GetItemCommand({
    TableName: "pool-league-users",
    Key: {
      email: { S: email },
    },
  });

  const result = await client.send(command);
  if (!result.Item) return null;
  return unmarshall(result.Item);
}
