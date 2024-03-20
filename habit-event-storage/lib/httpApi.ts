import { Construct } from 'constructs'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'

export class httpApi extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id)
  }
}
