const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'pool-leage-scorecard';

exports.handler = async (event) => {
  // Extract sessionKey from the query string parameters
  const { sessionKey } = event.queryStringParameters;

  if (!sessionKey) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'sessionKey is required' }),
    };
  }

  const params = {
    TableName: tableName,
    Key: {
      sessionKey: sessionKey,
    },
  };

  try {
    const result = await dynamoDB.get(params).promise();

    if (result.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Data not found for session key' }),
      };
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching data' }),
    };
  }
};
