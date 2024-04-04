import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/updateHabitEvent.mjs'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { beforeEach, describe, it, expect } from '@jest/globals'

// Creating mockclient
const ddbMock = mockClient(DynamoDBDocumentClient)

//Initializing event
let event

// Resets event before every test to make testing different alterations easier
beforeEach(() => {
  ddbMock.on(GetCommand).resolves({ $metadata: 'You should not get this data', Item: 'HabitEvents' })
  event = {
    pathParameters: {
      userId: 0,
      habitId: 2,
    },
  }
})

describe('UpdateHabitEventFunction', () => {
  it('Functions with correc input', async () => {
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual('HabitEvents')
  })
  it('Returns 400 if userId isnt a number', async () => {
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual('userId must be a number')
  })
  it('Returns 400 if habitId isnt a number', async () => {
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual('habitId must be a number')
  })
  it('Returns 400 if GetCommand gets rejected', async () => {
    ddbMock.on(GetCommand).rejects('Not allowed')
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual('Whatever error is')
  })
})
