import { DynamoDBDocumentClient, GetCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { IoTDataPlaneClient, GetThingShadowCommand, UpdateThingShadowCommand } from '@aws-sdk/client-iot-data-plane'
import { Buffer } from 'buffer'
import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/deleteHabit.mjs'
import { expect, describe, beforeEach, it } from '@jest/globals'

// Making mocks of the different clients
const ddbMock = mockClient(DynamoDBDocumentClient)
const iotMock = mockClient(IoTDataPlaneClient)

//Initializing variables
let event
let userData
let shadow

// Resets event before every test to make testing different alterations easier
beforeEach(() => {
  event = baseEvent()
  shadow = baseShadow()
  userData = baseUserData()
  ddbMock.on(GetCommand).resolves(userData)
  ddbMock.on(UpdateCommand).resolves()
  ddbMock.on(DeleteCommand).resolves()
  iotMock.on(UpdateThingShadowCommand).resolves()
  iotMock.on(GetThingShadowCommand).resolves({ payload: new Uint8Array(Buffer.from(JSON.stringify(shadow))) })
})

// Testing the lambda code
describe('a handler for deleting habits', () => {
  it('Passes when all clients resolves', async () => {
    const response = await handler(event)
    expect(JSON.parse(response.body)).toEqual('Success!')
    expect(response.statusCode).toEqual(200)
  })
  it('Gives correct error when GetCommand fails', async () => {
    ddbMock.on(GetCommand).rejectsOnce('An error has occured')
    const response = await handler(event)
    const body = JSON.parse(response.body)
    expect(body.error).toEqual("Cannot read properties of undefined (reading 'Item')")
    expect(body.failure).toEqual('Problem when geting userdata')
    expect(response.statusCode).toEqual(400)
  })
  it('Gives correct error when UpdateCommand fails', async () => {
    ddbMock.on(UpdateCommand).rejects({ message: 'An error has occured' })
    const response = await handler(event)
    const body = JSON.parse(response.body)
    expect(body.error).toEqual('An error has occured')
    expect(body.failure).toEqual('Problem when deleting from habit from user data')
    expect(response.statusCode).toEqual(400)
  })
  it('Gives correct error when DeleteCommand fails', async () => {
    ddbMock.on(DeleteCommand).rejects({ message: 'An error has occured' })
    const response = await handler(event)
    const body = JSON.parse(response.body)
    expect(body.error).toEqual('An error has occured')
    expect(body.failure).toEqual('Problem when deleting habitevent data')
    expect(response.statusCode).toEqual(400)
  })
  it('Gives correct error when UpdateThingShadowCommand fails', async () => {
    iotMock.on(UpdateThingShadowCommand).rejects({ message: 'An error has occured' })
    const response = await handler(event)
    const body = JSON.parse(response.body)
    expect(body.error).toEqual('An error has occured')
    expect(body.failure).toEqual('Problem when updating thing shadow')
    expect(response.statusCode).toEqual(400)
  })
  it('Gives correct error when GetThingShadowCommand fails', async () => {
    iotMock.on(GetThingShadowCommand).rejects({ message: 'An error has occured' })
    const response = await handler(event)
    const body = JSON.parse(response.body)
    expect(body.error).toEqual('An error has occured')
    expect(body.failure).toEqual('Problem when getting thing shadow')
    expect(response.statusCode).toEqual(400)
  })
})

// Functions for resetting variables to one that should pass
const baseEvent = () => {
  event = {
    pathParameters: {
      userId: 0,
      habitId: 1,
    },
  }

  return event
}

const baseUserData = () => {
  userData = {
    Item: {
      deviceId: 'DeviceThing',
      habits: [
        {
          habitId: 1,
          habitName: 'treehugging',
          habitType: 'TIME',
        },
        {
          habitId: 2,
          habitName: 'Kitty Pets',
          habitType: 'COUNT',
        },
      ],
    },
  }
  return userData
}

const baseShadow = () => {
  shadow = {
    state: {
      desired: {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 7,
      },
    },
  }
  return shadow
}
