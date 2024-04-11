/**
 * Lambda function that stores data comming from the habit tracker (via a topic rule that decodes the message from procol buffers format to JSON)
 * to the appropriate DynamoDB table.
 *
 * The UpdateItemCommand is used because it updates an existing item or creates a new one if it does not already exist.
 *
 * Sources:
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/UpdateItemCommand/
 */

import { DynamoDB, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PutCommand, DynamoDBDocumentClient, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

export const handler = async (event, context) => {
  console.log('Event:', event)
  console.log('payload: ', event.payload)
  console.log('deviceId: ', event.deviceId)

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
   * Get user ID
   *
   *
   * Sources:
   * https://www.youtube.com/watch?v=94kLlixSxfY
   * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.ReadItem.html
   * */
  const getUserID = new QueryCommand({
    TableName: userDataTable,
    IndexName: 'deviceIdIndex',
    KeyConditionExpression: 'deviceId = :deviceId',
    ExpressionAttributeValues: {
      ':deviceId': event.deviceId,
    },
  })

  const user = await docClient.send(getUserID)
  const userID = user.Items[0].userId
  console.log('userID:', userID)
  console.log('userID type: ', typeof userID)

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
      habitId: event.payload.habitId,
    },
    UpdateExpression: 'SET habitEvents = list_append(habitEvents,:habitEvent)',
    ExpressionAttributeValues: {
      ':habitEvent': [delete event.payload.habitId], // Remove habit_id from payload before storing it in the database, because it should not be stored under habitEvents
    },
  })

  const response = await docClient.send(updateHabitEvent)
  console.log('response:', response)

  console.log('Hello World')
  return event
}
