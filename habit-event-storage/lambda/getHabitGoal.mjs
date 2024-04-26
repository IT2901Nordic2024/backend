/* global process */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient()
const dynamo = new DynamoDBDocumentClient(client)

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body = {}
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }
  let getCommandResponse
  const tableName = process.env.TABLENAME

  try {
    // Sends a message to DynamoDB, getting habitgoal from given habit
    getCommandResponse = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          userId: event.pathParameters.userId,
          habitId: Number(event.pathParameters.habitId),
        },
        ProjectionExpression: 'habitGoal',
      })
    )
  } catch (error) {
    statusCode = 400
    body.error = error
    body.failure = 'Failure when getting habit goal'
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  body = getCommandResponse.Item
  body = JSON.stringify(body)

  return { statusCode, body, headers }
}
