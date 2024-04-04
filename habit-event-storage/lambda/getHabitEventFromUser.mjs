/* global process */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient()
const dynamo = new DynamoDBDocumentClient(client)

// Function for testing if a string is a valid number
const isInt = (testString) => {
  return !isNaN(testString) //&& !isNaN(parseInt(testString))
}

export const handler = async (event) => {
  // Initiating response we will send back to sender
  console.log(event.pathParameters)
  let body
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }

  try {
    if (!isInt(event.pathParameters.userId)) {
      throw 'userId must be a number'
    }

    body = await dynamo.send(
      new QueryCommand({
        TableName: process.env.TABLENAME,

        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': Number(event.pathParameters.userId),
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
