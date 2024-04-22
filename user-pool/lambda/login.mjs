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

  const client = new CognitoIdentityProviderClient({})
  let userDataTableName = process.env.USERDATA_TABLENAME
  let clientId = process.env.USERPOOL_ID

  let loginResponse = await client.send(
    new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: 'Kittyover8',
        PASSWORD: 'Passord123!!',
      },
      AuthenticationResult: {
        // AuthenticationResultType
        AccessToken: 'STRING_VALUE',
        ExpiresIn: Number('int'),
        TokenType: 'STRING_VALUE',
        RefreshToken: 'STRING_VALUE',
        IdToken: 'STRING_VALUE',
        NewDeviceMetadata: {
          // NewDeviceMetadataType
          DeviceKey: 'STRING_VALUE',
          DeviceGroupKey: 'STRING_VALUE',
        },
      },
    }),
  )

  const input = {
    // GetUserRequest
    AccessToken: loginResponse.AuthenticationResult.AccessToken,
    USERNAME: 'Kittyover8',
  }
  const command = new GetUserCommand(input)
  const response = await client.send(command)

  body.userAttributes = response.UserAttributes
  body.userName = response.Username
  body.AccessToken = loginResponse.AuthenticationResult.AccessToken

  return { statusCode, body, headers }
}
