import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/editHabit.mjs'
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { GetThingShadowCommand, IoTDataPlaneClient, UpdateThingShadowCommand } from '@aws-sdk/client-iot-data-plane'
import { expect, describe, beforeEach, it } from '@jest/globals'
import { Buffer } from 'buffer'

// Making mocks of the different clients
const ddbMock = mockClient(DynamoDBDocumentClient)
const iotMock = mockClient(IoTDataPlaneClient)

//Initializing variables
let event
let userData
let shadow

// Resets event before every test to make testing different alterations easier
beforeEach(() => {
  resetEvent()
  resetShadow()
  resetUserData()
  ddbMock.on(GetCommand).resolves(userData)
  ddbMock.on(UpdateCommand).resolves()
  iotMock.on(UpdateThingShadowCommand).resolves()
  iotMock.on(GetThingShadowCommand).resolves({ payload: new Uint8Array(Buffer.from(JSON.stringify(shadow))) })
})

// Testing the lambda code
describe('editHabit when editing side and name', () => {
  it('Passes when editing side and name', async () => {
    const response = await handler(event)
    expect(response.body).toEqual('The habit was successfully edited')
    expect(response.statusCode).toEqual(200)
  })

  it('Passes when id isnt in shadow', async () => {
    event.pathParameters.habitId = 13
    const response = await handler(event)
    expect(response.body).toEqual('The habit was successfully edited')
    expect(response.statusCode).toEqual(200)
  })

  it('Passes when only editing side', async () => {
    event.pathParameters.habitName = 'noChange'
    const response = await handler(event)
    expect(response.body).toEqual('The habit was successfully edited')
    expect(response.statusCode).toEqual(200)
  })
  it('Passes when only editing name', async () => {
    event.pathParameters.deviceSide = 'No side'
    const response = await handler(event)
    expect(response.body).toEqual('The habit was successfully edited')
    expect(response.statusCode).toEqual(200)
  })
  it('Passes when editing nothing', async () => {
    event.pathParameters.habitName = 'noChange'
    const response = await handler(event)
    expect(response.body).toEqual('The habit was successfully edited')
    expect(response.statusCode).toEqual(200)
  })

  it('Fails when habitSide is too high', async () => {
    event.pathParameters.deviceSide = '12'
    const response = await handler(event)
    expect(JSON.parse(response.body).failure).toEqual('Failure when updating deviceShadow')
    expect(JSON.parse(response.body).error).toEqual(
      'invalid deviceSide. Must be a number between 0 and 11. DeviceSide 12 was provided',
    )
    expect(response.statusCode).toEqual(400)
  })
  it('Fails when habitSide is too low', async () => {
    event.pathParameters.deviceSide = '-1'
    const response = await handler(event)
    expect(JSON.parse(response.body).failure).toEqual('Failure when updating deviceShadow')
    expect(JSON.parse(response.body).error).toEqual(
      'invalid deviceSide. Must be a number between 0 and 11. DeviceSide -1 was provided',
    )
    expect(response.statusCode).toEqual(400)
  })

  it('Fails when Getcommand fails', async () => {
    ddbMock.on(GetCommand).rejects({ message: 'This command failed' })
    const response = await handler(event)
    expect(JSON.parse(response.body).failure).toEqual('Failure when getting habits from user')
    expect(JSON.parse(response.body).error.message).toEqual('This command failed')
    expect(response.statusCode).toEqual(400)
  })
  it('Fails when UpdateCommand fails', async () => {
    ddbMock.on(UpdateCommand).rejects({ message: 'This command failed' })
    const response = await handler(event)
    expect(JSON.parse(response.body).failure).toEqual('Failure when updating habit')
    expect(JSON.parse(response.body).error.message).toEqual('This command failed')
    expect(response.statusCode).toEqual(400)
  })
  it('Fails when UpdateThingShadowCommand fails', async () => {
    iotMock.on(UpdateThingShadowCommand).rejects({ message: 'This command failed' })
    const response = await handler(event)
    //expect(response).toBe('Hi')
    expect(JSON.parse(response.body).failure).toEqual('Failure when updating deviceShadow')
    expect(JSON.parse(response.body).error.message).toEqual('This command failed')
    expect(response.statusCode).toEqual(400)
  })
})

// Functions for resetting variables to one that should pass
const resetEvent = () => {
  event = {
    pathParameters: {
      userId: 0,
      habitId: 1,
      deviceId: 'deviceThing',
      habitName: 'Tree hugging',
      deviceSide: 10,
    },
  }
}

const resetUserData = () => {
  userData = {
    Item: {
      habits: [
        {
          habitId: 1,
          habitName: 'treehogging',
          habitType: 'TIME',
        },
        {
          habitId: 6,
          habitName: 'Kitty Pets',
          habitType: 'COUNT',
        },
        {
          habitId: 13,
          habitName: 'Kitty Pets',
          habitType: 'COUNT',
        },
      ],
    },
  }
}

const resetShadow = () => {
  shadow = {
    state: {
      desired: {
        0: { id: '3', type: 'TIME' },
        1: { id: '1', type: 'TIME' },
        2: { id: '9', type: 'TIME' },
        3: { id: '3', type: 'COUNT' },
        4: { id: '0', type: 'COUNT' },
        5: { id: '5', type: 'TIME' },
        6: { id: '6', type: 'COUNT' },
        7: { id: '7', type: 'COUNT' },
        8: { id: '4', type: 'TIME' },
        9: { id: '4', type: 'TIME' },
      },
    },
  }
}
