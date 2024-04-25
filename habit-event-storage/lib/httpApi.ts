import { Construct } from 'constructs'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { httpApiProps } from './habitEventStorage'

export class HttpApi extends Construct {
  constructor(scope: Construct, id: string, props: httpApiProps) {
    super(scope, id)

    // Creates the API with necessary cors settings to access from rontend
    const api = new apigwv2.HttpApi(this, 'HabitEventStorageHTTP', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.PUT],
        allowCredentials: false,
      },
      apiName: 'HabitEventStorageHTTP',
    })

    // Creates integrations from all lambdafunctions
    const getHabitEventIntegration = new HttpLambdaIntegration('GetHabitEventIntegration', props.getHabitEventFunction)
    const updateHabitEventIntegration = new HttpLambdaIntegration(
      'GetHabitEventIntegration',
      props.updateHabitEventFunction
    )
    const getHabitEventFromUserIntegration = new HttpLambdaIntegration(
      'GetHabitEventFromUserIntegration',
      props.getHabitEventsFromUserFunction
    )

    // Adds LInks different integrations to different api-routes
    api.addRoutes({
      path: '/getHabitEvents/{userId}/{habitId}',
      methods: [apigwv2.HttpMethod.GET],
      integration: getHabitEventIntegration,
    })

    api.addRoutes({
      path: '/getHabitEvents/{userId}',
      methods: [apigwv2.HttpMethod.GET],
      integration: getHabitEventFromUserIntegration,
    })

    api.addRoutes({
      path: '/getHabitEvents/{userId}/{habitId}/{habitEventId}',
      methods: [apigwv2.HttpMethod.PUT],
      integration: updateHabitEventIntegration,
    })
  }
}
