import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/getHabitsWithSide.mjs'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { expect, describe, beforeEach, it } from '@jest/globals'
import { charCodeToJSON } from '../lambda/getHabitsWithSide.mjs'
import { Buffer } from 'buffer'

// Making mocks of the different clients
const ddbMock = mockClient(DynamoDBDocumentClient)
const iotMock = mockClient(IoTDataPlaneClient)

// Initialises event, clientresponses and expected output from handler
let event
let baseShadowState
let expectedResponse
let getResponse
let iotResponse

// Resets event before every test to make testing different alterations easier
beforeEach(() => {
  resetShadowState()
  resetGetResponse()
  resetExpectedResponse()
  resetEvent()

  iotResponse = { payload: new Uint8Array(Buffer.from(JSON.stringify(baseShadowState))) }
  iotMock.onAnyCommand().resolves(iotResponse)
  ddbMock.on(GetCommand).resolves(getResponse)
})

// Testing the lambda code
describe('A function that converts charcode to json', () => {
  it('converts', () => {
    const originalJSON = { name: 'Frode', lastName: 'Frydefull', pet: 'Cat', likes: ['Cats', 'Icecream', 'pencils'] }
    let convertedJSON = new Uint8Array(Buffer.from(JSON.stringify(originalJSON)))
    convertedJSON = charCodeToJSON(convertedJSON)
    expect(convertedJSON).toEqual(originalJSON)
  })
})

describe('getHabitsWithSide handler', () => {
  it('Gets data when event is correct', async () => {
    const response = await handler(event)
    expect(response.body).toEqual(JSON.stringify(expectedResponse))
    expect(response.statusCode).toEqual(200)
  })

  it('Works when a habit doesnt have a side', async () => {
    getResponse.Item.habits.push({
      habitName: 'Treehuggingtime',
      habitId: 4,
      deviceId: 'MyIotThing',
      habitType: 'time',
    })
    expectedResponse.habits.push({
      habitName: 'Treehuggingtime',
      habitId: 4,
      deviceId: 'MyIotThing',
      habitType: 'time',
    })

    const response = await handler(event)
    expect(response.body).toEqual(JSON.stringify(expectedResponse))
    expect(response.statusCode).toEqual(200)
  })
})

// Functions for resetting variables to one that should pass
const resetEvent = () => {
  event = {
    routeKey: 'GET /getHabitsWithSide/{userId}',
    pathParameters: {
      userId: '0',
    },
  }
}
const resetExpectedResponse = () => {
  expectedResponse = {
    name: 'Frode',
    habits: [
      {
        habitName: 'Treehuggingtime',
        habitId: 1,
        deviceId: 'MyIotThing',
        habitType: 'time',
        side: 1,
      },
      {
        habitName: 'Treehuggingtime',
        habitId: 2,
        deviceId: 'MyIotThing',
        habitType: 'time',
        side: 8,
      },
      {
        habitName: 'Treehugging+time',
        habitId: 3,
        deviceId: 'MyIotThing',
        habitType: 'time',
        side: 3,
      },
    ],
  }
}

const resetGetResponse = () => {
  getResponse = {
    Item: {
      name: 'Frode',
      habits: [
        {
          habitName: 'Treehuggingtime',
          habitId: 1,
          deviceId: 'MyIotThing',
          habitType: 'time',
        },
        {
          habitName: 'Treehuggingtime',
          habitId: 2,
          deviceId: 'MyIotThing',
          habitType: 'time',
        },
        {
          habitName: 'Treehugging+time',
          habitId: 3,
          deviceId: 'MyIotThing',
          habitType: 'time',
        },
      ],
    },
  }
}

const resetShadowState = () => {
  baseShadowState = {
    state: {
      desired: {
        1: { id: 1, type: 'COUNT' },
        3: { id: 3, type: 'TIME' },
        8: { id: 2, type: 'COUNT' },
      },
      reported: {
        welcome: 'aws-iot',
      },
      delta: {
        1: { id: 5, type: 'COUNT' },
        3: { id: 4, type: 'COUNT' },
        5: { id: 7, type: 'TIME' },
      },
    },
  }
}
