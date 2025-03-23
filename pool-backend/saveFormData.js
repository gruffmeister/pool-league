const AWS = require('aws-sdk');
const uuid = require('uuid'); // To generate session IDs

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'pool-league-scorecard'; // Define your DynamoDB table

exports.handler = async (event) => {
  const { date, division, matchType } = JSON.parse(event.body);

  // Generate a session key
  const sessionKey = uuid.v4();

  // Save the data to DynamoDB
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
    await dynamoDB.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Data saved successfully!',
        sessionKey: sessionKey, // Send back the session key
      }),
    };
  } catch (error) {
    console.error('Error saving data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error saving data' }),
    };
  }
};
