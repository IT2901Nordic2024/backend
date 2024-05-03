/* global process */

import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider' // ES Modules import
// const { CognitoIdentityProviderClient, ConfirmSignUpCommand } = require("@aws-sdk/client-cognito-identity-provider"); // CommonJS import
const client = new CognitoIdentityProviderClient({})

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body = {}
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }

  // Sends request to confirm username-confirmationCode combo
  try {
    await client.send(
      new ConfirmSignUpCommand({
        ClientId: process.env.USERPOOL_ID,
        Username: event.pathParameters.username,
        ConfirmationCode: event.pathParameters.confirmationCode,
      }),
    )
  } catch (error) {
    statusCode = 400
    body.error = error
    body.failure = 'Userconfirmation failure'
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  body = 'User confirmed!'
  return { statusCode, body, headers }
}
