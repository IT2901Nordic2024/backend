#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ActivityStorageStack } from '../lib/activity_storage-stack';

const app = new cdk.App();
new ActivityStorageStack(app, 'ActivityStorageStack');
