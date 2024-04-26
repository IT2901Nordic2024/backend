import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/getHabitGoal.mjs'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { expect, describe, beforeEach, it } from '@jest/globals'

// Making mocks of the different clients
const ddbMock = mockClient(DynamoDBDocumentClient)

let event
let getCommandResponse

beforeEach(() => {
  resetEvent()
  resetGetCommandResponse()
  ddbMock.on(GetCommand).resolves(getCommandResponse)
})

describe('a fucntion for getting habit-goals', () => {
  it('Returns habitgoal when the GetCommand resolves', async () => {
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body)).toEqual(getCommandResponse.Item)
  })

  it('Returns response if no Item is returned', async () => {
    getCommandResponse = {}
    ddbMock.on(GetCommand).resolves(getCommandResponse)
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body)).toEqual('No habitgoal found')
  })

  it('Throws error if GetCommand rejects', async () => {
    ddbMock.on(GetCommand).rejects({ message: 'Not allowed!' })
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body).error.message).toEqual('Not allowed!')
    expect(JSON.parse(response.body).failure).toEqual('Failure when getting habit goal')
  })
})

const resetEvent = () => {
  event = {
    pathParameters: {
      userId: 0,
      habitId: 1,
      deviceId: 'deviceThing',
      habitName: 'Tree hugging',
      deviceSide: 3,
    },
  }
}

const resetGetCommandResponse = () => {
  getCommandResponse = {
    $metadata: {
      httpStatusCode: 200,
      requestId: 'WOWOWOWOWO',
      attempts: 1,
      totalRetryDelay: 0,
    },
    Item: {
      habitGoal: {
        unit: 'trees',
        question: 'HowManyTreesHug',
        target: '10',
        frequency: 'daily',
      },
    },
  }
}
