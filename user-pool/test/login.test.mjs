import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/login.mjs'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider' // ES Modules import
import { beforeEach, describe, it, expect } from '@jest/globals'

// Making mocks of the different clients
const mockCognitoClient = mockClient(CognitoIdentityProviderClient)

//Initializing variables
let event

// Resets event before every test to make testing different alterations easier
beforeEach(() => {
  resetEvent()
  mockCognitoClient.on(InitiateAuthCommand).resolves({ AuthenticationResult: { AccessToken: 'OneAccessTokenPlease' } })
  mockCognitoClient
    .on(GetUserCommand)
    .resolves({ Username: 'FrodeFrydfull', UserAttributes: [{ Name: 'sub', Value: 'One userId' }] })
})

// Testing the lambda code
describe('Handler for logging in a user', () => {
  it('Passes when all commands resolves resolves', async () => {
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body).userId).toEqual('One userId')
  })
  it('Fails when InitiateAuthCommand rejects', async () => {
    mockCognitoClient.on(InitiateAuthCommand).rejects({ message: 'This command failed' })
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body).error.message).toEqual('This command failed')
    expect(JSON.parse(response.body).failure).toEqual('Authenticationfailure')
  })
  it('Fails when GetUserCommand rejects', async () => {
    mockCognitoClient.on(GetUserCommand).rejects({ message: 'This command failed' })
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body).error.message).toEqual('This command failed')
    expect(JSON.parse(response.body).failure).toEqual('Failure when getting userdata')
  })
})

// Functions for resetting variables to one that should pass
const resetEvent = () => {
  event = {
    pathParameters: {
      username: 'FrodeFrydfull',
      password: 'Passord123',
    },
  }
}
