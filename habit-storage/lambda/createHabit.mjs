/* global process, Buffer */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { IoTDataPlaneClient, UpdateThingShadowCommand } from '@aws-sdk/client-iot-data-plane' // ES Modules import

// Initiates client communicating with DynamoDB. tableName tells us what table to communicate with
const ddbclient = new DynamoDBClient({
  logger: console.log(),
})
const dynamo = DynamoDBDocumentClient.from(ddbclient)
const tableName = process.env.HABIT_TABLE_NAME

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
      throw `invalid deviceSide. Must be a number between 0 and 12. DeviceSide ${event.pathParameters.deviceSide} was provided`
    }

    // creating habitId. It is just the timestamp for when this was invoked
    const habitId = Date.now()

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
      habitType: event.pathParameters.habitType,
      deviceId: event.pathParameters.deviceId,
    }

    // Sends a message to DynamoDB, making it add newHabit to a users habits
    await dynamo.send(
      new UpdateCommand({
        TableName: tableName,
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
