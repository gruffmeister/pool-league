import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });

export async function handler(event) {
    const data = JSON.parse(event.body);
    const command = new PutItemCommand({
        TableName: "MyTable",
        Item: {
            id: { S: data.id },
            value: { S: data.value }
        }
    });

    await client.send(command);
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Data saved" }),
    };
}
