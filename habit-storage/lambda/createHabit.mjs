import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

// Initiates client communicating with DynamoDB. tableName tells us what table to communicate with
const client = new DynamoDBClient({
    logger: console.log()
});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.HABIT_TABLE_NAME

export const handler = async (event, context) => {
  // Initiating response we will send back to sender
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  const habitTypes = [
    "count",
    "time"
  ]

  try {
  
    switch (event.routeKey) {

      // Creates a new habit for the user
      case "GET /createHabit/{userId}/{deviceId}/{habitName}/{habitType}":
        if (!habitTypes.includes(event.pathParameters.habitType)) {
          body = "invalid habitType. Valid habitTypes are " + habitTypes
          return body
        }
        // habitId må være globalt unikt. Foreløpig er den satt som UserId + DateNow (ikke addert, men ved siden av hverandre)
        const habitId = Number(String(Date.now()) + String(event.pathParameters.userId))
        const newHabit = {
          "habitId": habitId,
          "habitName": event.pathParameters.habitName,
          "type": event.pathParameters.habitType,
          "deviceId": event.pathParameters.deviceId,
        }

        body = await dynamo.send(
          new UpdateCommand({
            TableName: tableName,
            Key: {
              userId: Number(event.pathParameters.userId),
            },
            UpdateExpression: "SET habits = list_append(habits, :newHabit)",
            ExpressionAttributeValues: {
              ":newHabit": [newHabit],
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
