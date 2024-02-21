import * as cdk from 'aws-cdk-lib';
import * as apigw from "aws-cdk-lib/aws-apigateway"
import { Construct } from 'constructs';
import { HabitStorage } from './habitTable';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class HabitStorageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'HabitStorageQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const habitStorage = new HabitStorage(this, "HabitStorage", {name: "Steve"})
    const lambdaIntegration = new HttpLambdaIntegration("getActivities", habitStorage.handler)

    const api = new apigw.RestApi(this, "HabitStorageREST", {
    });

    const items = api.root.addResource('items');
    const itemsIntegration = new apigw.LambdaIntegration(habitStorage.handler);

    items.addMethod("GET", itemsIntegration)


  }
}
