const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { UpdateCommand, PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { fromEnv } = require("@aws-sdk/credential-providers");
const { v4 } = require('uuid');

const client = new DynamoDBClient({
        region: process.env.AWS_REGION,
        credentials: fromEnv()
    });

const docClient = DynamoDBDocumentClient.from(client);

async function ensureNestedStructure(sessionKey, homeSubSessionKey, awaySubSessionKey) {

    const setSubSessions = {
        [homeSubSessionKey]: {},
        [awaySubSessionKey]: {}
    }

    const command = new UpdateCommand({
      TableName: 'pool-league-scorecard',
      Key: { 
        sessionKey: sessionKey 
      },
      UpdateExpression: 'SET #match = if_not_exists(#match, :emptyMap)',
      ExpressionAttributeNames: {
        '#match': 'matchResult'
      },
      ExpressionAttributeValues: {
        ':emptyMap': setSubSessions,
      },
      ReturnValues: 'UPDATED_NEW'
    });
  
    try {
      const result = await docClient.send(command);
      console.log('Initial structure created:', result);
      return result;
    } catch (error) {
      console.error('Error creating initial structure:', error);
      throw error;
    }
  }

module.exports = async (id, data) => {

    const sessionKey = v4(); // Generate a unique session key
    const homeSubSessionKey = v4(); // Generate the home team sub-session key
    const awaySubSessionKey = v4(); // Generate the home team sub-session key
    // Define the DynamoDB parameters
    var command = new PutCommand({
        TableName: "pool-league-scorecard",
        Item: {
            sessionKey: sessionKey,
            accountid: id,
            homeTeam: data.homeTeam,
            hometeamid: id,
            homeSubSession: homeSubSessionKey,
            awayteam: data.awayTeam,
            awayteamid: data.awayteamid,
            awaySubSession: awaySubSessionKey,
            date: data.date,
            division: data.division,
            matchType: data.matchType,
            createdAt: new Date().toISOString(),
            matchCompleted: false
        }
    })
    
    try {
        const response = await docClient.send(command);
        console.log(response)
        const nested = await ensureNestedStructure(sessionKey, homeSubSessionKey, awaySubSessionKey)

        console.log(nested)
        // Then create nested match result structure
        return response;
    }
    catch (e) {
        console.log(e)
    }
    
    
}