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
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowOrigins: ['*'],
        allowHeaders: ['*'],
      },
      apiName: 'HabitEventStorageHTTP',
    })

    // Creates integrations from all lambdafunctions
    const getHabitEventIntegration = new HttpLambdaIntegration('GetHabitEventIntegration', props.getHabitEventFunction)
    const setHabitGoalIntegration = new HttpLambdaIntegration('SetHabitGoalIntegration', props.setHabitGoalFunction)
    const getHabitGoalIntegration = new HttpLambdaIntegration('GetHabitGoalIntegration', props.getHabitGoalFunction)

    // Adds LInks different integrations to different api-routes
    api.addRoutes({
      path: '/getHabitEvents/{userId}/{habitId}',
      methods: [apigwv2.HttpMethod.GET],
      integration: getHabitEventIntegration,
    })

    api.addRoutes({
      path: '/setHabitGoal/{userId}/{habitId}/{question}/{target}/{unit}/{frequency}',
      methods: [apigwv2.HttpMethod.ANY],
      integration: setHabitGoalIntegration,
    })

    api.addRoutes({
      path: '/getHabitGoal/{userId}/{habitId}',
      methods: [apigwv2.HttpMethod.GET],
      integration: getHabitGoalIntegration,
    })
  }
}
