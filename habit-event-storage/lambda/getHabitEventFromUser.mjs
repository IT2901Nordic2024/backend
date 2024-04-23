/* global process */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

// Initializing database client
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
    // Sends query to database and stores response in body
    body = await dynamo.send(
      new QueryCommand({
        TableName: process.env.TABLENAME,

        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': event.pathParameters.userId,
        },
      })
    )

    // Extracts relevant data from body
    body = body.Items
  } catch (error) {
    // Returns error if something went wrong
    statusCode = 400
    body = error
  } finally {
    // Finishing touch
    body = JSON.stringify(body)
  }

  // Returns data
  return { statusCode, body, headers }
}
