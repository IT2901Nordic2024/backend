import { Construct } from 'constructs'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { httpApiProps } from './habitEventStorage'

export class HttpApi extends Construct {
  constructor(scope: Construct, id: string, props: httpApiProps) {
    super(scope, id)

    const api = new apigwv2.HttpApi(this, 'HabitEventStorageHTTP', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.PUT],
      },
      apiName: 'HabitEventStorageHTTP',
    })

    const getHabitEventIntegration = new HttpLambdaIntegration('GetHabitEventIntegration', props.getHabitEventFunction)
    const updateHabitEventIntegration = new HttpLambdaIntegration(
      'GetHabitEventIntegration',
      props.updateHabitEventFunction
    )
    api.addRoutes({
      path: '/habitEvents/{userId}',
      methods: [apigwv2.HttpMethod.GET],
      integration: getHabitEventIntegration,
    })

    api.addRoutes({
      path: '/habitEvents/{userId}/{habitId}',
      methods: [apigwv2.HttpMethod.GET],
      integration: getHabitEventIntegration,
    })

    api.addRoutes({
      path: '/habitEvents/{userId}/{habitId}/{habitEventId}',
      methods: [apigwv2.HttpMethod.PUT],
      integration: updateHabitEventIntegration,
    })
  }
}
