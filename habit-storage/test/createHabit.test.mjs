import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/createHabit.mjs'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { expect, describe, beforeEach, it } from '@jest/globals'

// Making mocks of the different clients
const ddbMock = mockClient(DynamoDBDocumentClient)
const iotMock = mockClient(IoTDataPlaneClient)

// Creates event that works
let event = {
  routeKey: 'PUT /createHabit/{userId}/{deviceId}/{habitName}/{habitType}/{deviceSide}',
  pathParameters: {
    userId: '0',
    deviceId: 'TestDevice',
    habitName: 'Testing lambda handlers',
    habitType: 'count',
    deviceSide: '3',
  },
}

// Resets clients between tests
beforeEach(() => {
  event = {
    routeKey: 'PUT /createHabit/{userId}/{deviceId}/{habitName}/{habitType}/{deviceSide}',
    pathParameters: {
      userId: '0',
      deviceId: 'TestDevice',
      habitName: 'Testing lambda handlers',
      habitType: 'count',
      deviceSide: '3',
    },
  }
})

describe('works with the correct deviceSide and habitType', () => {
  it('fails unsupported route succesfully', async () => {
    //ddbMock.on(GetCommand).resolves(true)
    ddbMock.on(UpdateCommand).resolves({
      $metadata: {
        privateMetadata: 'very private metadata',
      },
    })
    iotMock.onAnyCommand().resolves({})
    const response = await handler(event)
    expect(response).toEqual({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '"All actions completed successfully"',
    })
  })

  it('Fails when deviceSide is too low', async () => {
    event.pathParameters.deviceSide = -1
    ddbMock.on(UpdateCommand).resolves({
      $metadata: {
        privateMetadata: 'very private metadata',
      },
    })
    iotMock.onAnyCommand().resolves({})
    const response = await handler(event)
    expect(response).toEqual({
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '"invalid deviceSide. Must be a number between 0 and 11. DeviceSide -1 was provided"',
    })
  })

  it('Fails when deviceSide is too high', async () => {
    event.pathParameters.deviceSide = 12
    ddbMock.on(UpdateCommand).resolves({
      $metadata: {
        privateMetadata: 'very private metadata',
      },
    })
    iotMock.onAnyCommand().resolves({})
    const response = await handler(event)
    expect(response).toEqual({
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '"invalid deviceSide. Must be a number between 0 and 11. DeviceSide 12 was provided"',
    })
  })

  it('Fails when deviceSide is too high', async () => {
    event.pathParameters.habitType = 'tests_written'
    ddbMock.on(UpdateCommand).resolves({
      $metadata: {
        privateMetadata: 'very private metadata',
      },
    })
    iotMock.onAnyCommand().resolves({})
    const response = await handler(event)
    expect(response).toEqual({
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '"invalid habitType. Valid habitTypes are count and time. habitType tests_written was provided"',
    })
  })

  it('Handles spaces in URL correctly', async () => {
    // TODO
  })
})
