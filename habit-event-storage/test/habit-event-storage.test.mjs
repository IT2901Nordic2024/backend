import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import * as HabitEventStorage from '../lib/habit-event-storage-stack'
import { test } from '@jest/globals'

// example test. To run these tests, uncomment this file along with the
// example resource in lib/habit-event-storage-stack.ts
test('Lambda functions created', () => {
  const app = new cdk.App()
  const stack = new HabitEventStorage.HabitEventStorageStack(app, 'MyTestStack')

  const template = Template.fromStack(stack)
  template.resourceCountIs('AWS::Lambda::Function', 6)
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        TABLENAME: {
          Ref: 'habitEventStorageHabitEventTableB5952187',
        },
      },
    },
    FunctionName: 'getHabitEventById',
    Handler: 'getHabitEvents.handler',
    Role: {
      'Fn::GetAtt': ['habitEventStorageGetHabitEventFunctionServiceRole37FBFED3', 'Arn'],
    },
    Runtime: 'nodejs20.x',
  })
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        TABLENAME: {
          Ref: 'habitEventStorageHabitEventTableB5952187',
        },
      },
    },
    FunctionName: 'SetHabitGoal',
    Handler: 'setHabitGoal.handler',
    Role: {
      'Fn::GetAtt': ['habitEventStorageSetHabitGoalServiceRole0818CCD8', 'Arn'],
    },
    Runtime: 'nodejs20.x',
  })
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        TABLENAME: {
          Ref: 'habitEventStorageHabitEventTableB5952187',
        },
      },
    },
    FunctionName: 'GetHabitGoalFunction',
    Handler: 'getHabitGoal.handler',
    Role: {
      'Fn::GetAtt': ['habitEventStorageGetHabitGoalFunctionServiceRole3E05000A', 'Arn'],
    },
    Runtime: 'nodejs20.x',
  })
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        HABIT_EVENT_TABLENAME: {
          Ref: 'habitEventStorageHabitEventTableB5952187',
        },
        USER_DATA_TABLENAME: 'UserDataTable',
      },
    },
    FunctionName: 'storingHabitDataLambda',
    Handler: 'storingHabitDataLambda.handler',
    Role: {
      'Fn::GetAtt': ['storingHabitDataLambdaRole1CDA86BE', 'Arn'],
    },
    Runtime: 'nodejs20.x',
  })
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        AWS_CA_BUNDLE: '/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem',
      },
    },
    Handler: 'index.handler',
    Layers: [
      {
        Ref: 'ProtocolBuffersDescriptorFilesDeploymentAwsCliLayer49C3904F',
      },
    ],
    Role: {
      'Fn::GetAtt': ['CustomCDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756CServiceRole89A01265', 'Arn'],
    },
    Runtime: 'python3.9',
    Timeout: 900,
  })
  template.hasResourceProperties('AWS::Lambda::Function', {
    Handler: 'index.handler',
    Runtime: 'nodejs18.x',
    Timeout: 900,
    Code: {
      S3Bucket: {
        'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}',
      },
      S3Key: '4e26bf2d0a26f2097fb2b261f22bb51e3f6b4b52635777b1e54edbd8e2d58c35.zip',
    },
    Role: {
      'Fn::GetAtt': ['LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB', 'Arn'],
    },
  })
})

test('DynamoDB Table gets created', () => {
  const app = new cdk.App()
  const stack = new HabitEventStorage.HabitEventStorageStack(app, 'MyTestStack')

  const template = Template.fromStack(stack)
  template.resourceCountIs('AWS::DynamoDB::Table', 1)
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    AttributeDefinitions: [
      {
        AttributeName: 'userId',
        AttributeType: 'S',
      },
      {
        AttributeName: 'habitId',
        AttributeType: 'N',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'userId',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'habitId',
        KeyType: 'RANGE',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    TableName: 'HabitEventTable',
  })
})

test('API gets created', () => {
  const app = new cdk.App()
  const stack = new HabitEventStorage.HabitEventStorageStack(app, 'MyTestStack')

  const template = Template.fromStack(stack)
  template.resourceCountIs('AWS::ApiGatewayV2::Api', 1)
  template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
    CorsConfiguration: {
      AllowHeaders: ['*'],
      AllowMethods: ['*'],
      AllowOrigins: ['*'],
    },
    Name: 'HabitEventStorageHTTP',
    ProtocolType: 'HTTP',
  })
})

test('API routes gets created', () => {
  const app = new cdk.App()
  const stack = new HabitEventStorage.HabitEventStorageStack(app, 'MyTestStack')

  const template = Template.fromStack(stack)
  template.resourceCountIs('AWS::ApiGatewayV2::Route', 3)
  template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
    ApiId: {
      Ref: 'habitEventStorageHabitEventStorageHTTP7E86CA03',
    },
    AuthorizationType: 'NONE',
    RouteKey: 'GET /getHabitEvents/{userId}/{habitId}',
    Target: {
      'Fn::Join': [
        '',
        [
          'integrations/',
          {
            Ref: 'habitEventStorageHabitEventStorageHTTPGETgetHabitEventsuserIdhabitIdGetHabitEventIntegration5B2F33DF',
          },
        ],
      ],
    },
  })

  template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
    ApiId: {
      Ref: 'habitEventStorageHabitEventStorageHTTP7E86CA03',
    },
    AuthorizationType: 'NONE',
    RouteKey: 'GET /getHabitGoal/{userId}/{habitId}',
    Target: {
      'Fn::Join': [
        '',
        [
          'integrations/',
          {
            Ref: 'habitEventStorageHabitEventStorageHTTPGETgetHabitGoaluserIdhabitIdGetHabitGoalIntegration5341CCF3',
          },
        ],
      ],
    },
  })

  template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
    ApiId: {
      Ref: 'habitEventStorageHabitEventStorageHTTP7E86CA03',
    },
    AuthorizationType: 'NONE',
    RouteKey: 'ANY /setHabitGoal/{userId}/{habitId}/{question}/{target}/{unit}/{frequency}',
    Target: {
      'Fn::Join': [
        '',
        [
          'integrations/',
          {
            Ref: 'habitEventStorageHabitEventStorageHTTPANYsetHabitGoaluserIdhabitIdquestiontargetunitfrequencySetHabitGoalIntegration662317C4',
          },
        ],
      ],
    },
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Route', {})
})

test('Integrations for API routes gets created', () => {
  const app = new cdk.App()
  const stack = new HabitEventStorage.HabitEventStorageStack(app, 'MyTestStack')

  const template = Template.fromStack(stack)
  template.resourceCountIs('AWS::ApiGatewayV2::Integration', 3)
  template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
    ApiId: {
      Ref: 'habitEventStorageHabitEventStorageHTTP7E86CA03',
    },
    IntegrationType: 'AWS_PROXY',
    IntegrationUri: {
      'Fn::GetAtt': ['habitEventStorageGetHabitEventFunction2293D20F', 'Arn'],
    },
    PayloadFormatVersion: '2.0',
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
    ApiId: {
      Ref: 'habitEventStorageHabitEventStorageHTTP7E86CA03',
    },
    IntegrationType: 'AWS_PROXY',
    IntegrationUri: {
      'Fn::GetAtt': ['habitEventStorageSetHabitGoalC1276363', 'Arn'],
    },
    PayloadFormatVersion: '2.0',
  })
  template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
    ApiId: {
      Ref: 'habitEventStorageHabitEventStorageHTTP7E86CA03',
    },
    IntegrationType: 'AWS_PROXY',
    IntegrationUri: {
      'Fn::GetAtt': ['habitEventStorageGetHabitGoalFunction2AD47724', 'Arn'],
    },
    PayloadFormatVersion: '2.0',
  })
})

test('IoT TopicRule created', () => {
  const app = new cdk.App()
  const stack = new HabitEventStorage.HabitEventStorageStack(app, 'MyTestStack')

  const template = Template.fromStack(stack)
  template.resourceCountIs('AWS::IoT::TopicRule', 1)
  template.hasResourceProperties('AWS::IoT::TopicRule', {
    TopicRulePayload: {
      Actions: [
        {
          Lambda: {
            FunctionArn: {
              'Fn::GetAtt': ['storingHabitDataLambda3038C5B0', 'Arn'],
            },
          },
        },
        {
          Republish: {
            Qos: 1,
            RoleArn: {
              'Fn::GetAtt': ['writeToMQTTRole7BEC4BB6', 'Arn'],
            },
            Topic: 'lambdaOutput',
          },
        },
      ],
      AwsIotSqlVersion: '2016-03-23',
      ErrorAction: {
        Republish: {
          Qos: 1,
          RoleArn: {
            'Fn::GetAtt': ['writeToMQTTRole7BEC4BB6', 'Arn'],
          },
          Topic: 'lambdaOutput',
        },
      },
      Sql: {
        'Fn::Join': [
          '',
          [
            "SELECT decode(*, 'proto', '",
            {
              Ref: 'protocolBuffersDescriptorFilesBucket73BBC26F',
            },
            "','fromFirmwareToBackend.desc','fromFirmwareToBackend','habit_data') AS payload, topic(2) AS deviceId  FROM 'habitTrackerData/+/events'",
          ],
        ],
      },
    },
  })
})
/*
test('XXXXXXXXXX functions created', () => {
  const app = new cdk.App()
  const stack = new HabitEventStorage.HabitEventStorageStack(app, 'MyTestStack')

  const template = Template.fromStack(stack)
  template.resourceCountIs('XXXXXXXXXX', 1)
  template.hasResourceProperties('XXXXXXXXXX', {})
})

test('XXXXXXXXXX functions created', () => {
  const app = new cdk.App()
  const stack = new HabitEventStorage.HabitEventStorageStack(app, 'MyTestStack')

  const template = Template.fromStack(stack)
  template.resourceCountIs('XXXXXXXXXX', 1)
  template.hasResourceProperties('XXXXXXXXXX', {})
})

test('XXXXXXXXXX functions created', () => {
  const app = new cdk.App()
  const stack = new HabitEventStorage.HabitEventStorageStack(app, 'MyTestStack')

  const template = Template.fromStack(stack)
  template.resourceCountIs('XXXXXXXXXX', 1)
  template.hasResourceProperties('XXXXXXXXXX', {})
})

test('XXXXXXXXXX functions created', () => {
  const app = new cdk.App()
  const stack = new HabitEventStorage.HabitEventStorageStack(app, 'MyTestStack')

  const template = Template.fromStack(stack)
  template.resourceCountIs('XXXXXXXXXX', 1)
  template.hasResourceProperties('XXXXXXXXXX', {})
})
test('XXXXXXXXXX functions created', () => {
  const app = new cdk.App()
  const stack = new HabitEventStorage.HabitEventStorageStack(app, 'MyTestStack')

  const template = Template.fromStack(stack)
  template.resourceCountIs('XXXXXXXXXX', 1)
  template.hasResourceProperties('XXXXXXXXXX', {})
})
*/
