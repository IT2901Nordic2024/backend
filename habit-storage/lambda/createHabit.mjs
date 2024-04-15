/* global process, Buffer */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { IoTDataPlaneClient, UpdateThingShadowCommand } from '@aws-sdk/client-iot-data-plane'

// Initiates client communicating with DynamoDB. tableName tells us what table to communicate with
const ddbclient = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(ddbclient)
const UserDataTableName = process.env.USER_DATA_TABLENAME
const habitEventTableName = process.env.HABIT_EVENT_TABLENAME

const iotClient = new IoTDataPlaneClient({})

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }

  // The types of habits this function can add
  const habitTypes = ['count', 'time']

  // creating habitId. It is just the timestamp for when this was invoked
  const habitId = Date.now()

  try {
    // Validates if all the pathParameters are covered
    //console.log(event.cat)
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

    await ddbclient.send(
      new PutCommand({
        TableName: habitEventTableName,
        Item: {
          userId: event.pathParameters.habitId,
          habitId: habitId,
          habitEvents: [],
        },
      }),
    )

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

    // Data habit that will be added to the table
    const newHabit = {
      habitId: habitId,
      habitName: event.pathParameters.habitName,
      habitType: event.pathParameters.habitType.toUpperCase(),
    }

    // Sends a message to DynamoDB, making it add newHabit to a users habits
    await dynamo.send(
      new UpdateCommand({
        TableName: UserDataTableName,
        Key: {
          userId: Number(event.pathParameters.userId),
        },
        UpdateExpression: 'SET habits = list_append(habits, :newHabit)',
        ExpressionAttributeValues: {
          ':newHabit': [newHabit],
        },
      }),
    )

    body = 'All actions completed successfully'
  } catch (err) {
    statusCode = 400
    body = err
  } finally {
    // Makes the body recieved usable
    body = JSON.stringify(body)
  }

  // Returning response to sender
  return {
    statusCode,
    body,
    headers,
  }
}
