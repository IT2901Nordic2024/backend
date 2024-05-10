# nRFHabitTracker-backend

## Table of Contents

- [Features](#features)

- [Folder Structure](#folder-structure)

- [Technologies](#technologies)

- [Prerequisites](#prerequisites)

- [Getting Started](#getting-started)

- [Testing using hest](#testing-using-jest)

- [E2E-tests](#api-tests)

- [API endpoints](#api-endpoints)
  - [habit-storage](#habit-storage)
  - [habit-event-storage](#habit-event-storage)
  - [user-pool](#user-pool)

## Features

- **User authentification** Basic user system that allows a user to register and log in to their account. Mainly for giving each user their own data, security was not a priority during this project

- **Two database-tables** Each table contain sdifferent types of data. One contains user data such as what habits a user has and which device belongs to them. The other contains the tracked data and goals of each habit

- **APIs** We have different APIs for interracting with the data in our database

- **IoT Core topic routing** We have included rules for invoking lambda functions whenever the firmware beloning to this prosject sends a message. This will store the tracked habit event in a database

- **Device state interraction** We user IoT Core shadows to configure the device

- **IoT Service** We us AWS IoT Core in order to have an MQTT IoT endpoint to connect devices to our cloud services

## Folder Structure

- e2eTesting: Contains api testing for the backend using Httpiness. [Here](https://www.httpiness.com/#/docs) is the documentation for how to use Httpiness

- firmwareSimulator: Tool for simulating the Habitt Tracker. Usefull for testing

- For more information about the firmwareSimulator view: [firmwareSimulator README](firmwareSimulator/README.md)

- habit-event-storage

- lambda: Folder containing lambda functions that is used in this project

- getHabitEvents: Gets all habit events associated with a specific user

- getHabitGoal: Gets habit goal associated with a specific habit

- setHabitGoal: Sets habit goal associated with a specific user

- storingHabitDataLambda: Stores habit event from decoded from firmware device

- lib: CDK code used for the template that gets deployed to cloudformation

- habit-event-storage-stack


- habitEventStorage: Resources of a HTTP api that interracts with HabitEventTable, with the following constructs

- table: DynamoDB table for storing habit events with userId as partition key and habitId as sort key

- Lambda Functions: constructs for running functions from lambda folder

- httpApi: HTTP api construct for invoking lambda functions

- test: Contains all tests for this app. Run tsc compile & npm run test for testing

- getHabitEvents.test: tests getHabitEvents lambda handler

- getHabitGoal.test: tests getHabitGoal lambda handler

- setHabitGoal.test: tests setHabitGoal lambda handler

- storingHabitDataLambda.test: tests storingHabitDataLambda lambda handler

- habit-storage

- lambda: Folder containing lambda functions that is used in this project

- createHabit: Creates item new habit for a specific user in UserDataTable and new item in HabitEventTable for storing habit events associated that habit

- deleteHabit: Deletes all habit data for a specific user in both tables

- editHabit: Edits a specific habit in UserDataTable

- getHabitsWithSide: Gets habits from UserDataTable and matches it with the user's IoT shadow to return every habit for a user with their device side

- lib: CDK code used for the template that gets deployed to cloudformation

- habit-storage-stack

- table: DynamoDB table for storing habit events with userId as partition key

- Lambda Functions: constructs for running functions from lambda folder

- httpApi: HTTP api construct for invoking lambda functions

- test: Contains all tests for this app. Run tsc compile & npm run test for testing

- createHabit.test: tests createHabit lambda handler

- deleteHabit.test: tests deleteHabit lambda handler

- editHabit.test: tests editHabit lambda handler

- getHabitsWithSide.test: tests getHabitsWithSide lambda handler

- user-pool

- lambda: Folder containing lambda functions that is used in this project

- login: Sends username/email and password to our userpool, returns userId for that user

- signup: Creates new user in user pool

- verifyEmail: Verifies user that signed up by using username and verification code from mail

- lib: CDK code used for the template that gets deployed to cloudformation

- habitTrackerUserPool

- habitTrackerUserPoolClient

- Lambda Functions: constructs for running functions from lambda folder

- test: Contains all tests for this app. Run tsc compile & npm run test for testing

- login.test: tests login lambda handler

- signup.test: tests signup lambda handler

- verifyEmail.test: tests verifyEmail lambda handler

## Technologies

List of technologies in our repository

- [Amazon Web Services (AWS)](https://aws.amazon.com/) is a service that provides cloud computing platforms

- [AWS CDK](https://aws.amazon.com/cdk/) is a development framewok for defining and deploying cloud infrastructure

- [AWS Cloudformation](https://aws.amazon.com/cloudformation/) is a service for modeling and managin cloud infrastructure

- [AWS DynamoDB](https://aws.amazon.com/dynamodb/) is a serverless, no-sqld fully managed database from Amazon

- [AWS IoT Core](https://aws.amazon.com/iot-core/) is a cloud solution for connecting IoT devices to other cloud services

- [AWS Lambda](https://aws.amazon.com/lambda/) is a serverless computing service

- [AWS SDK](https://aws.amazon.com/developer/tools/) provides APIs to interract with you AWS cloud services

- [AWS API Gateway](https://aws.amazon.com/api-gateway/) is a cloud service for managing APIs

- [AWS Cognito](https://aws.amazon.com/cognito/) is a managed service for user registration and authentification

- [AWS IAM](https://aws.amazon.com/iam/) is used to manage acesses from one AWS service to another

- [AWS Cloudwatch](https://aws.amazon.com/cloudwatch/) is used to monitor you backend

- [AWS S3](https://aws.amazon.com/s3/) is a service for storing objects in the cloud

- [JavaScript](https://www.javascript.com/) is a programming language commonly used bothback end and frontend web development

- [TypeScript](https://www.typescriptlang.org/) Typescript is strongly typed programming language built on JavaScript

- [Python](https://www.python.org/) is a general-purpose programming language

- [Jest](https://jestjs.io/) is a JavaScript testing library

- [Httpiness](https://www.httpiness.com/) is a minimal client for testing HTTP apis

## Prerequisites

You need to set up your aws account in order to use the code in this repository. [Follow this guide](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install) on how to do that.

## Getting Started

Run the following commands in th treminal from the root folder to deploy our root

`cd habit-event-storage`

`cdk deploy`

`cd ..`

`cd habit-storage`

`cdk deploy`

`cd ..`

`cd user-pool`

`cdk deploy`

## Testing using Jest

In order to test run the Jest tests, cd into the app you want to test and run `tsc & npm run test`

## API-tests

[Here](https://www.httpiness.com/#/docs) is the documentation for how to use Httpiness. Test files are in the e2e tests folder

## API endpoints

Each API has the following parts

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is AuthentificationAPI. Ask you local Backend expert if you cant find the ID

- The attributes in "{}" brackets should be replaced with the attribute you want instead. For example {userId} should be replaced with a user ID when doing the API call
  Also note that each stack has its own api id. These can be found in the AWS API Gateway console

### habit-storage

These API endpoints are used for performing CRUD operations on a users habits
**Getting all userdata (including habits) from user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/habits/{userId}

**Creating a new habit associated with a user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/createHabit/{userId}/{deviceId}/{habitName}/{habitType}/{deviceSide}
Notes about the parameters:

- The habitType must be either "count" or "time"
- deviceSide must be between 0 and 10

**Editing a user's habit's name or deviceSide**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/editHabit/{userId}/{deviceId}/{habitId}/{habitName}/{deviceSide}

Notes about the parameters:

- If you're not going to change habitName or deviceSide, set them as "noChange"

**Deleting a user's habit's name or deviceSide**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/deleteHabit/{userId}/{habitId}

### habit-event-storage

These API endpoints are used for accessing a users habit events and interrating with the habit goals

**Getting data from user with a specific habitId**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/getHabitEvents/{userId}/{habitId}

**Setting habit goal**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/setHabitGoal/{userId}/{habitId}/{question}/{target}/{unit}/{frequency}

**Getting habit goal**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/getHabitGoal/{userId}/{habitId}

### user-pool

These API calls are used for registering and authenticating users

**Registering a user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/signup/{username}/{email}/{deviceId}/{password}

Notes about the parameters:

- usernames and emails must be unique

- Passwords must be at least 6 characters long, and contain at least one lower case letter, one higher case letter and a number

**Verifying a user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/verifyUser/{username}/{confirmationCode}

**Logging in a user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/login/{username}/{password}
s
