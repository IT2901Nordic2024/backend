import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import * as UserPool from '../lib/user-pool-stack'

// example test. To run these tests, uncomment this file along with the
// example resource in lib/user-pool-stack.ts
import { test } from '@jest/globals'
test('Lambda Functions get created', () => {
  const app = new cdk.App()
  const stack = new UserPool.UserPoolStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::Lambda::Function', 3)

  template.hasResourceProperties('AWS::Lambda::Function', {
    Code: {
      S3Bucket: {
        'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}',
      },
      S3Key: '80378643a2e747c2caef63b59e30312afba5e8a200f926d4263757c4084f5034.zip',
    },
    Environment: {
      Variables: {
        USERDATA_TABLENAME: 'UserDataTable',
        USERPOOL_ID: {
          Ref: 'HabitTrackerUserPoolClient22B775CC',
        },
      },
    },
    FunctionName: 'SignupFunction',
    Handler: 'signup.handler',
    Role: {
      'Fn::GetAtt': ['SignupUserRole2A8A5EF7', 'Arn'],
    },
    Runtime: 'nodejs20.x',
  })
  // Checks if we have a lambda function for login.handler
  template.hasResourceProperties('AWS::Lambda::Function', {
    Code: {
      S3Bucket: {
        'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}',
      },
      S3Key: '80378643a2e747c2caef63b59e30312afba5e8a200f926d4263757c4084f5034.zip',
    },
    Environment: {
      Variables: {
        USERDATA_TABLENAME: 'UserDataTable',
        USERPOOL_ID: {
          Ref: 'HabitTrackerUserPoolClient22B775CC',
        },
      },
    },
    FunctionName: 'LoginFunction',
    Handler: 'login.handler',
    Role: {
      'Fn::GetAtt': ['LoginFunctionServiceRole74B42ABA', 'Arn'],
    },
    Runtime: 'nodejs20.x',
  })
  // Checks if we have a lambda function for verifyEmail.handler
  template.hasResourceProperties('AWS::Lambda::Function', {
    Code: {
      S3Bucket: {
        'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}',
      },
      S3Key: '80378643a2e747c2caef63b59e30312afba5e8a200f926d4263757c4084f5034.zip',
    },
    Environment: {
      Variables: {
        USERDATATABLENAME: 'UserDataTable',
        USERPOOL_ID: {
          Ref: 'HabitTrackerUserPoolClient22B775CC',
        },
      },
    },
    FunctionName: 'VerifyEmailFunction',
    Handler: 'verifyEmail.handler',
    Role: {
      'Fn::GetAtt': ['VerifyEmailFunctionServiceRole39E7B4E3', 'Arn'],
    },
    Runtime: 'nodejs20.x',
  })
})

test('UserPool gets created', () => {
  const app = new cdk.App()
  const stack = new UserPool.UserPoolStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::Cognito::UserPool', 1)

  template.hasResourceProperties('AWS::Cognito::UserPool', {
    AccountRecoverySetting: {
      RecoveryMechanisms: [
        {
          Name: 'verified_email',
          Priority: 1,
        },
      ],
    },
    AdminCreateUserConfig: {
      AllowAdminCreateUserOnly: false,
    },
    AliasAttributes: ['email'],
    AutoVerifiedAttributes: ['email'],
    EmailVerificationMessage: 'The verification code to your new account is {####}',
    EmailVerificationSubject: 'Verify your new account',
    MfaConfiguration: 'OFF',
    Policies: {
      PasswordPolicy: {
        MinimumLength: 6,
        RequireLowercase: true,
        RequireNumbers: true,
        RequireSymbols: false,
        RequireUppercase: true,
      },
    },
    Schema: [
      {
        Mutable: false,
        Name: 'email',
        Required: true,
      },
    ],
    SmsVerificationMessage: 'The verification code to your new account is {####}',
    UserPoolName: 'HabitTrackerUserPool',
    VerificationMessageTemplate: {
      DefaultEmailOption: 'CONFIRM_WITH_CODE',
      EmailMessage: 'The verification code to your new account is {####}',
      EmailSubject: 'Verify your new account',
      SmsMessage: 'The verification code to your new account is {####}',
    },
  })
})

test('UserPoolClient gets created', () => {
  const app = new cdk.App()
  const stack = new UserPool.UserPoolStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::Cognito::UserPoolClient', 1)

  template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
    AllowedOAuthFlows: ['implicit', 'code'],
    AllowedOAuthFlowsUserPoolClient: true,
    AllowedOAuthScopes: ['profile', 'phone', 'email', 'openid', 'aws.cognito.signin.user.admin'],
    CallbackURLs: ['https://example.com'],
    ClientName: 'HabitTrackerUserPoolClient',
    ExplicitAuthFlows: ['ALLOW_USER_PASSWORD_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'],
    SupportedIdentityProviders: ['COGNITO'],
    UserPoolId: {
      Ref: 'HabitTrackerUserPoolBE4CC82B',
    },
  })
})

test('SignupUserPloicy gets created and is assumed by signupUserRole', () => {
  const app = new cdk.App()
  const stack = new UserPool.UserPoolStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::IAM::Policy', 1)

  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: [
        {
          Action: 'dynamodb:*',
          Effect: 'Allow',
          Resource: 'arn:aws:dynamodb:eu-north-1:339713040007:*',
        },
      ],
      Version: '2012-10-17',
    },
    PolicyName: 'SignupUserPolicy',
    Roles: [
      {
        Ref: 'SignupUserRole2A8A5EF7',
      },
    ],
  })
})

test('httpApi gets created', () => {
  const app = new cdk.App()
  const stack = new UserPool.UserPoolStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::ApiGatewayV2::Api', 1)

  template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
    CorsConfiguration: {
      AllowHeaders: ['*'],
      AllowMethods: ['*'],
      AllowOrigins: ['*'],
    },
    Name: 'AuthentificationAPI',
    ProtocolType: 'HTTP',
  })
})

test('HTTP lambdaintegrations gets created', () => {
  const app = new cdk.App()
  const stack = new UserPool.UserPoolStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::ApiGatewayV2::Integration', 3)

  template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
    ApiId: {
      Ref: 'AuthentificationAPI992EB6FB',
    },
    IntegrationType: 'AWS_PROXY',
    IntegrationUri: {
      'Fn::GetAtt': ['SignupFunction2AD1B0FF', 'Arn'],
    },
    PayloadFormatVersion: '2.0',
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
    ApiId: {
      Ref: 'AuthentificationAPI992EB6FB',
    },
    IntegrationType: 'AWS_PROXY',
    IntegrationUri: {
      'Fn::GetAtt': ['VerifyEmailFunction6AC00EBE', 'Arn'],
    },
    PayloadFormatVersion: '2.0',
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
    ApiId: {
      Ref: 'AuthentificationAPI992EB6FB',
    },
    IntegrationType: 'AWS_PROXY',
    IntegrationUri: {
      'Fn::GetAtt': ['LoginFunction66F090C6', 'Arn'],
    },
    PayloadFormatVersion: '2.0',
  })
})

test('httpApi routes gets created', () => {
  const app = new cdk.App()
  const stack = new UserPool.UserPoolStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::ApiGatewayV2::Route', 3)

  template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
    ApiId: {
      Ref: 'AuthentificationAPI992EB6FB',
    },
    AuthorizationType: 'NONE',
    RouteKey: 'POST /signup/{username}/{email}/{deviceId}/{password}',
    Target: {
      'Fn::Join': [
        '',
        [
          'integrations/',
          {
            Ref: 'AuthentificationAPIPOSTsignupusernameemaildeviceIdpasswordSignupIntegration00A6327D',
          },
        ],
      ],
    },
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
    ApiId: {
      Ref: 'AuthentificationAPI992EB6FB',
    },
    AuthorizationType: 'NONE',
    RouteKey: 'POST /verifyUser/{username}/{confirmationCode}',
    Target: {
      'Fn::Join': [
        '',
        [
          'integrations/',
          {
            Ref: 'AuthentificationAPIPOSTverifyUserusernameconfirmationCodeVerifyuserIntegration1B3A1D94',
          },
        ],
      ],
    },
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
    ApiId: {
      Ref: 'AuthentificationAPI992EB6FB',
    },
    AuthorizationType: 'NONE',
    RouteKey: 'GET /login/{username}/{password}',
    Target: {
      'Fn::Join': [
        '',
        [
          'integrations/',
          {
            Ref: 'AuthentificationAPIGETloginusernamepasswordLoginIntegration35478953',
          },
        ],
      ],
    },
  })
})
