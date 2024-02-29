import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2' 
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { aws_iot as iot } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam'

/**
 * TODO
 * - create seperate roles and policies for postShadowHandler and getShadowHandler
 */

export class ConfigureShadowApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Creating role for handlers
    const handlerRole = new iam.Role(this, 'ShadowHandlerRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: "ConfigureShadowRole"
    });

    // Attaching policy to the handlerRole
    handlerRole.attachInlinePolicy(new iam.Policy(this, "IotShadowRestPolicy", {
      policyName: "IotShadowRestPolicy",
      statements: [new iam.PolicyStatement({
        actions: ["iot:GetThingShadow", "iot:UpdateThingShadow"],
        resources: ["arn:aws:iot:eu-north-1:339713040007:thing/*"]
      })]
    }))

    // Declaring lambda handlers
    const updateShadowHandler = new lambda.Function(this, "UpdateShadowConfigurationFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "updateShadow.handler",
      code: lambda.Code.fromAsset("lambda"),
      functionName: "UpdateShadowConfiguration",
      role: handlerRole,
    })

    const getShadowHandler = new lambda.Function(this, "GetShadowConfigurationFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "getShadow.handler",
      code: lambda.Code.fromAsset("lambda"),
      functionName: "GetShadowConfiguration",
      role: handlerRole,
    })

    // Initiating HTTP-API for updating the deviceshadow
    const httpAPI = new apigwv2.HttpApi(this, "ConfigureShadow", {
      corsPreflight: {
        allowMethods: [apigwv2.CorsHttpMethod.POST, apigwv2.CorsHttpMethod.GET]
      }
    })

    // Creating lambdaIntegrations for API
    const getShadowIntegration = new HttpLambdaIntegration("GetShadowIntegration", getShadowHandler)
    const UpdateShadowIntegration = new HttpLambdaIntegration("UpdateShadowIntegration", updateShadowHandler)

    // Adding routes for API
    httpAPI.addRoutes({
      path: '/getshadow/{deviceId}',
      methods: [apigwv2.HttpMethod.GET],
      integration: getShadowIntegration
    })

    httpAPI.addRoutes({
      path: '/updateshadow/{deviceId}/{deviceSide}/{habitId}',
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.PUT],
      integration: UpdateShadowIntegration
    })
  }
}
