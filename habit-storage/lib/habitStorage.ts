import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as cdk from 'aws-cdk-lib'

export class HabitStorage extends Construct {
  // Making handler and table public for all
  public readonly table: dynamodb.Table
  public readonly getHabitsWithSideHandler: lambda.Function
  public readonly createHabitHandler: lambda.Function
  public readonly editHabitHandler: lambda.Function
  public readonly deleteHabitHandler: lambda.Function

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id)

    // Creating role for createHabit
    const createHabitHandlerRole = new iam.Role(this, 'CreateHabitHandlerRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'CreateHabitHandlerRole',
    })

    // Attaching policy to createHabit-role
    createHabitHandlerRole.attachInlinePolicy(
      new iam.Policy(this, 'IotShadowRestPolicy', {
        policyName: 'IotShadowRestPolicy',
        statements: [
          new iam.PolicyStatement({
            actions: ['iot:GetThingShadow', 'iot:UpdateThingShadow'],
            resources: [`arn:aws:iot:${props?.env?.region}:${props?.env?.account}:thing/*`],
          }),
          new iam.PolicyStatement({
            actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents', 'logs:DescribeLogStreams'],
            resources: ['arn:aws:logs:*:*:*'],
          }),
          new iam.PolicyStatement({
            actions: ['dynamodb:*'],
            resources: [`arn:aws:dynamodb:${props?.env?.region}:${props?.env?.account}:*`],
          }),
        ],
      }),
    )

    // Creating DynamoDB table. Sort key is included in case more than one row is needed
    const userDataTable = new dynamodb.Table(this, 'UserDataTable', {
      tableName: 'UserDataTable',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    })

    const deviceIdIndex: dynamodb.GlobalSecondaryIndexProps = {
      indexName: 'deviceIdIndex',
      partitionKey: {
        name: 'deviceId',
        type: dynamodb.AttributeType.STRING,
      },
    }

    userDataTable.addGlobalSecondaryIndex(deviceIdIndex)

    // Handlers for interracting with DynamoDB table
    const getHabitWithSide = new lambda.Function(this, 'GetHabitWithSideFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getHabitsWithSide.handler',
      code: lambda.Code.fromAsset('lambda'),
      functionName: 'GetHabitWithSide',
      role: createHabitHandlerRole,
      environment: {
        USER_DATA_TABLENAME: userDataTable.tableName,
      },
    })

    const createHabitHandler = new lambda.Function(this, 'CreateHabitHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'createHabit.handler',
      code: lambda.Code.fromAsset('lambda'),
      functionName: 'CreateHabit',
      role: createHabitHandlerRole,

      environment: {
        USER_DATA_TABLENAME: userDataTable.tableName,
        HABIT_EVENT_TABLENAME: 'HabitEventTable',
      },
    })

    const editHabitHandler = new lambda.Function(this, 'EditHabitHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'editHabit.handler',
      functionName: 'EditHabitHandler',
      role: createHabitHandlerRole,

      environment: {
        USER_DATA_TABLENAME: userDataTable.tableName,
      },
    })

    const deleteHabitHandler = new lambda.Function(this, 'DeleteHabitHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'deleteHabit.handler',
      functionName: 'DeleteHabitHandler',
      role: createHabitHandlerRole,

      environment: {
        USER_DATA_TABLENAME: userDataTable.tableName,
        HABIT_EVENT_TABLENAME: 'HabitEventTable',
      },
    })

    // Setting the table and handler for this construct
    this.table = userDataTable
    this.createHabitHandler = createHabitHandler
    this.getHabitsWithSideHandler = getHabitWithSide
    this.editHabitHandler = editHabitHandler
    this.deleteHabitHandler = deleteHabitHandler

    // Granting handler read and write access to the table
    userDataTable.grantReadWriteData(this.createHabitHandler)
    userDataTable.grantReadWriteData(this.editHabitHandler)
    userDataTable.grantReadData(this.getHabitsWithSideHandler)
    userDataTable.grantReadWriteData(this.deleteHabitHandler)
  }
}
