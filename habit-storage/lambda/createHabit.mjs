import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
// ER recommended å bruk from "uuid" i stedet for "uuid/v4", men vscode likte ikke det
import { v4 as uuidv4 } from "uuid/v4";

// Initiates client communicating with DynamoDB. tableName tells us what table to communicate with
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.HABIT_TABLE_NAME
const id = uuidv4()

export const handler = async (event, context) => {
  // Initiating response we will send back to sender
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      // Creates a new habit for the user
      case "GET /habits/{userId}/{deviceId}/{habitName}/{habitType}/":
        body = await dynamo.send(
          new UpdateCommand({
            TableName: tableName,
            Key: {
              userId: Number(event.pathParameters.userId),
            },
            
          })
        );
        body = body.Item;
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
