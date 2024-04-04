import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/getHabitEventFromUser.mjs'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { beforeEach, describe, it, expect } from '@jest/globals'

// Creating mockclient
const ddbMock = mockClient(DynamoDBDocumentClient)

//Initializing event
let event

// Resets event before every test to make testing different alterations easier
beforeEach(() => {
  ddbMock.on(QueryCommand).resolves({ $metadata: 'You should not get this data', Items: 'HabitEvents' })
  event = {
    pathParameters: {
      userId: 0,
    },
  }
})

describe('UpdateHabitEventFunction', () => {
  it('Returns 200 ok for acceptable event', async () => {
    // event.pathParameters.userId = '0'
    console.log('event: ', event)
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
  })
  it('Returns item for acceptable event', async () => {
    event.pathParameters.userId = 0
    const response = await handler(event)
    expect(response.body).toEqual('"HabitEvents"')
  })
  it('Returns 400 if GetCommand gets rejected', async () => {
    ddbMock.on(QueryCommand).rejects('Not allowed')
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual('{}')
  })
  it('Returns 400 if userId isnt a number', async () => {
    event.pathParameters.userId = 'FrodeFrydefull'
    const response = await handler(event)
    console.log(event.userId)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual('"userId must be a number"')
  })
})
