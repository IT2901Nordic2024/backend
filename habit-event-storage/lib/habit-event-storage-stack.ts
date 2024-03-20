import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { aws_iot, aws_iam, aws_s3_deployment } from 'aws-cdk-lib'
import * as path from 'path'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { HabitEventStorage } from './habitEventStorage'

export class HabitEventStorageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const habitEventStorag = new HabitEventStorage(this, 'habitEventStorage')

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
     * is sent to the 'firmwareSimulatorThing' topic.
     */
    const protocolBuffersToJSONRule = new aws_iot.CfnTopicRule(this, 'ProtocolBuffersToJSONRule', {
      topicRulePayload: {
        //sql: "SELECT * FROM 'firmwareSimulatorThing'",
        sql: "SELECT VALUE decode(* , 'proto','protocolBuffersToJSONS3Bucket','fromFirmwareToBackend.desc', 'fromFirmwareToBackend', 'habit_data') AS data FROM 'firmwareSimulatorThing'",
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

    /**
     * s3 bucket to hold the files needed to translate incomming protocol buffer messages
     *
     */
    //const protocolBuffersToJSONS3Bucket = new s3.Bucket(this, 'protocolBuffersToJSONS3Bucket')

    /* Putting the ziped folder containing the descriptor files of the protobuff messages to be received from firmware
     * into the  protocolBuffersToJSONS3Bucket s3 bucket.
     */
    /*new aws_s3_deployment.BucketDeployment(this, 'DeployFiles', {
      sources: [aws_s3_deployment.Source.asset(path.join(__dirname, '../proto-files/fromFirmwareToBackend.zip'))],
      destinationBucket: protocolBuffersToJSONS3Bucket,
    })*/

    // Grant aws iot the ability to read the files in protocolBuffersToJSONS3Bucket
    // protocolBuffersToJSONS3Bucket.grantRead(new aws_iam.ServicePrincipal('iot.amazon.com'))
  }
}
