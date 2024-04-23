/* global process */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient()
const dynamo = new DynamoDBDocumentClient(client)

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }

  try {
    body = await dynamo.send(
      new UpdateCommand({
        TableName: process.env.TABLENAME,
        Key: {
          userId: event.pathParameters.userId,
          habitId: event.pathParameters.habitId,
        },

        UpdateExpression: 'SET habitEvents = list_append(habitEvents, :updatedHabit)',
        ExpressionAttributeValues: {
          ':habitEvents': event.pathParameters.userId,
        },
      })
    )
    body = body.Items
  } catch (error) {
    statusCode = 400
    body = error
  } finally {
    body = JSON.stringify(body)
  }

  return { statusCode, body, headers }
}
