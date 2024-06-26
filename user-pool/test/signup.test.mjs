import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/signup.mjs'
import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider' // ES Modules import
import { beforeEach, describe, it, expect } from '@jest/globals'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

// Making mocks of the different clients
const mockCognitoClient = mockClient(CognitoIdentityProviderClient)
const ddbMock = mockClient(DynamoDBDocumentClient)

//Initializing variables
let event

// Resets event before every test to make testing different alterations easier
beforeEach(() => {
  resetEvent()
  mockCognitoClient.on(SignUpCommand).resolves({ UserSub: 'userId' })
  ddbMock.on(PutCommand).resolves()
})

// Testing the lambda code
describe('Handler for logging in a user', () => {
  it('Passes when all commands resolves resolves', async () => {
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual('Successfull registration!')
  })
  it('Fails when InitiateAuthCommand rejects', async () => {
    mockCognitoClient.on(SignUpCommand).rejects({ message: 'This command failed' })
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body).error.message).toEqual('This command failed')
    expect(JSON.parse(response.body).failure).toEqual('SignUpCommand failed')
  })
  it('Fails when GetUserCommand rejects', async () => {
    ddbMock.on(PutCommand).rejects({ message: 'This command failed' })
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body).error.message).toEqual('This command failed')
    expect(JSON.parse(response.body).failure).toEqual('Creating userdata failed')
  })
})

// Functions for resetting variables to one that should pass
const resetEvent = () => {
  event = {
    pathParameters: {
      username: 'FrodeFrydfull',
      password: 'Passord123',
      email: 'pus@catmail.com',
      deviceId: 'deviceThing91',
    },
  }
}
