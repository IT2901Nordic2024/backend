import { Construct } from 'constructs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'

export class HabitEventStorage extends Construct {
  public readonly getHabitEventFunction: lambda.Function
  public readonly updateHabitEventFunction: lambda.Function

  constructor(scope: Construct, id: string) {
    super(scope, id)

    const table = new dynamodb.Table(this, 'HabitEventTable', {
      tableName: 'HabitEventTable',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: 'habitId', type: dynamodb.AttributeType.NUMBER },
    })

    const getHabitEventFunction = new lambda.Function(this, 'GetHabitEventFunction', {
      handler: 'getHabitEvents.handler',
      code: lambda.Code.fromAsset('lambda'),
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        TABLENAME: table.tableName,
      },
    })

    const updateHabitEventFunction = new lambda.Function(this, 'UpdateHabitEventFunction', {
      handler: 'updateHabitEvents.handler',
      code: lambda.Code.fromAsset('lambda'),
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        TABLENAME: table.tableName,
      },
    })

    this.getHabitEventFunction = getHabitEventFunction
    this.updateHabitEventFunction = updateHabitEventFunction

    table.grantReadData(getHabitEventFunction)
    table.grantReadWriteData(updateHabitEventFunction)

    const httpApi = new HabitEventStorage(this, 'habitEventStorage')
  }
}
