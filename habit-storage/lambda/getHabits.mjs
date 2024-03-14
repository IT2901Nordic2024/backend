import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

// Initiates client communicating with DynamoDB. tableName tells us what table to communicate with
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.HABIT_TABLE_NAME

export const handler = async (event, context) => {
  // Initiating response we will send back to sender
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      // Gets a specific tableitem by "userId" and "habitName"
      case "GET /habits/{userId}":
        body = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              userId: Number(event.pathParameters.userId),
            },
          })
        );
        body = body.Item;
        break;

      // Gets the whole table
      case "GET /habits":
        body = await dynamo.send(
          new ScanCommand({ TableName: tableName })
        );
        body = body.Items;
        break;
      // If the route isn't supported by the API
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message
  } 
  // Makes the body recieved usable
    finally {
    body = JSON.stringify(body);
  }
  // Returning response to sender
  return {
    statusCode,
    body,
    headers,
  };
};
