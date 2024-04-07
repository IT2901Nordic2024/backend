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
    const habitTable = new dynamodb.Table(this, 'HabitTable', {
      tableName: 'HabitTable',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.NUMBER },
    })

    // Handler for accessing DynamoDB table
    const getHabitsHandler = new lambda.Function(this, 'GetHabitsHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getHabits.handler',
      code: lambda.Code.fromAsset('lambda'),
      functionName: 'GetHabits',

      environment: {
        HABIT_TABLE_NAME: habitTable.tableName,
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
        HABIT_TABLE_NAME: habitTable.tableName,
      },
    })

    const createHabitHandler = new lambda.Function(this, 'CreateHabitHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'createHabit.handler',
      code: lambda.Code.fromAsset('lambda'),
      functionName: 'CreateHabit',
      role: createHabitHandlerRole,

      environment: {
        HABIT_TABLE_NAME: habitTable.tableName,
      },
    })

    // Setting the table and handler for this construct
    this.table = habitTable
    this.getHabitsHandler = getHabitsHandler
    this.createHabitHandler = createHabitHandler
    this.getHabitsWithSideHandler = getHabitWithSide

    // Granting handler read and write access to the table
    habitTable.grantReadWriteData(this.getHabitsHandler)
    habitTable.grantReadWriteData(this.createHabitHandler)
    habitTable.grantReadData(this.getHabitsWithSideHandler)
  }
}
