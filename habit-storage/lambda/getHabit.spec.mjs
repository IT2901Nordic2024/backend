/* eslint-disable */

//import { handler } from '../lambda/getHabits.mjs'
import { mockClient } from 'aws-sdk-client-mock'
// const { mockClient } = require('aws-sdk-client-mock')
// const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb')
// const { describe } = require('node:test')
//const { handler } = require('./getHabits.mjs')
import { handler } from './getHabits.mjs'
//import * as m from './getHabits.mjs'
//import handler = require('./getHabits.mjs')

import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'

//const ddbMock = mockClient(DynamoDBDocumentClient)
//const tableName = process.env.HABIT_TABLE_NAME

function add(a, b) {
  return a + b
}

const ddbMock = mockClient(DynamoDBDocumentClient)

beforeEach(() => {
  ddbMock.reset()
})

const event = {
  routeKey: 'GET /habits/{userId}',
  pathParameters: '0',
}

const successfulGet = {
  TableName: 'HabitTable',
  Key: {
    userId: 0,
  },
}

describe('gets all habits', () => {
  it('should get user names from the DynamoDB', async () => {
    //ddbMock.on(GetCommand).resolves(true)
    ddbMock.on(GetCommand).resolves({
      Item: { respone: 'successful response' },
    })
    const response = await handler(event)
    expect(response).toBe({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: { respone: 'successful response' },
    })
  })
})
