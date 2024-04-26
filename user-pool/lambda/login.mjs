/* global process */

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider'

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body = {}
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }

  // Initiates variables for later access
  const client = new CognitoIdentityProviderClient({})
  let clientId = process.env.USERPOOL_ID
  let userData
  let loginResponse

  try {
    // Logs in and gets AccessToken for user. This will be used to get userId in next api-call
    loginResponse = await client.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: event.pathParameters.username,
          PASSWORD: event.pathParameters.password,
        },
      }),
    )
  } catch (error) {
    statusCode = 400
    body.failure = 'Authenticationfailure'
    body.error = error
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  // Gets userdata with accesstoken from previous API call
  try {
    userData = await client.send(
      new GetUserCommand({
        AccessToken: loginResponse.AuthenticationResult.AccessToken,
        USERNAME: event.pathParameters.username,
      }),
    )
  } catch (error) {
    statusCode = 400
    body.failure = 'Failure when getting userdata'
    body.error = error
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  userData.UserAttributes.forEach((userAttribute) => {
    if (userAttribute.Name == 'sub') {
      body.userId = userAttribute.Value
    }
  })

  body = JSON.stringify(body)

  return { statusCode, body, headers }
}
