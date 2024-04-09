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
import { PutCommand, DynamoDBDocumentClient, UpdateCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

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

  const userID = await docClient.send(getUserID)
  console.log(userID)

  /**
   * Update habit event data
   *
   *
   * Sources:
   * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.UpdateItem.html
   *
   * 
  const updateHabitEvent = new UpdateCommand({
    TableName: habitEventTableName,
    Key: {
      userId: { N: userID },
    },
    UpdateExpression: '',
  })
  */

  console.log('Hello World')
  console.log(event)
  return event
}
