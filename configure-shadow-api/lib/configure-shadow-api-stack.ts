import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2' 
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ConfigureShadowApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'ConfigureShadowApiQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // Declaring lambda handler
    const handler = new lambda.Function(this, "PostShadowConfigurationFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "postShadow.handler",
      code: lambda.Code.fromAsset("lambda"),
      functionName: "PostShadowConfiguration"
    })

    // Initiating HTTP-API for updating the deviceshadow
    const httpAPI = new apigwv2.HttpApi(this, "ConfigureShadow", {
      corsPreflight: {
        allowMethods: [apigwv2.CorsHttpMethod.POST]
      }
    })

    // Creating lambdaIntegration for API
    const lambdaIntegration = new HttpLambdaIntegration("PostShadowConfigurationAPI", handler)

    // Adding route for API
    httpAPI.addRoutes({
      path: 'shadow/{deviceId}',
      methods: [apigwv2.HttpMethod.POST],
      integration: lambdaIntegration
    })
  }
}
