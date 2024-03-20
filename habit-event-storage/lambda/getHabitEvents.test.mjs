import { mockClient } from 'aws-sdk-client-mock'
import { handler } from './getHabitEvents.mjs'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { beforeEach, describe, it, expect } from '@jest/globals'

// Creating mockclient
const ddbMock = mockClient(DynamoDBDocumentClient)
ddbMock.on(GetCommand).resolves({ $metadata: 'You should not get this data', Item: 'HabitEvents' })

//Initializing event
let event

// Resets event before every test to make testing different alterations easier
beforeEach(() => {
  event = {
    pathParameters: {
      userId: 0,
      habitId: 2,
    },
  }
})

describe('It gets data from client in different scenarios', () => {
  it('Gets data from client', async () => {
    const response = await handler(event)
    expect(response).toEqual({
      body: '"HabitEvents"',
      headers: { 'Content-Type': 'application/json' },
      statusCode: 200,
    })
  })
})
