/* global process */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { IoTDataPlaneClient, GetThingShadowCommand, UpdateThingShadowCommand } from '@aws-sdk/client-iot-data-plane'
import { Buffer } from 'buffer'

// Initiates client communicating with DynamoDB. tableName tells us what table to communicate with
const iotClient = new IoTDataPlaneClient({})
const ddbclient = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(ddbclient)
const userDataTableName = process.env.USER_DATA_TABLENAME
const habitEventTableName = process.env.HABIT_EVENT_TABLENAME

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body = {}
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }
  // Initiates variables that will be shared accross different try-catch statements
  let iotShadow
  let deviceSide = null
  let habits
  let habitIndex
  let deviceId

  // Gets userdata, and extracts habitIndex and deviceId
  try {
    const userData = await dynamo.send(
      new GetCommand({
        TableName: userDataTableName,
        Key: {
          userId: event.pathParameters.userId,
        },
      }),
    )
    deviceId = userData.Item.deviceId
    habits = userData.Item.habits
    let index = 0
    habits.forEach((habit) => {
      if (habit.habitId == event.pathParameters.habitId) {
        habitIndex = index
      }
      index++
    })
    body.index = habitIndex
  } catch (error) {
    statusCode = 400
    body.error = error.message
    body.failure = 'Problem when geting userdata'
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  // Gets shadow of thing, and sets deviceSide to the side that matches the habitId
  try {
    iotShadow = await iotClient.send(
      new GetThingShadowCommand({
        thingName: deviceId,
      }),
    )
    iotShadow = charCodeToJSON(iotShadow.payload).state.desired
    for (let i = 0; i < 12; i++) {
      if (iotShadow[Number(i)] == event.pathParameters.habitId) {
        deviceSide = String(i)
      }
    }
    body.side = deviceSide
  } catch (error) {
    statusCode = 400
    body.error = error.message
    body.failure = 'Problem when getting thing shadow'
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  // Updates shadow of thing, setting habit's corresponding side to point to 0
  if (deviceSide != null) {
    try {
      await iotClient.send(
        new UpdateThingShadowCommand({
          thingName: deviceId,
          payload: new Uint8Array(
            Buffer.from(
              JSON.stringify({
                state: {
                  desired: {
                    [deviceSide]: 0,
                  },
                },
              }),
            ),
          ),
        }),
      )
    } catch (error) {
      statusCode = 400
      body.error = error.message
      body.failure = 'Problem when updating thing shadow'
      body = JSON.stringify(body)
      return { statusCode, body, headers }
    }
  }

  // Deletes all habitEvents related to this userId and habitId
  try {
    await dynamo.send(
      new DeleteCommand({
        TableName: habitEventTableName,
        Key: {
          userId: event.pathParameters.userId,
          habitId: Number(event.pathParameters.habitId),
        },
      }),
    )
  } catch (error) {
    statusCode = 400
    body.error = error.message
    body.failure = 'Problem when deleting habitevent data'
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  // Sends a updatecommand to delete the habit from userData
  try {
    await dynamo.send(
      new UpdateCommand({
        TableName: userDataTableName,
        Key: {
          userId: event.pathParameters.userId,
        },
        UpdateExpression: `REMOVE habits[${habitIndex}]`,
      }),
    )
  } catch (error) {
    statusCode = 400
    body.error = error.message
    body.failure = 'Problem when deleting from habit from user data'
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  body = 'Success!'
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
