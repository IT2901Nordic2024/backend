import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import * as iam from 'aws-cdk-lib/aws-iam'

/**
 * This file contains the table for storing diffrent habits, and a handler for interracting with it
 */

export class HabitStorage extends Construct {
  // Making handler and table public for all
  public readonly table: dynamodb.Table
  public readonly getHabitsHandler: lambda.Function
  public readonly getHabitsWithSideHandler: lambda.Function
  public readonly createHabitHandler: lambda.Function
  public readonly editHabitHandler: lambda.Function

  constructor(scope: Construct, id: string) {
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
            resources: ['arn:aws:iot:eu-north-1:339713040007:thing/*'],
          }),
        ],
      }),
    )

    // Creating DynamoDB table. Sort key is included in case more than one row is needed
    const userDataTable = new dynamodb.Table(this, 'UserDataTable', {
      tableName: 'UserDataTable',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.NUMBER },
    })

    const indexName: dynamodb.GlobalSecondaryIndexProps = {
      // REMOVE NOW
      indexName: 'indexName',
      partitionKey: {
        name: 'deviceId',
        type: dynamodb.AttributeType.STRING,
      },
    }

    const deviceIdIndex: dynamodb.GlobalSecondaryIndexProps = {
      indexName: 'deviceIdIndex',
      partitionKey: {
        name: 'deviceId',
        type: dynamodb.AttributeType.STRING,
      },
    }

    userDataTable.addGlobalSecondaryIndex(indexName) // REMOVE NOW
    userDataTable.addGlobalSecondaryIndex(deviceIdIndex)

    // Handler for accessing DynamoDB table
    // TODO: DELETE THIS AFTER CONFIRMING IT IS NOT USED IN FRONTEND
    const getHabitsHandler = new lambda.Function(this, 'GetHabitsHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getHabits.handler',
      code: lambda.Code.fromAsset('lambda'),
      functionName: 'GetHabits',

      environment: {
        USER_DATA_TABLENAME: userDataTable.tableName,
      },
    })

    // TODO: Update role or give this an exclusive role
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

    // Setting the table and handler for this construct
    this.table = userDataTable
    this.getHabitsHandler = getHabitsHandler
    this.createHabitHandler = createHabitHandler
    this.getHabitsWithSideHandler = getHabitWithSide
    this.editHabitHandler = editHabitHandler

    // Granting handler read and write access to the table
    userDataTable.grantReadWriteData(this.getHabitsHandler)
    userDataTable.grantReadWriteData(this.createHabitHandler)
    userDataTable.grantReadWriteData(this.editHabitHandler)
    userDataTable.grantReadData(this.getHabitsWithSideHandler)
  }
}
