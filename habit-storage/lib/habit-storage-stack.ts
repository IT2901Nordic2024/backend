import * as cdk from 'aws-cdk-lib'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import { Construct } from 'constructs'
import { HabitStorage } from './habitStorage'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'

export class HabitStorageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    //Creating HabitStorage construct
    const habitStorage = new HabitStorage(this, 'HabitStorage', props)

    //Creating API, and configures CORS to allow GET methods
    const httpApi = new apigwv2.HttpApi(this, 'HabitStorageHTTP', {
      corsPreflight: {
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowOrigins: ['*'],
        allowHeaders: ['*'],
        allowCredentials: false,
      },
    })

    //Integration for lambda function
    const createHabitLambdaIntegration = new HttpLambdaIntegration(
      'CreateHabitIntegration',
      habitStorage.createHabitHandler,
    )
    const getHabitsWithSideIntegration = new HttpLambdaIntegration(
      'GetHabitsWithSideIntegration',
      habitStorage.getHabitsWithSideHandler,
    )
    const editHabitIntegration = new HttpLambdaIntegration('EditHabitIntegration', habitStorage.editHabitHandler)
    const deleteHabitIntegration = new HttpLambdaIntegration('DeleteHabitIntegration', habitStorage.deleteHabitHandler)

    //Adding integration to relevant API routes
    httpApi.addRoutes({
      path: '/habits/{userId}',
      methods: [apigwv2.HttpMethod.GET],
      integration: getHabitsWithSideIntegration,
    })

    httpApi.addRoutes({
      path: '/createHabit/{userId}/{deviceId}/{habitName}/{habitType}/{deviceSide}',
      methods: [apigwv2.HttpMethod.PUT],
      integration: createHabitLambdaIntegration,
    })

    httpApi.addRoutes({
      path: '/editHabit/{userId}/{deviceId}/{habitId}/{habitName}/{deviceSide}',
      methods: [apigwv2.HttpMethod.PUT],
      integration: editHabitIntegration,
    })

    httpApi.addRoutes({
      path: '/deleteHabit/{userId}/{habitId}',
      methods: [apigwv2.HttpMethod.DELETE],
      integration: deleteHabitIntegration,
    })
  }
}
