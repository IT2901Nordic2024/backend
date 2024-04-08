/* global process */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { IoTDataPlaneClient, GetThingShadowCommand } from '@aws-sdk/client-iot-data-plane'

// Initiates client communicating with DynamoDB. tableName tells us what table to communicate with
const iotClient = new IoTDataPlaneClient({})
const ddbclient = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(ddbclient)
const tableName = process.env.USER_DATA_TABLENAME

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }

  try {
    // Gets a specific tableitem by "userId" and "habitName"
    body = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          userId: Number(event.pathParameters.userId),
        },
      }),
    )
    body = body.Item

    // If the route isn't supported by the API
  } catch (err) {
    statusCode = 400
    body = err.message
    body.fault = 'GetThingShadowCommand'
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  // Create variable for storing habit
  let response

  // Getting unnamed thing shadow from deviceId associated with the user
  try {
    const command = new GetThingShadowCommand({
      thingName: body.deviceId,
    })
    response = await iotClient.send(command)
  } catch (err) {
    response = err.message
    response.fault = 'GetThingShadowCommand'
    response = JSON.stringify(response)
    return { statusCode, response, headers }
  }

  // Converting raw Uint8Array (gibberish) to human readable JSON, and extracting desired state from it
  // let shadowJson = JSON.parse(String.fromCharCode.apply(null, response.payload)).state.desired
  let shadowJson = charCodeToJSON(response.payload).state.desired

  // Creating array fro storing what habit-id belongs to what side
  let sides = []

  // Adds all habit-ids, where the index represents what side it belongs to. If a side isnt associated with a habit, the
  // related index will be null.
  for (let i = 0; i < 12; i++) {
    if (shadowJson[i] != null) {
      sides.push(shadowJson[i])
    } else {
      sides.push(null)
    }
  }

  // Extracts all habits from the first query to habits
  const habits = body.habits

  // Matches every habit with every device-side to see if their ids match. If yes, add side = index to the habit
  // Also changes all habittypes to lowercase, due to firmware wanting it to be upper case in database
  habits.forEach((habit) => {
    let index = 0
    habit.habitType = habit.habitType.toLowerCase()
    sides.forEach((side) => {
      if (habit.habitId == side) {
        habit.side = index
      }
      index++
    })
  })

  // Returning response to sender
  body = JSON.stringify(body)
  return {
    statusCode,
    body,
    headers,
  }
}

export const charCodeToJSON = (input) => {
  return JSON.parse(String.fromCharCode.apply(null, input))
}
