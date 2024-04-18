import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class UserPoolStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'UserPoolQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const loginFunction = new lambda.Function(this, "LoginFunction", {
      functionName: "LoginFunction",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "login.handler",
      code: lambda.Code.fromAsset("lambda"),
    });
  }
}
