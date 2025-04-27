const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { UpdateCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { fromEnv } = require("@aws-sdk/credential-providers");
const { v4 } = require('uuid');

const client = new DynamoDBClient({
        region: process.env.AWS_REGION,
        credentials: fromEnv()
    });

const docClient = DynamoDBDocumentClient.from(client);

module.exports = async (id, data) => {


    // Define the DynamoDB parameters
    var command = new UpdateCommand({
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
    })
    
    try {
        const response = await docClient.send(command);
        return response;
    }
    catch (e) {
        console.log(e)
    }
    
    
}