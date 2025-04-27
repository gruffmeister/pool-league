const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { fromEnv } = require("@aws-sdk/credential-providers");

const client = new DynamoDBClient({
        region: process.env.AWS_REGION,
        credentials: fromEnv()
    });

const docClient = DynamoDBDocumentClient.from(client);

module.exports = async (id, data) => {

    var command = new PutCommand({
        TableName: "pool-teams",
        Item: {
            accountid : id,
            teamName: data.teamName,
            players : data.names.map((name) => {
                return name.firstName + " " + name.lastName
            })
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