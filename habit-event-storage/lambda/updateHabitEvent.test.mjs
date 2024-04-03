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

describe('UpdateHabitEventFunction', () => {
  it('Returns 200 ok for acceptable event', async () => {
    const response = await handler(event)
    expect(response).toEqual({})
  })
  it('Returns 400 if event doesnt exist', async () => {
    const response = await handler(event)
    expect(response).toEqual({})
  })
  it('Returns 400 if userId isnt a number', async () => {
    const response = await handler(event)
    expect(response).toEqual({})
  })
  it('Returns 400 if habitId isnt a number', async () => {
    const response = await handler(event)
    expect(response).toEqual({})
  })
})
