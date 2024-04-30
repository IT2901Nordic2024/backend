import { Construct } from 'constructs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { HttpApi } from './httpApi'

export class HabitEventStorage extends Construct {
  // Makes the functions readable for outside constructs
  public readonly habitEventTable: dynamodb.Table

  constructor(scope: Construct, id: string) {
    super(scope, id)

    // Creates table with partitionKey and sortKey
    const table = new dynamodb.Table(this, 'HabitEventTable', {
      tableName: 'HabitEventTable',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'habitId', type: dynamodb.AttributeType.NUMBER },
    })

    // Creates all lambdafunctions for interracting with the database
    const getHabitEventFunction = new lambda.Function(this, 'GetHabitEventFunction', {
      functionName: 'getHabitEventById',
      handler: 'getHabitEvents.handler',
      code: lambda.Code.fromAsset('lambda'),
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        TABLENAME: table.tableName,
      },
    })

    const getHabitEventsFromUserFunction = new lambda.Function(this, 'GetHabitEventFromUserFunction', {
      functionName: 'getHabitEventsFromUser',
      handler: 'getHabitEventFromUser.handler',
      code: lambda.Code.fromAsset('lambda'),
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        TABLENAME: table.tableName,
      },
    })

    const setHabitGoalFunction = new lambda.Function(this, 'SetHabitGoal', {
      functionName: 'SetHabitGoal',
      handler: 'setHabitGoal.handler',
      code: lambda.Code.fromAsset('lambda'),
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        TABLENAME: table.tableName,
      },
    })

    const getHabitGoalFunction = new lambda.Function(this, 'GetHabitGoalFunction', {
      functionName: 'GetHabitGoalFunction',
      handler: 'getHabitGoal.handler',
      code: lambda.Code.fromAsset('lambda'),
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        TABLENAME: table.tableName,
      },
    })

    this.habitEventTable = table

    // Grants all functions necessary access to the database
    table.grantReadData(getHabitEventFunction)
    table.grantReadData(getHabitEventsFromUserFunction)
    table.grantReadWriteData(setHabitGoalFunction)
    table.grantReadWriteData(getHabitGoalFunction)

    // creates HTTP API that uses the lambdafucntions to interract with the database
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const httpApi = new HttpApi(this, 'habitEventStorage', {
      getHabitEventFunction: getHabitEventFunction,
      getHabitEventsFromUserFunction: getHabitEventsFromUserFunction,
      setHabitGoalFunction: setHabitGoalFunction,
      getHabitGoalFunction: getHabitGoalFunction,
    })
  }
}

// Type for the httpAPI below
export type httpApiProps = {
  getHabitEventFunction: lambda.Function
  getHabitEventsFromUserFunction: lambda.Function
  setHabitGoalFunction: lambda.Function
  getHabitGoalFunction: lambda.Function
}
