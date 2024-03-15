import * as cdk from 'aws-cdk-lib'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import { Construct } from 'constructs'
import { HabitStorage } from './habitStorage'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'

export class HabitStorageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    //Creating HabitStorage construct
    const habitStorage = new HabitStorage(this, 'HabitStorage')

    //Creating API, and configures CORS to allow GET methods
    const httpApi = new apigwv2.HttpApi(this, 'HabitStorageHTTP', {
      corsPreflight: {
        allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.POST],
      },
    })

    //Integration for lambda function
    const getHabitsLambdaIntegration = new HttpLambdaIntegration('getHabitEvents', habitStorage.getHabitsHandler)
    const createHabitLambdaIntegration = new HttpLambdaIntegration(
      'CreateHabitIntegration',
      habitStorage.createHabitHandler,
    )

    //Adding integration to relevant API routes
    httpApi.addRoutes({
      path: '/habits',
      methods: [apigwv2.HttpMethod.GET],
      integration: getHabitsLambdaIntegration,
    })

    httpApi.addRoutes({
      path: '/habits/{userId}',
      methods: [apigwv2.HttpMethod.GET],
      integration: getHabitsLambdaIntegration,
    })

    httpApi.addRoutes({
      path: '/createHabit/{userId}/{deviceId}/{habitName}/{habitType}',
      methods: [apigwv2.HttpMethod.GET],
      integration: createHabitLambdaIntegration,
    })
  }
}
