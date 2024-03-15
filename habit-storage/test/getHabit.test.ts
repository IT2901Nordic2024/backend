/* eslint-disable */
/*
import { MockClient } from 'aws-sdk-client-mock'
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
const DynamoDBDocumentClient = require('@aws-sdk/lib-dynamodb')
const MockClient = require('aws-sdk-client-mock')
*/

import { mockClient } from 'aws-sdk-client-mock'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
const handler = require('../lambda/getHabits.mjs')
import { handler } from '../lambda/getHabits'

const ddbMock = mockClient(DynamoDBDocumentClient)
const tableName = process.env.HABIT_TABLE_NAME

beforeEach(() => {
  ddbMock.reset()
})

function cat(a, b) {
  return a + b
}

test('2+2=4', () => {
  expect(cat(2, 2)).toBe(4)
})
