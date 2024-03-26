import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { aws_iot, aws_iam, aws_s3_deployment, Stack } from 'aws-cdk-lib'
import * as path from 'path'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { HabitEventStorage } from './habitEventStorage'
import { write } from 'fs'

export class HabitEventStorageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const habitEventStorag = new HabitEventStorage(this, 'habitEventStorage')

    // The code that defines your stack goes here

    //---------------------------------------------------------------------------
    //                           STORING PROTOCOL BUFFERS DESCRIPTOR FILES
    //---------------------------------------------------------------------------

    /**
     * s3 bucket to hold the files needed to translate incomming protocol buffer messages
     *
     */
    const protocolBuffersDescriptorFilesBucket = new s3.Bucket(this, 'protocolBuffersDescriptorFilesBucket')

    /**
     * Defining the policy for protocolBuffersDescriptorFilesBucket
     * Allows aws iot to access the bucket and its contents.
     */
    const protocolBuffersDescriptorFilesBucketPolicy = new aws_iam.PolicyStatement({
      effect: aws_iam.Effect.ALLOW,
      principals: [new aws_iam.ServicePrincipal('iot.amazonaws.com')], // List of all services that are granted the level of access, to the s3 bucket, specified in this policy
      actions: ['s3:Get*'], // Allows for all objects in the s3 bucket, that are of the type specified under 'resources', to be accessed
      resources: [protocolBuffersDescriptorFilesBucket.bucketArn + '/' + 'fromFirmwareToBackend.desc'], // Specifies the resources to which the 'action's above apply
    })

    /**
     * Attaching the protocolBuffersDescriptorFilesBucketPolicy to the protocolBuffersDescriptorFilesBucket
     */
    protocolBuffersDescriptorFilesBucket.addToResourcePolicy(protocolBuffersDescriptorFilesBucketPolicy)

    /**
     * Populating the protocolBuffersDescriptorFilesBucket with the descriptor files
     *
     * Sources:
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3_deployment-readme.html
     * https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-arn-format.html
     */
    new aws_s3_deployment.BucketDeployment(this, 'ProtocolBuffersDescriptorFilesDeployment', {
      sources: [aws_s3_deployment.Source.asset(path.join(__dirname, '../proto-files/fromFirmwareToBackend.zip'))],
      destinationBucket: protocolBuffersDescriptorFilesBucket,
    })

    //---------------------------------------------------------------------------
    //        DECODING AND STORING INCOMMING MESSAGES FROM HABIT TRACKER
    //---------------------------------------------------------------------------

    /**
     * Lambda function that translates incomming messages in protocol buffer format into
     * messages in JSON.
     *  */
    const storingHabitDataLambda = new lambda.Function(this, 'storingHabitDataLambda', {
      // 'storingHabitDataLambda is the id of the lambda function

      runtime: lambda.Runtime.NODEJS_20_X, // the runtime environment for the lambda function
      handler: 'storingHabitDataLambda.handler', // The name of the method that lambda calls to execute this function. It is the filename.nameOfHandlerMethod
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // Gets the source code of the lambda function from the lambda directory/folder
      functionName: 'storingHabitDataLambda', // Name of the function,
      description:
        'Lambda function that stores incomming messages from the habit tracker after they have been decoded by the topic rule protocolBuffersToJSONRule ',
    })

    //Role with permission to write to mqtt topic 'lambdaOutput'
    const writeToMQTTRole = new aws_iam.Role(this, 'writeToMQTTRole', {
      assumedBy: new aws_iam.ServicePrincipal('iot.amazonaws.com'),
    })

    const writeToMQTTPolicy = new aws_iam.Policy(this, 'writeToMQTTPolicy', {
      statements: [
        new aws_iam.PolicyStatement({
          actions: ['iot:Publish'],
          resources: ['arn:aws:iot:*:*:topic/lambdaOutput'],
        }),
      ],
    })

    writeToMQTTRole.attachInlinePolicy(writeToMQTTPolicy)

    /**
     * A TopiCRule that decodes the incomming protocol buffer messages from the habit tracker device
     * sent to the 'habitTrackerData/+' topic and then executes the lambda function storingHabitDataLambda
     * which stores data in a database.
     *
     * It also republishes the decoded message to the 'test/habitTrackerData/JSON' topic.
     *
     * The sql query
     * decodes a message (binary payload) that is encoded in base64,
     * and that is a proto(col buffer) message,
     * uses the protocolBuffersDescriptorFilesBucket,
     * specifically the fromFirmwareToBackend.desc in the bucket,
     * habit_data is the message specified in the .proto file,
     * checks for messages sent to the 'habitTrackerData/+', where + is a wildecard standing for the deviceID of the habit tracker device.
     *
     * Sources:
     * https://www.youtube.com/watch?v=WrU_zh7ofys&t=33s (The format of the sql request in this video is no longer up to date, at least in resulted in errors here)
     * https://docs.aws.amazon.com/iot/latest/developerguide/iot-sql-from.html
     * https://docs.aws.amazon.com/iot/latest/developerguide/iot-sql-functions.html#iot-sql-decode-base64 (The format here is what worked)
     * https://protobuf.dev/
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_iot.CfnTopicRule.html
     * https://docs.aws.amazon.com/iot/latest/developerguide/republish-rule-action.html
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_iam.Role.html
     *
     */
    const protocolBuffersToJSONRule = new aws_iot.CfnTopicRule(this, 'ProtocolBuffersToJSONRule', {
      topicRulePayload: {
        sql: "SELECT VALUE decode(*, 'proto', 'protocolBuffersDescriptorFilesBucket','fromFirmwareToBackend.desc','fromFirmwareToBackend','habit_data') AS message FROM 'habitTrackerData/+'",
        actions: [
          {
            lambda: {
              functionArn: storingHabitDataLambda.functionArn, // Specifying the lambda function to be activated
            },
          },
          {
            // Republishing the decoded message to 'test/habitTrackerData/JSON'
            republish: {
              topic: 'lambdaOutput',
              qos: 1,
              roleArn: writeToMQTTRole.roleArn,
            },
          },
        ],
        errorAction: {
          republish: {
            roleArn: writeToMQTTRole.roleArn,
            topic: 'lambdaOutput',
            qos: 1,
          },
        },
      },
    })

    /**
     * Allowing protocolBuffersToJSONRule to read from the 'habitTrackerData/+' topic
     */

    /*
    //Defining the IAM role
    const readFromMQTTTopicRole = new aws_iam.Role(this, 'readFromMQTTTopicRole', {
      assumedBy: new aws_iam.ServicePrincipal('iot.amazonaws.com'),
    })

    // Defining policy granting necessary permission(s)
    const readFromMQTTTopicPolicy = new aws_iam.Policy(this, 'readFromMQTTTopicPolicy', {
      statements: [
        new aws_iam.PolicyStatement({
          actions: ['iot:Receive'],
          resources: [protocolBuffersToJSONRule.attrArn],
        }),
      ],
    })

    // Adding the policy to the role created above
    readFromMQTTTopicRole.attachInlinePolicy(readFromMQTTTopicPolicy)

    // Overriding the roleArn property of protocolBuffersToJSONRule with the roleArn of the IAM role from above, thereby granting the necessary permissions to the rule
    protocolBuffersToJSONRule.addPropertyOverride('roleArn', readFromMQTTTopicRole.roleArn)
    */

    /**
     * Allowing storingHabitDataLambda to be called / invoked by protocolBuffersToJSONRule
     * NOTE: addPermission is equivalent to grantInvoke(ServicePrincipal) (see source below)
     *
     * Sources:
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda.Permission.html
     */
    storingHabitDataLambda.addPermission('protocolBuffersToJSONRule', {
      principal: new aws_iam.ServicePrincipal('iot.amazonaws.com'),
      sourceArn: protocolBuffersToJSONRule.attrArn,
    })
  }
}
