/* eslint-disable */

import { handler } from '../lambda/getHabits.mjs'
import { mockClient } from 'aws-sdk-client-mock'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

//const ddbMock = mockClient(DynamoDBDocumentClient)
//const tableName = process.env.HABIT_TABLE_NAME

const ddbMock = mockClient(DynamoDBDocumentClient)

beforeEach(() => {
  ddbMock.reset()
})

it('should get user names from the DynamoDB', async () => {
  ddbMock.on(GetCommand).resolves({
    Item: { id: 'user1', name: 'John' },
  })
  const names = await getUserNames(['user1'])
  expect(names).toStrictEqual(['John'])
})
