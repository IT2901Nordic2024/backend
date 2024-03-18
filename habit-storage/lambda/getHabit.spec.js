/* eslint-disable */

//import { handler } from '../lambda/getHabits.mjs'
// import { mockClient } from 'aws-sdk-client-mock'
const { mockClient } = require('aws-sdk-client-mock')
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb')
const { describe } = require('node:test')
const { handler } = require('./getHabits.mjs')
//import * as m from './getHabits.mjs'
//import handler = require('./getHabits.mjs')

//import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

//const ddbMock = mockClient(DynamoDBDocumentClient)
//const tableName = process.env.HABIT_TABLE_NAME

const event = {}

function add(a, b) {
  return a + b
}

const ddbMock = mockClient(DynamoDBDocumentClient)

beforeEach(() => {
  ddbMock.reset()
})

describe('gets all habits', () => {
  it('should get user names from the DynamoDB', async () => {
    //ddbMock.on(GetCommand).resolves(true)
    ddbMock.on(GetCommand).resolves({
      Items: [{ habit: coffee }],
    })
    const response = await m.handler(event)
    expect(response).toBe({
      Items: [{ habit: coffee }],
    })
  })
})
