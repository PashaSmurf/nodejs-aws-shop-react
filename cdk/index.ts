#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsShopStack } from './aws-shop-stack';

const app = new cdk.App();

new AwsShopStack(app, 'AwsShopStack', {
  stackName: 'aws-shop-stack',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});

