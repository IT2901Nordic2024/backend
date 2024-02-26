import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2' 
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ConfigureShadowApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'ConfigureShadowApiQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    const httpAPI = new apigwv2.HttpApi(this, "ConfigureShadow", {
      corsPreflight: {
        allowMethods: [apigwv2.CorsHttpMethod.POST]
      }
    })

  }
}
