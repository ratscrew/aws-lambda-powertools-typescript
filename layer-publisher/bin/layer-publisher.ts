#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LayerPublisherStack } from '../src/layer-publisher-stack';

const SSM_PARAM_LAYER_ARN = '/layers/powertools-layer-arn';

const app = new cdk.App();
new LayerPublisherStack(app, 'LayerPublisherStack', {
  powerToolsPackageVersion: app.node.tryGetContext('PowerToolsPackageVersion'),
  layerName: 'AWSLambdaPowertoolsTypeScript',
  ssmParameterLayerArn: SSM_PARAM_LAYER_ARN,
});