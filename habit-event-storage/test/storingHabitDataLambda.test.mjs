import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/storingHabitDataLambda.mjs'
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { expect, describe, beforeEach, it } from '@jest/globals'

// Creating mockclient
const ddbMock = mockClient(DynamoDBDocumentClient)

//Initializing variables
let event
let queryResponse

// Resets event before every test to make testing different alterations easier
beforeEach(() => {
  resetEvent()
  resetQueryResponse()
  ddbMock.on(QueryCommand).resolves(queryResponse)
  ddbMock.on(UpdateCommand).resolves()
})

// Testing lambda handler
describe('A function that stores habitEvents from the habittracker', () => {
  it('Passes when querycommand and updatecommand resolves', async () => {
    const response = await handler(event)
    expect(response).toEqual(event)
  })
})

// Functions for resetting variables to one that should pass
const resetEvent = () => {
  event = {
    payload: {
      habitId: '1',
      deviceTimestamp: '1712345678',
      data: '5',
      startTimestamp: '1712343678',
      stopTimestamp: '1712345638',
    },
    deviceId: 'HabitTrackerThing',
  }
}

const resetQueryResponse = () => {
  queryResponse = {
    Items: [
      {
        userId: 'b04c19ac-80c1-7096-baff-83aea8fee9c6',
        deviceId: 'FirmwareSimulatorThing',
        habits: [
          {
            habitId: 1,
            habitName: 'Trees Chopped',
            habitType: 'COUNT',
          },
          {
            habitId: 2,
            habitName: 'Coffee',
            habitType: 'COUNT',
          },
          {
            habitId: 3,
            habitName: 'Sleeping',
            habitType: 'TIME',
          },
        ],
      },
    ],
  }
}
