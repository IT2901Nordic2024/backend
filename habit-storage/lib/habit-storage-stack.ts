import * as cdk from 'aws-cdk-lib';
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2"
import { Construct } from 'constructs';
import { HabitStorage } from './habitTable';
import { HttpUrlIntegration, HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
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

    const httpApi = new apigwv2.HttpApi(this, "HabitStorageHTTP");

    httpApi.addRoutes({
      path: '/items',
      methods: [ apigwv2.HttpMethod.GET ],
      integration: lambdaIntegration,
    }
    )
    httpApi.addRoutes({
      path: '/items/{id}',
      methods: [ apigwv2.HttpMethod.GET ],
      integration: lambdaIntegration,
    }
    )

  }
}
