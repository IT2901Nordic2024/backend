/* global process */

/**
 * Lambda function that stores data comming from the habit tracker (via a topic rule that decodes the message from procol buffers format to JSON)
 * to the appropriate DynamoDB table.
 *
 * The UpdateItemCommand is used because it updates an existing item or creates a new one if it does not already exist.
 *
 * Sources:
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/UpdateItemCommand/
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

export const handler = async (event) => {
  // Defining working variables
  let user
  let userID
  let habit
  let habitType
  let newPayload = []
  const habitID = Number(event.payload.habitId)

  // Table names
  const habitEventTableName = process.env.HABIT_EVENT_TABLENAME
  const userDataTable = process.env.USER_DATA_TABLENAME

  // DynamoDB client
  const dynamoDBClient = new DynamoDBClient({})
  const docClient = DynamoDBDocumentClient.from(dynamoDBClient)

  /**
   * To store or update habit data in the habitEventTable we need the userID of the user to whom the device belongs from which
   * the habit data is sent.
   */

  /**
   * Get userData
   *
   *
   * Sources:
   * https://www.youtube.com/watch?v=94kLlixSxfY
   * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.ReadItem.html
   * */
  try {
    const getUserData = new QueryCommand({
      TableName: userDataTable,
      IndexName: 'deviceIdIndex',
      KeyConditionExpression: 'deviceId = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': event.deviceId,
      },
    })

    user = await docClient.send(getUserData)
    userID = user.Items[0].userId
    habit = user.Items[0].habits.filter((habit) => {
      return habit.habitId === habitID
    })[0]
    habitType = habit.habitType
  } catch (error) {
    console.log('Error: ', error)
  }

  /**
   * Create the payload to be saved to the database, based on event.payload
   */

  // Remove habit_id from payload before storing it in the database, because it should not be stored under habitEvents
  delete event.payload.habitId
  switch (habitType) {
    case 'COUNT':
      newPayload = [event.payload.deviceTimestamp, event.payload.data]
      console.log('COUNT')
      break

    case 'TIME':
      newPayload = [event.payload.startTimestamp, event.payload.stopTimestamp]
      console.log('TIME')
      break
    default:
      throw new Error(`No habit of this type ${habitType} of this kind`)
  }

  /**
   * Update habit event data
   *
   *
   * Sources:
   * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.UpdateItem.html
   * https://how.wtf/dynamodb-error-key-element-does-not-match-the-schema.html
   *
   *   */
  const updateHabitEvent = new UpdateCommand({
    TableName: habitEventTableName,
    Key: {
      userId: userID,
      habitId: habitID,
    },
    UpdateExpression: 'SET habitEvents = list_append(habitEvents,:habitEvent)',
    ExpressionAttributeValues: {
      ':habitEvent': [newPayload],
    },
  })

  const response = await docClient.send(updateHabitEvent)
  console.log('response:', response)

  return event
}
