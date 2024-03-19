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

const successfulEvent = {
  routeKey: 'GET /habits/{userId}',
  pathParameters: '0',
}

describe('gets all habits from user 0', () => {
  it('should get user names from the DynamoDB', async () => {
    //ddbMock.on(GetCommand).resolves(true)
    ddbMock.on(GetCommand).resolves({
      $metadata: {
        privateMetadata: 'very private metadata',
      },
      Item: { response: 'response' },
    })
    const response = await handler(successfulEvent)
    expect(response).toEqual({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"response":"response"}',
    })
  })
})

const unsupportedRouteGet = {
  routeKey: 'GET /unsupported-route/{userId}',
  pathParameters: '0',
}

describe('Does not work with unsupported route', () => {
  it('fails unsupported route succesfully', async () => {
    //ddbMock.on(GetCommand).resolves(true)
    ddbMock.on(GetCommand).resolves({
      $metadata: {
        privateMetadata: 'very private metadata',
      },
      Item: { response: 'response' },
    })
    const response = await handler(unsupportedRouteGet)
    expect(response).toEqual({
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '"Unsupported route: \\"GET /unsupported-route/{userId}\\""',
    })
  })

  it('Handles spaces in the URL correctly', async () => {
    // TODO
  })
})
