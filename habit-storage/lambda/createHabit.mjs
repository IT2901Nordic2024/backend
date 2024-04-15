/* global process, Buffer */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { IoTDataPlaneClient, UpdateThingShadowCommand } from '@aws-sdk/client-iot-data-plane'

// Initiates client communicating with DynamoDB. tableName tells us what table to communicate with
const ddbclient = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(ddbclient)
const userDataTableName = process.env.USER_DATA_TABLENAME
const habitEventTableName = 'HabitEventTable'

const iotClient = new IoTDataPlaneClient({})

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body = {}
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }

  // The types of habits this function can add
  const habitTypes = ['count', 'time']

  // creating habitId. It is just the timestamp for when this was invoked
  const habitId = Date.now()

  // Data habit that will be added to the table
  const newHabit = {
    habitId: habitId,
    habitName: event.pathParameters.habitName,
    habitType: event.pathParameters.habitType.toUpperCase(),
  }

  try {
    // Validates if all the pathParameters are covered
    if (event.routeKey == undefined || event.pathParameters == undefined) {
      throw 'routeKey or pathParameters are undefined'
    }

    // Validates if the type of tracking is supported
    if (!habitTypes.includes(event.pathParameters.habitType)) {
      throw `invalid habitType. Valid habitTypes are ${habitTypes[0]} and ${habitTypes[1]}. habitType ${event.pathParameters.habitType} was provided`
    }

    // Validates if the deviceside exists on the device
    if (Number(event.pathParameters.deviceSide) < 0 || Number(event.pathParameters.deviceSide) > 11) {
      throw `invalid deviceSide. Must be a number between 0 and 11. DeviceSide ${event.pathParameters.deviceSide} was provided`
    }

    // Adds a item to HabitEventTable, so we can store habitEvents at a later time
    await dynamo.send(
      new PutCommand({
        TableName: habitEventTableName,
        Item: {
          userId: Number(event.pathParameters.userId),
          habitId: habitId,
          habitEvents: [],
        },
      }),
    )
  } catch (error) {
    statusCode = 400
    body.error = error
    body.failure = 'Failure when creating item in HabitEventTable'
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  try {
    //Command for updating shadow. Sends this before dynamodb command, because this one is stricter
    await iotClient.send(
      new UpdateThingShadowCommand({
        thingName: event.pathParameters.deviceId,
        payload: new Uint8Array(
          Buffer.from(
            JSON.stringify({
              state: {
                desired: {
                  [event.pathParameters.deviceSide]: habitId,
                },
              },
            }),
          ),
        ),
      }),
    )
  } catch (error) {
    statusCode = 400
    body.error = error
    body.failure = 'Failure when updating device shadow'
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  try {
    // Sends a message to DynamoDB, making it add newHabit to a users habits
    await dynamo.send(
      new UpdateCommand({
        TableName: userDataTableName,
        Key: {
          userId: Number(event.pathParameters.userId),
        },
        UpdateExpression: 'SET habits = list_append(habits, :newHabit)',
        ExpressionAttributeValues: {
          ':newHabit': [newHabit],
        },
      }),
    )
  } catch (error) {
    statusCode = 400
    body.error = error
    body.failure = 'Failure when adding habit to user data'
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  // Return message to confirm everything was successful
  body = 'All actions completed successfully'
  body = JSON.stringify(body)

  // Returning response to sender
  return {
    statusCode,
    body,
    headers,
  }
}
