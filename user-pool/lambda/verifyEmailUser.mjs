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

  body = await client.send(
    new ConfirmSignUpCommand({
      // ConfirmSignUpRequest
      ClientId: process.env.USERPOOL_ID, // required
      Username: 'Kittyover8', // required
      ConfirmationCode: '888578', // required
    }),
  )
  body = 'User confirmed!'
  return { statusCode, body, headers }
}
