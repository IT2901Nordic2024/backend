import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { aws_iot, aws_iam } from 'aws-cdk-lib'
import * as path from 'path'

export class HabitEventStorageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // The code that defines your stack goes here

    /**
     * Lambda function that translates incomming messages in protocol buffer format into
     * messages in JSON.
     *  */
    const protocolBuffersToJSONLambda = new lambda.Function(this, 'ProtocolBuffersToJSONLambda', {
      // 'ProtocolBuffersToJSONLambda is the id of the lambda function

      runtime: lambda.Runtime.NODEJS_20_X, // the runtime environment for the lambda function
      handler: 'protocolBuffersToJSON.handler', // The name of the method that lambda calls to execute this function. It is the filename.nameOfHandlerMethod
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // Gets the source code of the lambda function from the lambda directory/folder
      functionName: 'ProtocolBuffersToJSONLambda', // Name of the function,
      description:
        'Lambda function that translates incomming messages in protocol buffer format into messages in JSON format.',
    })

    /**
     * The TopicRule that triggers the lambda function every time an mqtt message
     * is sent to the 'firmwareSimulatorThing/updates' topic.
     */
    const protocolBuffersToJSONRule = new aws_iot.CfnTopicRule(this, 'ProtocolBuffersToJSONRule', {
      topicRulePayload: {
        sql: "SELECT * FROM 'firmwareSimulatorThing/updates'",
        actions: [
          {
            lambda: {
              functionArn: protocolBuffersToJSONLambda.functionArn, // Specifying the lambda function to be activated
            },
          },
        ],
      },
    })

    // Giving aws iot the rights to run the lambda function
    protocolBuffersToJSONLambda.addPermission('protocolBuffersToJSONRule', {
      principal: new aws_iam.ServicePrincipal('iot.amazonaws.com'),
      sourceArn: protocolBuffersToJSONRule.attrArn,
    })
  }
}
