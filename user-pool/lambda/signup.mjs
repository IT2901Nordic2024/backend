/* global process */

import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body = {}
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }

  const client = new CognitoIdentityProviderClient({})
  const ddbClient = new DynamoDBClient()
  const dynamo = new DynamoDBDocumentClient(ddbClient)
  let signUpCommandResponse
  //let createUserdataResponse
  let userData = {}
  const userDataTableName = process.env.USERDATA_TABLENAME
  const clientId = process.env.USERPOOL_ID

  try {
    // API call that creates a user and returns a UserSub, which will be used as a userId
    signUpCommandResponse = await client.send(
      new SignUpCommand({
        ClientId: clientId,
        Username: event.pathParameters.username,
        Password: event.pathParameters.password,
        UserAttributes: [
          // AttributeListType
          {
            // AttributeType
            Name: 'email', // required
            Value: event.pathParameters.email,
          },
        ],
      }),
    )
  } catch (error) {
    statusCode = 400
    body.error = error
    body.failure = 'SignUpCommand failed'
    body.response = signUpCommandResponse
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  try {
    // Legger til brukerdata i userData
    userData.userId = String(signUpCommandResponse.UserSub)
    userData.habits = []
    userData.deviceId = event.pathParameters.deviceId
    console.log(userData)
    // Lagrer userData i databasen
    await dynamo.send(
      new PutCommand({
        TableName: userDataTableName,
        Item: userData,
      }),
    )
  } catch (error) {
    statusCode = 400
    body.error = error
    body.failure = 'Creating userdata failed'
    body = JSON.stringify(body)
    body = userData
    body = JSON.stringify(body)
    return { statusCode, body, headers }
  }

  // TODO: Gjør body brukbar fro frontend. Gi en response som gir tilbake userId, email, username, name?, / dataen du lagrer i userData
  body = signUpCommandResponse
  body = 'Successfull registration!'
  return { statusCode, body, headers }
}
