import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/verifyEmail.mjs'
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider' // ES Modules import
import { beforeEach, describe, it, expect } from '@jest/globals'

const client = new CognitoIdentityProviderClient({})
const mockCognitoClient = mockClient(client)
let event = {
  confirmationCode: 12345,
  username: 'FrodeFrydfull',
}

beforeEach(() => {
  resetEvent()
  mockCognitoClient.on(ConfirmSignUpCommand).resolves({})
})

describe('Handler for verifying a users email', () => {
  it('Passes when ConfirmSignupCommand resolves', async () => {
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual('User confirmed!')
  })
})

const resetEvent = () => {
  event = {
    confirmationCode: 12345,
    username: 'FrodeFrydfull',
  }
}
