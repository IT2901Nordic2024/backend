import * as cdk from 'aws-cdk-lib';
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2"
import { Construct } from 'constructs';
import { HabitStorage } from './habitStorage';
import { HttpUrlIntegration, HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class HabitStorageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Creating HabitStorage construct
    const habitStorage = new HabitStorage(this, "HabitStorage")

    //Creating API
    const httpApi = new apigwv2.HttpApi(this, "HabitStorageHTTP");

    //Integration for lambda function
    const lambdaIntegration = new HttpLambdaIntegration("getHabitEvents", habitStorage.handler)

    //Adding integration to relevant API routes
    httpApi.addRoutes({
      path: '/habitEvents',
      methods: [ apigwv2.HttpMethod.GET ],
      integration: lambdaIntegration,
    })
    
    httpApi.addRoutes({
      path: '/habitEvents/{id}',
      methods: [ apigwv2.HttpMethod.GET ],
      integration: lambdaIntegration,
    })
  }
}
