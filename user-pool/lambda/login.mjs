import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

export const handler = async (event) => {
  // Initiating response we will send back to sender
  let body = {};
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  const client = new CognitoIdentityProviderClient({});

  body = await client.send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: "3cggp662kebg9bjo5qoi2r4c6g",
      AuthParameters: {
        USERNAME: "FRODE_FRYDFULL",
        PASSWORD: "Password123",
      },
      AuthenticationResult: {
        // AuthenticationResultType
        AccessToken: "STRING_VALUE",
        ExpiresIn: Number("int"),
        TokenType: "STRING_VALUE",
        RefreshToken: "STRING_VALUE",
        IdToken: "STRING_VALUE",
        NewDeviceMetadata: {
          // NewDeviceMetadataType
          DeviceKey: "STRING_VALUE",
          DeviceGroupKey: "STRING_VALUE",
        },
      },
    })
  );

  return { statusCode, body, headers };
};
