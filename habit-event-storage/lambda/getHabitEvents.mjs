/* global process */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'

// Initializing database clients for sending requests
const client = new DynamoDBClient()
const dynamo = new DynamoDBDocumentClient(client)

// Function for testing if a string is a valid number
const isInt = (testString) => {
  return !isNaN(testString) //&& !isNaN(parseInt(testString))
}

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }

  try {
    // Validates if habitId and userId are numbers
    if (!isInt(event.pathParameters.userId)) {
      throw 'userId must be a number'
    }

    if (!isInt(event.pathParameters.habitId)) {
      throw 'habitId must be a number'
    }

    // Sends get-rquest to database and stores the response in body
    body = await dynamo.send(
      new GetCommand({
        TableName: process.env.TABLENAME,
        Key: {
          userId: Number(event.pathParameters.userId),
          habitId: Number(event.pathParameters.habitId),
        },
      })
    )

    // Extracts relevant data from body
    body = body.Item
  } catch (error) {
    // Returns error if somethin gwent wrong
    statusCode = 400
    body = error
  } finally {
    body = JSON.stringify(body)
  }

  // Returns final response
  return { statusCode, body, headers }
}
