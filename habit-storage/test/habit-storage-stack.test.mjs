import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import * as HabitStorageStack from '../lib/habit-storage-stack'
import { test } from '@jest/globals'

test('Lambda Policy gets created', () => {
  const app = new cdk.App()
  const stack = new HabitStorageStack.HabitStorageStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::Lambda::Function', 4)

  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        USER_DATA_TABLENAME: {
          Ref: 'HabitStorageUserDataTable84AE3DA4',
        },
      },
    },
    FunctionName: 'GetHabitWithSide',
    Handler: 'getHabitsWithSide.handler',
    Role: {
      'Fn::GetAtt': ['HabitStorageCreateHabitHandlerRoleBBA18B2B', 'Arn'],
    },
    Runtime: 'nodejs20.x',
  })
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        USER_DATA_TABLENAME: {
          Ref: 'HabitStorageUserDataTable84AE3DA4',
        },
        HABIT_EVENT_TABLENAME: 'HabitEventTable',
      },
    },
    FunctionName: 'CreateHabit',
    Handler: 'createHabit.handler',
    Role: {
      'Fn::GetAtt': ['HabitStorageCreateHabitHandlerRoleBBA18B2B', 'Arn'],
    },
    Runtime: 'nodejs20.x',
  })
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        USER_DATA_TABLENAME: {
          Ref: 'HabitStorageUserDataTable84AE3DA4',
        },
      },
    },
    FunctionName: 'EditHabitHandler',
    Handler: 'editHabit.handler',
    Role: {
      'Fn::GetAtt': ['HabitStorageCreateHabitHandlerRoleBBA18B2B', 'Arn'],
    },
    Runtime: 'nodejs20.x',
  })
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        USER_DATA_TABLENAME: {
          Ref: 'HabitStorageUserDataTable84AE3DA4',
        },
        HABIT_EVENT_TABLENAME: 'HabitEventTable',
      },
    },
    FunctionName: 'DeleteHabitHandler',
    Handler: 'deleteHabit.handler',
    Role: {
      'Fn::GetAtt': ['HabitStorageCreateHabitHandlerRoleBBA18B2B', 'Arn'],
    },
    Runtime: 'nodejs20.x',
  })
})

test('UserDataTable gets created', () => {
  const app = new cdk.App()
  const stack = new HabitStorageStack.HabitStorageStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::DynamoDB::Table', 1)

  template.hasResourceProperties('AWS::DynamoDB::Table', {
    AttributeDefinitions: [
      {
        AttributeName: 'userId',
        AttributeType: 'S',
      },
      {
        AttributeName: 'deviceId',
        AttributeType: 'S',
      },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'deviceIdIndex',
        KeySchema: [
          {
            AttributeName: 'deviceId',
            KeyType: 'HASH',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    KeySchema: [
      {
        AttributeName: 'userId',
        KeyType: 'HASH',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    TableName: 'UserDataTable',
  })
})

test('HTTP API gets created', () => {
  const app = new cdk.App()
  const stack = new HabitStorageStack.HabitStorageStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::ApiGatewayV2::Api', 1)

  template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
    CorsConfiguration: {
      AllowHeaders: ['*'],
      AllowMethods: ['*'],
      AllowOrigins: ['*'],
    },
    Name: 'HabitStorageHTTP',
    ProtocolType: 'HTTP',
  })
})

test('API routes gets created', () => {
  const app = new cdk.App()
  const stack = new HabitStorageStack.HabitStorageStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::ApiGatewayV2::Route', 4)

  template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
    ApiId: {
      Ref: 'HabitStorageHTTPBE639F00',
    },
    AuthorizationType: 'NONE',
    RouteKey: 'GET /habits/{userId}',
    Target: {
      'Fn::Join': [
        '',
        [
          'integrations/',
          {
            Ref: 'HabitStorageHTTPGEThabitsuserIdGetHabitsWithSideIntegrationAB3F0134',
          },
        ],
      ],
    },
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
    ApiId: {
      Ref: 'HabitStorageHTTPBE639F00',
    },
    AuthorizationType: 'NONE',
    RouteKey: 'PUT /createHabit/{userId}/{deviceId}/{habitName}/{habitType}/{deviceSide}',
    Target: {
      'Fn::Join': [
        '',
        [
          'integrations/',
          {
            Ref: 'HabitStorageHTTPPUTcreateHabituserIddeviceIdhabitNamehabitTypedeviceSideCreateHabitIntegrationE3B4DA0F',
          },
        ],
      ],
    },
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
    ApiId: {
      Ref: 'HabitStorageHTTPBE639F00',
    },
    AuthorizationType: 'NONE',
    RouteKey: 'PUT /editHabit/{userId}/{deviceId}/{habitId}/{habitName}/{deviceSide}',
    Target: {
      'Fn::Join': [
        '',
        [
          'integrations/',
          {
            Ref: 'HabitStorageHTTPPUTeditHabituserIddeviceIdhabitIdhabitNamedeviceSideEditHabitIntegrationCE7B06ED',
          },
        ],
      ],
    },
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
    ApiId: {
      Ref: 'HabitStorageHTTPBE639F00',
    },
    AuthorizationType: 'NONE',
    RouteKey: 'DELETE /deleteHabit/{userId}/{habitId}',
    Target: {
      'Fn::Join': [
        '',
        [
          'integrations/',
          {
            Ref: 'HabitStorageHTTPDELETEdeleteHabituserIdhabitIdDeleteHabitIntegration7D064B14',
          },
        ],
      ],
    },
  })
})

test('API route integrations gets created', () => {
  const app = new cdk.App()
  const stack = new HabitStorageStack.HabitStorageStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::ApiGatewayV2::Integration', 4)

  template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
    ApiId: {
      Ref: 'HabitStorageHTTPBE639F00',
    },
    IntegrationType: 'AWS_PROXY',
    IntegrationUri: {
      'Fn::GetAtt': ['HabitStorageGetHabitWithSideFunction5AF05117', 'Arn'],
    },
    PayloadFormatVersion: '2.0',
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
    ApiId: {
      Ref: 'HabitStorageHTTPBE639F00',
    },
    IntegrationType: 'AWS_PROXY',
    IntegrationUri: {
      'Fn::GetAtt': ['HabitStorageCreateHabitHandler58E5D4C2', 'Arn'],
    },
    PayloadFormatVersion: '2.0',
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
    ApiId: {
      Ref: 'HabitStorageHTTPBE639F00',
    },
    IntegrationType: 'AWS_PROXY',
    IntegrationUri: {
      'Fn::GetAtt': ['HabitStorageEditHabitHandler7AB82979', 'Arn'],
    },
    PayloadFormatVersion: '2.0',
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
    ApiId: {
      Ref: 'HabitStorageHTTPBE639F00',
    },
    IntegrationType: 'AWS_PROXY',
    IntegrationUri: {
      'Fn::GetAtt': ['HabitStorageDeleteHabitHandlerF0BE99AD', 'Arn'],
    },
    PayloadFormatVersion: '2.0',
  })
})

test('CreateHabitHandlerRole with policy gets created', () => {
  const app = new cdk.App()
  const stack = new HabitStorageStack.HabitStorageStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::IAM::Role', 1)
  template.resourceCountIs('AWS::IAM::Policy', 2)

  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
    RoleName: 'CreateHabitHandlerRole',
  })
})
/*
test('XXXXXXXXXXXXXXX gets created', () => {
  const app = new cdk.App()
  const stack = new HabitStorageStack.HabitStorageStack(app, 'MyTestStack')
  const template = Template.fromStack(stack)

  //template.resourceCountIs('XXXXXXXXXXXXXXX', 3)

  //template.hasResourceProperties('XXXXXXXXXXXXXXX', {})
})
*/
