---
title: Homepage
description: AWS Lambda Powertools for TypeScript
---

!!! warning  "Do not use this library in production"

    AWS Lambda Powertools for TypeScript is currently released as a beta developer preview and is intended strictly for feedback purposes only.  
    This version is not stable, and significant breaking changes might incur as part of the upcoming [production-ready release](https://github.com/awslabs/aws-lambda-powertools-typescript/milestone/2){target="_blank"}.

    **Do not use this library for production workloads.**

AWS Lambda Powertools for TypeScript provides a suite of utilities for AWS Lambda functions running on the Node.js runtime, to ease the adoption of best practices such as tracing, structured logging, custom metrics, and more.

## Tenets

Core utilities such as Tracer, Logger, Metrics, and Event Handler will be available across all Lambda Powertools runtimes. Additional utilities are subjective to each language ecosystem and customer demand.

* **AWS Lambda only**. We optimise for AWS Lambda function environments and supported runtimes only. Utilities might work with web frameworks and non-Lambda environments, though they are not officially supported.
* **Eases the adoption of best practices**. The main priority of the utilities is to facilitate best practices adoption, as defined in the AWS Well-Architected Serverless Lens; all other functionality is optional.
* **Keep it lean**. Additional dependencies are carefully considered for security and ease of maintenance, and prevent negatively impacting startup time.
* **We strive for backwards compatibility**. New features and changes should keep backwards compatibility. If a breaking change cannot be avoided, the deprecation and migration process should be clearly defined.
* **We work backwards from the community**. We aim to strike a balance of what would work best for 80% of customers. Emerging practices are considered and discussed via Requests for Comment (RFCs)
* **Progressive**. Utilities are designed to be incrementally adoptable for customers at any stage of their Serverless journey. They follow language idioms and their community’s common practices.

## Features

| Utility | Description
| ------------------------------------------------- | ---------------------------------------------------------------------------------
[Tracer](./core/tracer.md) | Utilities to trace Lambda function handlers, and both synchronous and asynchronous functions
[Logger](./core/logger.md) | Structured logging made easier, and a middleware to enrich log items with key details of the Lambda context
[Metrics](./core/metrics.md) | Custom Metrics created asynchronously via CloudWatch Embedded Metric Format (EMF)

## Installation

Powertools is available in the following formats:

* **Lambda Layer**: [**arn:aws:lambda:{region}:017000801446:layer:AWSLambdaPowertoolsPython:19**](#){: .copyMe}:clipboard:
* **NPM**: **`npm install @aws-lambda-powertools/tracer @aws-lambda-powertools/metrics @aws-lambda-powertools/logger`**

???+ hint "Support this project by using Lambda Layers :heart:"
    Lambda Layers allow us to understand who uses this library in a non-intrusive way. This helps us justify and gain future investments for other Lambda Powertools languages.

    When using Layers, you can add Lambda Powertools as a dev dependency (or as part of your virtual env) to not impact the development process.


### Lambda Layer

[Lambda Layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html){target="_blank"} is a .zip file archive that can contain additional code, pre-packaged dependencies, data,  or configuration files. Layers promote code sharing and separation of responsibilities so that you can iterate faster on writing business logic.

You can include Lambda Powertools Lambda Layer using [AWS Lambda Console](https://docs.aws.amazon.com/lambda/latest/dg/invocation-layers.html#invocation-layers-using){target="_blank"}, or your preferred deployment framework.

??? note "Note: Expand to copy any regional Lambda Layer ARN"

    | Region | Layer ARN
    |--------------------------- | ---------------------------
    | `us-east-1` | [arn:aws:lambda:us-east-1:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `us-east-2` | [arn:aws:lambda:us-east-2:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `us-west-1` | [arn:aws:lambda:us-west-1:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `us-west-2` | [arn:aws:lambda:us-west-2:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `ap-south-1` | [arn:aws:lambda:ap-south-1:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `ap-northeast-1` | [arn:aws:lambda:ap-northeast-1:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `ap-northeast-2` | [arn:aws:lambda:ap-northeast-2:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `ap-northeast-3` | [arn:aws:lambda:ap-northeast-3:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `ap-southeast-1` | [arn:aws:lambda:ap-southeast-1:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `ap-southeast-2` | [arn:aws:lambda:ap-southeast-2:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `eu-central-1` | [arn:aws:lambda:eu-central-1:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `eu-west-1` | [arn:aws:lambda:eu-west-1:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `eu-west-2` | [arn:aws:lambda:eu-west-2:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `eu-west-3` | [arn:aws:lambda:eu-west-3:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `eu-north-1` | [arn:aws:lambda:eu-north-1:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `ca-central-1` | [arn:aws:lambda:ca-central-1:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:
    | `sa-east-1` | [arn:aws:lambda:sa-east-1:017000801446:layer:AWSLambdaPowertoolsNodeJS:19](#){: .copyMe}:clipboard:

??? question "Can't find our Lambda Layer for your preferred AWS region?"
    You can use our [CDK Layer Construct](https://github.com/aws-samples/cdk-lambda-powertools-python-layer){target="_blank"}, or NPM like you normally would for any other library.

    Please do file a feature request with the region you'd want us to prioritize making our Lambda Layer available.

=== "SAM"

    ```yaml hl_lines="5"
    MyLambdaFunction:
        Type: AWS::Serverless::Function
        Properties:
            Layers:
                - !Sub arn:aws:lambda:${AWS::Region}:017000801446:layer:AWSLambdaPowertoolsPython:19
    ```

=== "Serverless framework"

    ```yaml hl_lines="5"
	functions:
		hello:
		  handler: lambda_function.lambda_handler
		  layers:
			- arn:aws:lambda:${aws:region}:017000801446:layer:AWSLambdaPowertoolsPython:19
    ```

=== "CDK"

    ```typescript hl_lines="11 16"
    import * as cdk from 'aws-cdk-lib';
    import { Construct } from 'constructs';
    import * as lambda from 'aws-cdk-lib/aws-lambda';

    export class SampleFunctionWithLayer extends Construct {
        constructor(scope: Construct, id: string) {
            super(scope, id);
            const powertoolsLayer = lambda.LayerVersion.fromLayerVersionArn(
            this,
            'PowertoolsLayer',
            `arn:aws:lambda:${cdk.Stack.of(this).region}:123456789012:layer:Powertools:1`
            );
            new lambda.Function(this, 'Function', {
            runtime: lambda.Runtime.NODEJS_16_X,
            layers: [powertoolsLayer],
            code: lambda.Code.fromInline(`
            const { Logger } = require('@aws-lambda-powertools/logger');
            const { Metrics } = require('@aws-lambda-powertools/metrics');
            const { Tracer } = require('@aws-lambda-powertools/tracer');

            const logger = new Logger({logLevel: 'DEBUG'});
            const metrics = new Metrics();
            const tracer = new Tracer();

            exports.handler = function(event, ctx) {
                logger.debug("Hello World!"); 
            }`),
            handler: 'index.handler',
            });
        }
    }
    ```

=== "Terraform"

    ```terraform hl_lines="9 38"
    terraform {
      required_version = "~> 1.0.5"
      required_providers {
        aws = "~> 3.50.0"
      }
    }

    provider "aws" {
      region  = "{region}"
    }

    resource "aws_iam_role" "iam_for_lambda" {
      name = "iam_for_lambda"

      assume_role_policy = <<EOF
        {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Action": "sts:AssumeRole",
              "Principal": {
                "Service": "lambda.amazonaws.com"
              },
              "Effect": "Allow"
            }
          ]
        }
        EOF
	}

    resource "aws_lambda_function" "test_lambda" {
      filename      = "lambda_function_payload.zip"
      function_name = "lambda_function_name"
      role          = aws_iam_role.iam_for_lambda.arn
      handler       = "index.test"
      runtime 		= "python3.9"
      layers 		= ["arn:aws:lambda:{region}:017000801446:layer:AWSLambdaPowertoolsPython:19"]

      source_code_hash = filebase64sha256("lambda_function_payload.zip")
    }


    ```

=== "Amplify"

    ```zsh
    # Create a new one with the layer
    ❯ amplify add function
    ? Select which capability you want to add: Lambda function (serverless function)
    ? Provide an AWS Lambda function name: <NAME-OF-FUNCTION>
    ? Choose the runtime that you want to use: NodeJS
    ? Do you want to configure advanced settings? Yes
    ...
    ? Do you want to enable Lambda layers for this function? Yes
    ? Enter up to 5 existing Lambda layer ARNs (comma-separated): arn:aws:lambda:eu-central-1:017000801446:layer:AWSLambdaPowertoolsPython:19
    ❯ amplify push -y


    # Updating an existing function and add the layer
    ❯ amplify update function
    ? Select the Lambda function you want to update test2
    General information
    - Name: <NAME-OF-FUNCTION>
    ? Which setting do you want to update? Lambda layers configuration
    ? Do you want to enable Lambda layers for this function? Yes
    ? Enter up to 5 existing Lambda layer ARNs (comma-separated): arn:aws:lambda:eu-central-1:017000801446:layer:AWSLambdaPowertoolsPython:19
    ? Do you want to edit the local lambda function now? No
    ```

=== "Get the Layer .zip contents"
	Change `{region}` to your AWS region, e.g. `eu-west-1`

    ```bash title="AWS CLI"
	aws lambda get-layer-version-by-arn --arn arn:aws:lambda:{region}:017000801446:layer:AWSLambdaPowertoolsPython:19 --region {region}
    ```

    The pre-signed URL to download this Lambda Layer will be within `Location` key.

???+ warning "Warning: Limitations"

	Container Image deployment (OCI) or inline Lambda functions do not support Lambda Layers.

### NPM Modules

The AWS Lambda Powertools for TypeScript utilities (which from here will be referred as Powertools) follow a modular approach, similar to the official [AWS SDK v3 for JavaScript](https://github.com/aws/aws-sdk-js-v3).
Each TypeScript utility is installed as standalone NPM package.

[Installation guide for the **Tracer** utility](./core/tracer.md#getting-started)

[Installation guide for the **Logger** utility](./core/logger.md#getting-started)

[Installation guide for the **Metrics** utility](./core/metrics.md#getting-started)

## Environment variables

!!! info
    **Explicit parameters take precedence over environment variables.**

| Environment variable                      | Description | Utility                   | Default               |
|-------------------------------------------| --------------------------------------------------------------------------------- |---------------------------|-----------------------|
| **POWERTOOLS_SERVICE_NAME**               | Sets service name used for tracing namespace, metrics dimension and structured logging | All                       | `"service_undefined"` |
| **POWERTOOLS_METRICS_NAMESPACE**          | Sets namespace used for metrics | [Metrics](./core/metrics) | `None`                |
| **POWERTOOLS_TRACE_ENABLED**              | Explicitly disables tracing | [Tracer](./core/tracer)   | `true`                |
| **POWERTOOLS_TRACER_CAPTURE_RESPONSE**    | Captures Lambda or method return as metadata. | [Tracer](./core/tracer)   | `true`                |
| **POWERTOOLS_TRACER_CAPTURE_ERROR**       | Captures Lambda or method exception as metadata. | [Tracer](./core/tracer)   | `true`                |
| **POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS** | Captures HTTP(s) requests as segments. | [Tracer](./core/tracer)   | `true`                |
| **POWERTOOLS_LOGGER_LOG_EVENT**           | Logs incoming event | [Logger](./core/logger)   | `false`               |
| **POWERTOOLS_LOGGER_SAMPLE_RATE**         | Debug log sampling | [Logger](./core/logger)  | `0`                   |
| **POWERTOOLS_LOG_DEDUPLICATION_DISABLED** | Disables log deduplication filter protection to use Pytest Live Log feature | [Logger](./core/logger)  | `false`               |
| **LOG_LEVEL**                             | Sets logging level | [Logger](./core/logger)  | `INFO`                |

## Examples

* [CDK](https://github.com/awslabs/aws-lambda-powertools-typescript/tree/main/examples/cdk){target="_blank"}
* [Tracer](https://github.com/awslabs/aws-lambda-powertools-typescript/tree/main/examples/cdk/lib){target="_blank"}
* [Logger](https://github.com/awslabs/aws-lambda-powertools-typescript/tree/main/packages/logger/examples){target="_blank"}
* [Metrics](https://github.com/awslabs/aws-lambda-powertools-typescript/tree/main/packages/metrics/examples){target="_blank"}

## Credits

* Credits for the Lambda Powertools idea go to [DAZN](https://github.com/getndazn){target="_blank"} and their [DAZN Lambda Powertools](https://github.com/getndazn/dazn-lambda-powertools/){target="_blank"}.

## Connect

* **AWS Developers Slack**: `#lambda-powertools` - [Invite, if you don't have an account](https://join.slack.com/t/awsdevelopers/shared_invite/zt-yryddays-C9fkWrmguDv0h2EEDzCqvw){target="_blank"}
* **Email**: aws-lambda-powertools-feedback@amazon.com
