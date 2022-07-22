/**
 * Test layer
 *
 * @group e2e
 * 
 */

import * as cdk from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as LayerPublisher from '../../src/layer-publisher-stack';
import { deployStack, destroyStack } from './utils/cdk-cli';
import { generateUniqueName, invokeFunction } from './utils/e2eUtils';
import { LEVEL } from './utils/InvocationLogs';

const runtime = lambda.Runtime.ALL.find((r) => r.name === process.env.RUNTIME) ?? lambda.Runtime.NODEJS_14_X;

const powerToolsPackageVersion = '1.0.1';

const e2eTestLayerPublicationApp = new cdk.App();

const layerStack = new LayerPublisher.LayerPublisherStack(
  e2eTestLayerPublicationApp,
  `E2ELayerPublisherStack-${runtime.name.split('.')[0]}`,
  {
    layerName: `e2e-tests-layer-${runtime.name.split('.')[0]}`,
    powerToolsPackageVersion: powerToolsPackageVersion,
    ssmParameterLayerArn: '/e2e-tests-layertools-layer-arn',
  }
);

test(`The layer Created is usable with ${runtime} runtime lambda`, async () => {
  // GIVEN
  const { consumerStack, functionName } = createSampleLambda(runtime);

  await deployStack(e2eTestLayerPublicationApp, layerStack);
  await deployStack(e2eTestLayerPublicationApp, consumerStack);

  // WHEN
  const invocationLogs = await invokeFunction(functionName);

  // THEN
  try {
    const errorLogs = invocationLogs[0].getFunctionLogs(LEVEL.ERROR);
    expect(errorLogs.length).toBe(0);

    const debugLogs = invocationLogs[0].getFunctionLogs(LEVEL.DEBUG);
    expect(debugLogs.length).toBe(1);
  } catch (error) {
    console.log(JSON.stringify(invocationLogs));
    throw error;
  }
  finally {
    await destroyStack(e2eTestLayerPublicationApp, consumerStack);
  }
}, 900000);

const createSampleLambda = (runtime: cdk.aws_lambda.Runtime): { consumerStack: cdk.Stack; functionName: string } => {
  const functionName = generateUniqueName('E2ETest', 'Layer', runtime.name.split('.')[0], 'Consumer');

  const consumerStack = new Stack(e2eTestLayerPublicationApp, `${runtime.name.split('.')[0]}ConsumerStack`);
  new lambda.Function(consumerStack, 'ConsumerFunction', {
    code: lambda.Code.fromInline(`
    const { Logger } = require('@aws-lambda-powertools/logger');
    const { Metrics } = require('@aws-lambda-powertools/metrics');
    const { Tracer } = require('@aws-lambda-powertools/tracer');

    const logger = new Logger({logLevel: 'DEBUG'});
    const metrics = new Metrics();
    const tracer = new Tracer();

    exports.handler = function(event, ctx) {
      // check logger lib access
      logger.debug("Hello World!"); 
      // Check version
      try {
        const fs = require('fs');

        const packageJSON = JSON.parse(fs.readFileSync('/opt/nodejs/node_modules/@aws-lambda-powertools/logger/package.json', {encoding:'utf8', flag:'r'}));

        if (packageJSON.version != process.env.POWERTOOLS_PACKAGE_VERSION) {
          throw new Error(\`Package version mismatch: \${packageJSON.version} != \${process.env.POWERTOOLS_PACKAGE_VERSION}\`);
        }
      } catch (error) {
        logger.error(error);
      }
    }`),
    handler: 'index.handler',
    functionName,
    runtime: runtime,
    environment: {
      POWERTOOLS_PACKAGE_VERSION: powerToolsPackageVersion,
    },
    layers: [layerStack.lambdaLayerVersion],
  });

  return { consumerStack, functionName };
};
