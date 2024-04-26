import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/setHabitGoal.mjs'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { beforeEach, describe, it, expect } from '@jest/globals'

// Creating mockclient
const ddbMock = mockClient(DynamoDBDocumentClient)

//Initializing event
let event

// Resets event before every test to make testing different alterations easier
beforeEach(() => {
  ddbMock.on(UpdateCommand).resolves()
  resetEvent()
})

describe('UpdateHabitEventFunction', () => {
  it('Returns 200 ok for acceptable event', async () => {
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body).message).toEqual('Success!')
  })
  it('Returns 400 if UpdateCommand gets rejected', async () => {
    ddbMock.on(UpdateCommand).rejects({ message: 'Not allowed' })
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body).failure).toEqual('Failure when setting habit goal')
    expect(JSON.parse(response.body).error.message).toEqual('Not allowed')
  })
})

const resetEvent = () => {
  event = {
    pathParameters: {
      userId: 'FRODEMANN',
      habitId: '2',
      question: 'How many trees did you hug?',
      target: '10',
      unit: 'trees',
      frequency: 'daily',
    },
  }
}
