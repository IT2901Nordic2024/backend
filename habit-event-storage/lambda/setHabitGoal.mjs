/* global process */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body = {}
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }
  const tableName = process.env.TABLENAME
  const client = new DynamoDBClient()
  const dynamo = new DynamoDBDocumentClient(client)

  try {
    // Data habit that will be added to the table
    const newHabitGoal = {
      question: event.pathParameters.question,
      target: event.pathParameters.target,
      unit: event.pathParameters.unit,
      frequency: event.pathParameters.frequency,
    }

    // Sends a message to DynamoDB, making the habitGoal attribute newHabitGoal
    await dynamo.send(
      new UpdateCommand({
        TableName: tableName,
        Key: {
          userId: event.pathParameters.userId,
          habitId: Number(event.pathParameters.habitId),
        },
        UpdateExpression: `SET habitGoal = :habitGoal`,
        ExpressionAttributeValues: {
          ':habitGoal': newHabitGoal,
        },
      })
    )
  } catch (error) {
    statusCode = 400
    body.error = error
    body.failure = 'Failure when setting habit goal'
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  body.message = 'Success!'
  body = JSON.stringify(body)

  return { statusCode, body, headers }
}
