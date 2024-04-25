import { mockClient } from 'aws-sdk-client-mock'
import { handler } from '../lambda/login.mjs'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider' // ES Modules import
import { beforeEach, describe, it, expect } from '@jest/globals'

const mockCognitoClient = mockClient(CognitoIdentityProviderClient)
let event

beforeEach(() => {
  resetEvent()
  mockCognitoClient.on(InitiateAuthCommand).resolves({ AuthenticationResult: { AccessToken: 'OneAccessTokenPlease' } })
  mockCognitoClient
    .on(GetUserCommand)
    .resolves({ Username: 'FrodeFrydfull', UserAttributes: ['List', 'with', 'userdata'] })
})

describe('Handler for logging in a user', () => {
  it('Passes when all commands resolves resolves', async () => {
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body).accessToken).toEqual('OneAccessTokenPlease')
    expect(JSON.parse(response.body).username).toEqual('FrodeFrydfull')
    expect(JSON.parse(response.body).userAttributes).toEqual(['List', 'with', 'userdata'])
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

const resetEvent = () => {
  event = {
    pathParameters: {
      username: 'FrodeFrydfull',
      password: 'Passord123',
    },
  }
}
