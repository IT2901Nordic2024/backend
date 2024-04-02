# habit-event-storage

This directory, habit-event-storage, contains the habit-event-storage-stack and all files necessary for it to function as expected.
The main purpose of this stack is to combine and setup all AWS infrastructure that is needed for receiving and storing information sent by the habit tracker to AWS.

The habit tracker sends infromation such as a timestamp, its ID and some data. This information is sent in the protocol buffers format, specfically protocol buffers 3, to an MQTT topic of the form `habitTrackerData/+`. Note that the '+' is a wildecard that signifies that additional data may come there. Valid topics may, for instance, be `habitTrackerData/123`, `habitTrackerData/blabla` and so on.

Information comming from the habit tracker device activates an AWS topic rule that uses SQL like syntax to get the message from the MQTT topic it was sent to and decodes it. The message is then sent to an AWS lambda function that will store the data in databases established by other stacks.

## Files and Directories

### lambda

This directory contains all the lambda functions created and used in this stack.

#### storingHabitDataLambda.mjs

This mjs file represents the lambda function that stores the decoded messages comming from the habit tracker device.

### lib

The lib directory contains the stack.

#### habit-event-storage-stack.ts

The stack

### proto-files

The proto-files directory contains the protocol buffers descriptor file required to decode a specific message encoded in the protocol buffers format. The descripto file must match the format of the incomming message.

#### fromFirmwareToBackend.proto

The protocol buffers file used to specify the format of the message.
Technically this file does not have to be present in the directory, but is placed here for completeness sake.

#### fromFirmwareToBackend.desc

The descriptor file based on fromFirmwareToBackend.proto
Technically this file does not have to be present in the directory, but is placed here for completeness sake.

#### fromFirmwareToBackend.zip

A zip file containing the fromFirmwareToBackend.desc file. This zip file is used to upload fromFirmwareToBackend.desc to
an s3 bucket (currently called protocolBuffersDescriptorFilesBucket (see habit-event-storage-stack.ts)).
It is important that this file is located in this directory.

## Deployment

The following command can be used to deploy the infrastructure as code to AWS:

- `cdk deploy` or `npx cdk deploy` deploy this stack to your default AWS account/region

## Other

The `cdk.json` file tells the CDK Toolkit how to execute this app.

### Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template
