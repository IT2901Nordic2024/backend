/* global process, Buffer */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { GetThingShadowCommand, IoTDataPlaneClient, UpdateThingShadowCommand } from '@aws-sdk/client-iot-data-plane'

// Initiates client communicating with DynamoDB and IoT Core. tableName tells us what table to communicate with
const ddbclient = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(ddbclient)
const tableName = process.env.USER_DATA_TABLENAME
const iotClient = new IoTDataPlaneClient({})

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body = {}
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }
  // Initiates habits and habitIndex to make them accessible outside of conditional statements where they are set
  let habits
  let habitIndex = null
  let iotShadow
  let oldDeviceSide = 'lazy_backend'

  // Updates deiceSide in shadow, only if a numbered deviceSide is sent
  if (isInt(event.pathParameters.deviceSide)) {
    try {
      // Validates if the deviceside exists on the device
      if (Number(event.pathParameters.deviceSide) < 0 || Number(event.pathParameters.deviceSide) > 11) {
        throw `invalid deviceSide. Must be a number between 0 and 11. DeviceSide ${event.pathParameters.deviceSide} was provided`
      }

      iotShadow = await iotClient.send(
        new GetThingShadowCommand({
          thingName: event.pathParameters.deviceId,
        }),
      )

      // Converting raw Uint8Array to human readable JSON
      iotShadow = JSON.parse(String.fromCharCode.apply(null, iotShadow.payload)).state.desired

      for (let i = 0; i < 12; i++) {
        if (iotShadow[Number(i)] == event.pathParameters.habitId) {
          oldDeviceSide = String(i)
        }
      }

      //Command for updating shadow. Sends this before dynamodb command, because this one is stricter
      await iotClient.send(
        new UpdateThingShadowCommand({
          thingName: event.pathParameters.deviceId,
          payload: new Uint8Array(
            Buffer.from(
              JSON.stringify({
                state: {
                  desired: {
                    [oldDeviceSide]: 0,
                    [event.pathParameters.deviceSide]: Number(event.pathParameters.habitId),
                  },
                },
              }),
            ),
          ),
        }),
      )
      console.log(`Successfully updated side ${event.pathParameters.deviceSide}`)
    } catch (error) {
      statusCode = 400
      body.error = error
      body.failure = 'Failure when updating deviceShadow'
      body = JSON.stringify(body)
      return { statusCode, body, headers }
    }
  }

  // Only gets a users habits if habitName isn't noChange
  if (event.pathParameters.habitName != 'noChange') {
    try {
      // Extracts a users habits into variable habits
      habits = await dynamo.send(
        new GetCommand({
          TableName: tableName,
          Key: {
            userId: Number(event.pathParameters.userId),
          },
        }),
      )
      habits = habits.Item.habits

      let index = 0
      habits.forEach((habit) => {
        if (habit.habitId == event.pathParameters.habitId) {
          habitIndex = index
        }
        index++
      })
    } catch (error) {
      statusCode = 400
      body.error = error
      body.failure = 'Failure when getting habits from user'
      body = JSON.stringify(body)
      return { statusCode, body, headers }
    }
  }

  // Will not update habitName if the habit isnt found, or the previous if-statement doesnt fire
  if (habitIndex != null) {
    try {
      // Data habit that will be added to the table
      const editedHabit = {
        habitId: event.pathParameters.habitId,
        habitName: event.pathParameters.habitName,
        habitType: habits[habitIndex].habitType,
      }

      // Sends a message to DynamoDB, replacing the old habit with a new one
      await dynamo.send(
        new UpdateCommand({
          TableName: tableName,
          Key: {
            userId: Number(event.pathParameters.userId),
          },
          UpdateExpression: `SET habits[${habitIndex}] = :newHabit`,
          ExpressionAttributeValues: {
            ':newHabit': editedHabit,
          },
        }),
      )
    } catch (error) {
      statusCode = 400
      body.error = error
      body.failure = 'Failure when updating habit'
      body = JSON.stringify(body)
      return { statusCode, body, headers }
    }
  }

  // Return message if nothing goes wrong
  body = 'The habit was successfully edited'

  // Returning response to sender
  return {
    statusCode,
    body,
    headers,
  }
}

// Function for testing if a string is a valid number
const isInt = (testString) => {
  return !isNaN(testString) && !isNaN(parseInt(testString))
}
