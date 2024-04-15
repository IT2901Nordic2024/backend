import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/createHabit.mjs'
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { expect, describe, beforeEach, it } from '@jest/globals'

// Making mocks of the different clients
const ddbMock = mockClient(DynamoDBDocumentClient)
const iotMock = mockClient(IoTDataPlaneClient)

// Creates event that works
let event

// Resets clients between tests
beforeEach(() => {
  event = resetEvent()
  ddbMock.on(UpdateCommand).resolves({})
  iotMock.onAnyCommand().resolves({})
  ddbMock.on(PutCommand).resolves({})
})

describe('works with the correct deviceSide and habitType', () => {
  it('fails unsupported route succesfully', async () => {
    //ddbMock.on(GetCommand).resolves(true)
    ddbMock.on(UpdateCommand).resolves({})
    iotMock.onAnyCommand().resolves({})
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body)).toEqual('All actions completed successfully')
  })

  it('Fails when deviceSide is too low', async () => {
    event.pathParameters.deviceSide = -1
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body).error).toEqual(
      'invalid deviceSide. Must be a number between 0 and 11. DeviceSide -1 was provided',
    )
    expect(JSON.parse(response.body).failure).toEqual('Failure when creating item in HabitEventTable')
  })

  it('Fails when deviceSide is too high', async () => {
    event.pathParameters.deviceSide = 12
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body).error).toEqual(
      'invalid deviceSide. Must be a number between 0 and 11. DeviceSide 12 was provided',
    )
    expect(JSON.parse(response.body).failure).toEqual('Failure when creating item in HabitEventTable')
  })

  it('Fails when deviceSide is too high', async () => {
    event.pathParameters.habitType = 'tests_written'
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body).error).toEqual(
      'invalid habitType. Valid habitTypes are count and time. habitType tests_written was provided',
    )
    expect(JSON.parse(response.body).failure).toEqual('Failure when creating item in HabitEventTable')
  })

  it('Handles spaces in URL correctly', async () => {
    // TODO
  })
})

const resetEvent = () => {
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
  return event
}
