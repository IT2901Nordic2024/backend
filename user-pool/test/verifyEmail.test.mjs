import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/verifyEmail.mjs'
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider' // ES Modules import
import { beforeEach, describe, it, expect } from '@jest/globals'

const mockCognitoClient = mockClient(CognitoIdentityProviderClient)
let event

beforeEach(() => {
  resetEvent()
  mockCognitoClient.on(ConfirmSignUpCommand).resolves()
})

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

const resetEvent = () => {
  event = {
    pathParameters: {
      confirmationCode: '12345',
      username: 'FrodeFrydfull',
    },
  }
}
