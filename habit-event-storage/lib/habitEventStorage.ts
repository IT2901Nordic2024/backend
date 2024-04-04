import { Construct } from 'constructs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { HttpApi } from './httpApi'

// Type for the httpAPI below
export type httpApiProps = {
  getHabitEventFunction: lambda.Function
  getHabitEventsFromUserFunction: lambda.Function
  updateHabitEventFunction: lambda.Function
}

export class HabitEventStorage extends Construct {
  // Makes the functions readable for outside constructs
  public readonly getHabitEventFunction: lambda.Function
  public readonly getHabitEventsFromUserFunction: lambda.Function
  public readonly updateHabitEventFunction: lambda.Function

  constructor(scope: Construct, id: string) {
    super(scope, id)

    // Creates table with partitionKey and sortKey
    const table = new dynamodb.Table(this, 'HabitEventTable', {
      tableName: 'HabitEventTable',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.NUMBER },
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

    const updateHabitEventFunction = new lambda.Function(this, 'UpdateHabitEventFunction', {
      functionName: 'UpdateHabitEvent',
      handler: 'updateHabitEvents.handler',
      code: lambda.Code.fromAsset('lambda'),
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        TABLENAME: table.tableName,
      },
    })

    this.getHabitEventFunction = getHabitEventFunction
    this.getHabitEventsFromUserFunction = getHabitEventsFromUserFunction
    this.updateHabitEventFunction = updateHabitEventFunction

    // Grants all functions necessary access to the database
    table.grantReadData(getHabitEventFunction)
    table.grantReadData(getHabitEventsFromUserFunction)
    table.grantReadWriteData(updateHabitEventFunction)

    // creates HTTP API that uses the lambdafucntions to interract with the database
    const httpApi = new HttpApi(this, 'habitEventStorage', {
      getHabitEventFunction: getHabitEventFunction,
      updateHabitEventFunction: updateHabitEventFunction,
      getHabitEventsFromUserFunction: getHabitEventsFromUserFunction,
    })
  }
}
