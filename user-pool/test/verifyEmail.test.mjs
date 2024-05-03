import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/verifyEmail.mjs'
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider' // ES Modules import
import { beforeEach, describe, it, expect } from '@jest/globals'

// Making mocks of the different clients
const mockCognitoClient = mockClient(CognitoIdentityProviderClient)

//Initializing variables
let event

// Resets event before every test to make testing different alterations easier
beforeEach(() => {
  resetEvent()
  mockCognitoClient.on(ConfirmSignUpCommand).resolves()
})

// Testing the lambda code
describe('Handler for verifying a users email', () => {
  it('Passes when ConfirmSignupCommand resolves', async () => {
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual('User confirmed!')
  })
  it('Fails when ConfirmSignupCommand rejects', async () => {
    mockCognitoClient.on(ConfirmSignUpCommand).rejects({ message: 'This command failed' })
    const response = await handler(event)
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body).error.message).toEqual('This command failed')
    expect(JSON.parse(response.body).failure).toEqual('Userconfirmation failure')
  })
})

// Functions for resetting variables to one that should pass
const resetEvent = () => {
  event = {
    pathParameters: {
      confirmationCode: '12345',
      username: 'FrodeFrydfull',
    },
  }
}
