import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import * as iam from 'aws-cdk-lib/aws-iam'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class UserPoolStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Defines userpool and its settings
    const habitTrackerUserPool = new cognito.UserPool(this, 'HabitTrackerUserPool', {
      userPoolName: 'HabitTrackerUserPool',
      signInAliases: { email: true, username: true },
      autoVerify: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      mfa: cognito.Mfa.OFF,
      passwordPolicy: {
        minLength: 6,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      selfSignUpEnabled: true,
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
      },
    })

    // APP integration for userpool
    const habitTrackerUserPoolClient = new cognito.UserPoolClient(this, 'HabitTrackerUserPoolClient', {
      userPoolClientName: 'HabitTrackerUserPoolClient',
      userPool: habitTrackerUserPool,
      authFlows: {
        userPassword: true,
      },
    })

    // Creating role for editing UserDataTable
    const signupUserRole = new iam.Role(this, 'SignupUserRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'SignupUserRole',
    })

    signupUserRole.attachInlinePolicy(
      new iam.Policy(this, 'SignupUserPolicy', {
        policyName: 'SignupUserPolicy',
        statements: [
          new iam.PolicyStatement({
            actions: ['dynamodb:*'],
            resources: [`arn:aws:dynamodb:${props?.env?.region}:${props?.env?.account}:*`],
          }),
        ],
      }),
    )

    // Creates lambda functions for user verification, login and registration
    const signupFunction = new lambda.Function(this, 'SignupFunction', {
      functionName: 'SignupFunction',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'signup.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: signupUserRole,
      environment: {
        USERDATA_TABLENAME: 'UserDataTable',
        USERPOOL_ID: habitTrackerUserPoolClient.userPoolClientId,
      },
    })

    const loginFunction = new lambda.Function(this, 'LoginFunction', {
      functionName: 'LoginFunction',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'login.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        USERPOOL_ID: habitTrackerUserPoolClient.userPoolClientId,
      },
    })

    const verifyEmailFunction = new lambda.Function(this, 'VerifyEmailFunction', {
      functionName: 'VerifyEmailFunction',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'verifyEmail.handler',
      code: lambda.Code.fromAsset('lambda'),
    })

    // Resource for HTTP-API
    const httpApi = new apigwv2.HttpApi(this, 'AuthentificationAPI', {
      corsPreflight: {
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowOrigins: ['*'],
        allowHeaders: ['*'],
        allowCredentials: false,
      },
    })

    // Creates lambda integrations for all defined functions
    const signupIntegration = new HttpLambdaIntegration('SignupIntegration', signupFunction)
    const verifyuserIntegration = new HttpLambdaIntegration('VerifyuserIntegration', verifyEmailFunction)
    const loginIntegration = new HttpLambdaIntegration('LoginIntegration', loginFunction)

    // API routes for lambda integration
    httpApi.addRoutes({
      path: '/signup/{username}/{email}/{deviceId}/{password}',
      methods: [apigwv2.HttpMethod.POST],
      integration: signupIntegration,
    })
    httpApi.addRoutes({
      path: '/verifyUser/{username}/{confirmationCode}',
      methods: [apigwv2.HttpMethod.POST],
      integration: verifyuserIntegration,
    })

    httpApi.addRoutes({
      path: '/login/{username}/{password}',
      methods: [apigwv2.HttpMethod.GET],
      integration: loginIntegration,
    })
  }
}
