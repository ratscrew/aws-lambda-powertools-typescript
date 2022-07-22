---
title: Logger
description: Core utility
---

Logger provides an opinionated logger with output structured as JSON.

## Key features

* Capturing key fields from the Lambda context, cold starts, and structure logging output as JSON.
* Logging Lambda invocation events when instructed (disabled by default).
* Printing all the logs only for a percentage of invocations via log sampling (disabled by default).
* Appending additional keys to structured logs at any point in time.
* Providing a custom log formatter (Bring Your Own Formatter) to output logs in a structure compatible with your organization’s Logging RFC.

<br />

<figure>
  <img src="../../media/logger_utility_showcase.png" loading="lazy" alt="Screenshot of the Amazon CloudWatch Console showing an example of error logged with various log attributes" />
  <figcaption>Logger showcase - Log attributes</figcaption>
</figure>

## Getting started

### Installation

Install the library in your project:

```shell
npm install @aws-lambda-powertools/logger
```

### Usage

The `Logger` utility must always be instantiated outside the Lambda handler. By doing this, subsequent invocations processed by the same instance of your function can reuse these resources. This saves cost by reducing function run time. In addition, `Logger` can keep track of a cold start and inject the appropriate fields into logs.

=== "handler.ts"

    ```typescript hl_lines="1 3"
    import { Logger } from '@aws-lambda-powertools/logger';

    const logger = new Logger({ serviceName: 'serverlessAirline' });

    export const handler = async (_event, _context): Promise<void> => {
        // ...
    };
    ```

### Utility settings

The library requires two settings. You can set them as environment variables, or pass them in the constructor.

These settings will be used across all logs emitted:

| Setting           | Description                                                                                                      | Environment variable      | Constructor parameter |
|-------------------|------------------------------------------------------------------------------------------------------------------|---------------------------|-----------------------|
| **Logging level** | Sets how verbose Logger should be (INFO, by default). Supported values are: `DEBUG`, `INFO`, `WARN`, `ERROR`     | `LOG_LEVEL`               | `logLevel`            |
| **Service name**  | Sets the name of service of which the Lambda function is part of, that will be present across all log statements | `POWERTOOLS_SERVICE_NAME` | `serviceName`         |

For a **complete list** of supported environment variables, refer to [this section](./../index.md#environment-variables).

#### Example using AWS Serverless Application Model (SAM)

=== "handler.ts"

    ```typescript hl_lines="1 4"
    import { Logger } from '@aws-lambda-powertools/logger';

    // Logger parameters fetched from the environment variables (see template.yaml tab)
    const logger = new Logger();

    // You can also pass the parameters in the constructor
    // const logger = new Logger({
    //     logLevel: 'WARN',
    //     serviceName: 'serverlessAirline'
    // });
    ```

=== "template.yaml"

    ```yaml hl_lines="8 9"
    Resources:
      ShoppingCartApiFunction:
        Type: AWS::Serverless::Function
        Properties:
          Runtime: nodejs16.x
          Environment:
            Variables:
              LOG_LEVEL: WARN
              POWERTOOLS_SERVICE_NAME: serverlessAirline
    ```

### Standard structured keys

Your Logger will include the following keys to your structured logging (default log formatter):

| Key                         | Example                                                                                                          | Note                                                                                                                                                                                                                            |
|-----------------------------|------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **level**: `string`         | `INFO`                                                                                                           | Logging level set for the Lambda function"s invocation                                                                                                                                                                          |
| **message**: `string`       | `Query performed to DynamoDB`                                                                                    | A descriptive, human-readable representation of this log item                                                                                                                                                                   |
| **sampling_rate**: `float`  | `0.1`                                                                                                            | When enabled, it prints all the logs of a percentage of invocations, e.g. 10%                                                                                                                                                   |
| **service**: `string`       | `serverlessAirline`                                                                                              | A unique name identifier of the service this Lambda function belongs to, by default `service_undefined`                                                                                                                         |
| **timestamp**: `string`     | `2011-10-05T14:48:00.000Z`                                                                                       | Timestamp string in simplified extended ISO format (ISO 8601)                                                                                                                                                                   |
| **xray_trace_id**: `string` | `1-5759e988-bd862e3fe1be46a994272793`                                                                            | X-Ray Trace ID. This value is always presented in Lambda environment, whether [tracing is enabled](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html){target="_blank"} or not. Logger will always log this value. |
| **error**: `Object`         | `{ name: "Error", location: "/my-project/handler.ts:18", message: "Unexpected error #1", stack: "[stacktrace]"}` | Optional - An object containing information about the Error passed to the logger                                                                                                                                                |

### Capturing Lambda context info

You can enrich your structured logs with key Lambda context information in multiple ways.

This functionality will include the following keys in your structured logs:

Key | Example
------------------------------------------------- | ---------------------------------------------------------------------------------
**cold_start**: `bool` | `false`
**function_name** `string` | `shopping-cart-api-lambda-prod-eu-west-1`
**function_memory_size**: `number` | `128`
**function_arn**: `string` | `arn:aws:lambda:eu-west-1:123456789012:function:shopping-cart-api-lambda-prod-eu-west-1`
**function_request_id**: `string` | `c6af9ac6-7b61-11e6-9a41-93e812345678`

=== "Middy Middleware"

    !!! tip "Using Middy for the first time?"
        You can install Middy by running `npm i @middy/core`.
        Learn more about [its usage and lifecycle in the official Middy documentation](https://middy.js.org/docs/intro/getting-started){target="_blank"}.

    ```typescript hl_lines="1-2 10-11"
    import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
    import middy from '@middy/core';

    const logger = new Logger();

    const lambdaHandler = async (_event: any, _context: any): Promise<void> => {
        logger.info('This is an INFO log with some context');
    };

    export const handler = middy(lambdaHandler)
        .use(injectLambdaContext(logger));
    ```

=== "Decorator"

    ```typescript hl_lines="8"
    import { Logger } from '@aws-lambda-powertools/logger';
    import { LambdaInterface } from '@aws-lambda-powertools/commons';

    const logger = new Logger();
    
    class Lambda implements LambdaInterface {
        // Decorate your handler class method
        @logger.injectLambdaContext()
        public async handler(_event: any, _context: any): Promise<void> {
            logger.info('This is an INFO log with some context');
        }

    }

    export const myFunction = new Lambda();
    export const handler = myFunction.handler;
    ```
=== "Manual"

    ```typescript hl_lines="7"
    import { Logger } from '@aws-lambda-powertools/logger';

    const logger = new Logger();

    export const handler = async (_event, context): Promise<void> => {
    
        logger.addContext(context);
        
        logger.info('This is an INFO log with some context');

    };
    ```

In each case, the printed log will look like this:

=== "Example CloudWatch Logs excerpt"

    ```json hl_lines="2-6"
    {
        "cold_start": true,
        "function_arn": "arn:aws:lambda:eu-west-1:123456789012:function:shopping-cart-api-lambda-prod-eu-west-1",
        "function_memory_size": 128,
        "function_request_id": "c6af9ac6-7b61-11e6-9a41-93e812345678",
        "function_name": "shopping-cart-api-lambda-prod-eu-west-1",
        "level": "INFO",
        "message": "This is an INFO log with some context",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T21:21:08.921Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    ```

#### Log incoming event

When debugging in non-production environments, you can instruct Logger to log the incoming event with the middleware/decorator parameter `logEvent` or via `POWERTOOLS_LOGGER_LOG_EVENT` env var set to `true`.

???+ warning
This is disabled by default to prevent sensitive info being logged

=== "Middy Middleware"

    ```typescript hl_lines="11"
    import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
    import middy from '@middy/core';

    const logger = new Logger();

    const lambdaHandler = async (_event: any, _context: any): Promise<void> => {
        logger.info('This is an INFO log with some context');
    };

    export const handler = middy(lambdaHandler)
        .use(injectLambdaContext(logger, { logEvent: true }));
    ```

=== "Decorator"

    ```typescript hl_lines="8"
    import { Logger } from '@aws-lambda-powertools/logger';
    import { LambdaInterface } from '@aws-lambda-powertools/commons';

    const logger = new Logger();
    
    class Lambda implements LambdaInterface {
        // Set the log event flag to true
        @logger.injectLambdaContext({ logEvent: true })
        public async handler(_event: any, _context: any): Promise<void> {
            logger.info('This is an INFO log with some context');
        }

    }

    export const myFunction = new Lambda();
    export const handler = myFunction.handler;
    ```

### Appending persistent additional log keys and values

You can append additional persistent keys and values in the logs generated during a Lambda invocation using either mechanism:

* Via the Logger's `appendKeys` method, for all log items generated after calling this method
* Passing them in the Logger's constructor

To remove the keys you added, you can use the `removeKeys` method.


=== "handler.ts"

    ```typescript hl_lines="5-13 17-25 30"
    import { Logger } from '@aws-lambda-powertools/logger';

    // Add persistent log keys via the constructor
    const logger = new Logger({
        persistentLogAttributes: { 
            aws_account_id: '123456789012',
            aws_region: 'eu-west-1',
            logger: {
                name: '@aws-lambda-powertools/logger',
                version: '0.0.1',
            },
            extra_key: "some-value"
        }
    });

    // OR add persistent log keys to an existing Logger instance with the appendKeys method:
    // logger.appendKeys({
    //     aws_account_id: '123456789012',
    //     aws_region: 'eu-west-1',
    //     logger: {
    //         name: '@aws-lambda-powertools/logger',
    //         version: '0.0.1',
    //     },
    //     extra_key: "some-value"
    // });    

    export const handler = async (_event: any, _context: any): Promise<unknown> => {

        // If you don't want to log the "extra_key" attribute in your logs, you can remove it
        logger.removeKeys(["extra_key"])
    
        // This info log will print all extra custom attributes added above
        // Extra attributes: logger object with name and version of the logger library, awsAccountId, awsRegion
        logger.info('This is an INFO log');
        logger.info('This is another INFO log');
        
        return {
            foo: 'bar'
        };
    
    };
    ```
=== "Example CloudWatch Logs excerpt"

    ```json hl_lines="8-12 21-25"
    {
        "level": "INFO",
        "message": "This is an INFO log",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T21:49:58.084Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456",
        "aws_account_id": "123456789012",
        "aws_region": "eu-west-1",
        "logger": { 
            "name": "@aws-lambda-powertools/logger",
            "version": "0.0.1"
        }
    }
    {
        "level": "INFO",
        "message": "This is another INFO log",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T21:49:58.088Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456",
        "aws_account_id": "123456789012",
        "aws_region": "eu-west-1",
        "logger": { 
            "name": "@aws-lambda-powertools/logger",
            "version": "0.0.1"
        }
    }
    ```


!!! tip "Logger will automatically ignore any key with an `undefined` value"

#### Clearing all state

The Logger utility is commonly initialized in the global scope, outside the handler function.
When you attach persistent log attributes through the `persistentLogAttributes` constructor option or via the `appendKeys`, `addPersistentLogAttributes` methods, this data is attached to the Logger instance.  

Due to the [Lambda Execution Context reuse](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-context.html), this means those persistent log attributes may be reused across invocations.
If you want to make sure that persistent attributes added **inside the handler function** code are not persisted across invocations, you can set the parameter `clearState` as `true`  in the `injectLambdaContext` middleware or decorator.

=== "Middy Middleware"

    ```typescript hl_lines="27"
    import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
    import middy from '@middy/core';

    // Persistent attributes added outside the handler will be 
    // cached across invocations
    const logger = new Logger({
        logLevel: 'DEBUG',
        persistentLogAttributes: {
            foo: "bar",
            biz: "baz"
        }
    });

    const lambdaHandler = async (event: { special_key: string }, _context: any): Promise<void> => {
        // Persistent attributes added inside the handler will NOT be cached
        // across invocations
        if (event['special_key'] === '123456') {
            logger.appendKeys({
                details: { special_key: event['special_key'] }
            });
        }
        logger.debug('This is a DEBUG log');
    };

    // Enable the clear state flag
    export const handler = middy(lambdaHandler)
        .use(injectLambdaContext(logger, { clearState: true }));
    ```

=== "Decorator"

    ```typescript hl_lines="16"
    import { Logger } from '@aws-lambda-powertools/logger';
    import { LambdaInterface } from '@aws-lambda-powertools/commons';

    // Persistent attributes added outside the handler will be 
    // cached across invocations
    const logger = new Logger({
        logLevel: 'DEBUG',
        persistentLogAttributes: {
            foo: "bar",
            biz: "baz"
        }
    });
    
    class Lambda implements LambdaInterface {
        // Enable the clear state flag
        @logger.injectLambdaContext({ clearState: true })
        public async handler(_event: any, _context: any): Promise<void> {
            // Persistent attributes added inside the handler will NOT be cached
            // across invocations
            if (event['special_key'] === '123456'){
                logger.appendKeys({
                    details: { special_key: '123456' }
                });
            }
            logger.debug('This is a DEBUG log');
        }

    }

    export const myFunction = new Lambda();
    export const handler = myFunction.handler;
    ```

In each case, the printed log will look like this:

=== "First invocation"

    ```json hl_lines="2 4-7"
    {
        "biz": "baz",
        "cold_start": true,
        "details": {
            "special_key": "123456",
        },
        "foo": "bar",
        "function_arn": "arn:aws:lambda:eu-west-1:123456789012:function:foo-bar-function",
        "function_memory_size": 128,
        "function_name": "foo-bar-function",
        "function_request_id": "abcdef123456abcdef123456",
        "level": "DEBUG",
        "message": "This is a DEBUG log with the user_id",
        "service": "hello-world",
        "timestamp": "2021-12-12T22:32:54.670Z",
        "xray_trace_id": "1-5759e988-bd862e3fe1be46a994272793"
    }
    ```
=== "Second invocation"

    ```json hl_lines="2 4"
    {
        "biz": "baz",
        "cold_start": false,
        "foo": "bar",
        "function_arn": "arn:aws:lambda:eu-west-1:123456789012:function:foo-bar-function",
        "function_memory_size": 128,
        "function_name": "foo-bar-function",
        "function_request_id": "abcdef123456abcdef123456",
        "level": "DEBUG",
        "message": "This is a DEBUG log with the user_id",
        "service": "hello-world",
        "timestamp": "2021-12-12T22:40:23.120Z",
        "xray_trace_id": "1-5759e988-bd862e3fe1be46a994272793"
    }
    ```


### Appending additional data to a single log item

You can append additional data to a single log item by passing objects as additional parameters.

* Pass a simple string for logging it with default key name `extra`
* Pass one or multiple objects containing arbitrary data to be logged. Each data object should be placed in an enclosing object as a single property value, you can name this property as you need: `{ myData: arbitraryObjectToLog }`
* If you already have an object containing a `message` key and an additional property, you can pass this object directly

=== "handler.ts"

    ```typescript hl_lines="14 18-20 24 32"
    import { Logger } from '@aws-lambda-powertools/logger';

    const logger = new Logger();
    
    export const handler = async (event: any, _context: any): Promise<unknown> => {
    
        const myImportantVariable = {
            foo: 'bar'
        };
        
        // Log additional data in single log items
        
        // As second parameter
        logger.info('This is a log with an extra variable', { data: myImportantVariable });
        
        // You can also pass multiple parameters containing arbitrary objects
        logger.info('This is a log with 3 extra objects',
            { data: myImportantVariable },
            { correlationIds: { myCustomCorrelationId: 'foo-bar-baz' } },
            { lambdaEvent: event }
        );

        // Simply pass a string for logging additional data
        logger.info('This is a log with additional string value', 'string value');

        // Directly passing an object containing both the message and the additional info
        const logObject = {
            message: 'This is a log message',
            additionalValue: 42
        };

        logger.info(logObject);
        
        return {
            foo: 'bar'
        };
    
    };
    ```
=== "Example CloudWatch Logs excerpt"

    ```json hl_lines="7 15-21 28 37"
    {
        "level": "INFO",
        "message": "This is a log with an extra variable",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:06:17.463Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456",
        "data": { "foo": "bar" }
    }
    {
        "level": "INFO",
        "message": "This is a log with 2 extra variables",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:06:17.466Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456",
        "data": { "foo": "bar" },
        "correlationIds": { "myCustomCorrelationId": "foo-bar-baz" },
        "lambdaEvent": { 
            "exampleEventData": {
                "eventValue": 42
            }
        }
    }
    {
        "level": "INFO",
        "message": "This is a log with additional string value",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:06:17.463Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456",
        "extra": "string value"
    }
    {
        "level": "INFO",
        "message": "This is a log message",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:06:17.463Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456",
        "additionalValue": 42
    }
    ```

### Logging errors

You can log errors by using the `error` method and pass the error object as parameter.
The error will be logged with default key name `error`, but you can also pass your own custom key name.

=== "handler.ts"

    ```typescript hl_lines="11 18"
    import { Logger } from '@aws-lambda-powertools/logger';

    const logger = new Logger();
    
    export const handler = async (_event: any, _context: any): Promise<void> => {
    
        try {
            throw new Error('Unexpected error #1');
        } catch (error) {
            // Log information about the error using the default "error" key
            logger.error('This is the first error', error as Error);
        }

        try {
            throw new Error('Unexpected error #2');
        } catch (error) {
            // Log information about the error using a custom "myCustomErrorKey" key
            logger.error('This is the second error', { myCustomErrorKey: error as Error } );
        }
    
    };
    ```

=== "Example CloudWatch Logs excerpt"

    ```json hl_lines="7-12 20-25"
    {
        "level": "ERROR",
        "message": "This is an ERROR log #1",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:12:39.345Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456",
        "error": {
            "name": "Error",
            "location": "/path/to/my/source-code/my-service/handler.ts:18",
            "message": "This is the first error",
            "stack": "Error: Unexpected error #1    at lambdaHandler (/path/to/my/source-code/my-service/handler.ts:18:11)    at Object.<anonymous> (/path/to/my/source-code/my-service/handler.ts:35:1)    at Module._compile (node:internal/modules/cjs/loader:1108:14)    at Module.m._compile (/path/to/my/source-code/node_modules/ts-node/src/index.ts:1371:23)    at Module._extensions..js (node:internal/modules/cjs/loader:1137:10)    at Object.require.extensions.<computed> [as .ts] (/path/to/my/source-code/node_modules/ts-node/src/index.ts:1374:12)    at Module.load (node:internal/modules/cjs/loader:973:32)    at Function.Module._load (node:internal/modules/cjs/loader:813:14)    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:76:12)    at main (/path/to/my/source-code/node_modules/ts-node/src/bin.ts:331:12)"
        }
    }
    {   
        "level": "ERROR",
        "message": "This is an ERROR log #2",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:12:39.377Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456",
        "myCustomErrorKey": {
            "name": "Error",
            "location": "/path/to/my/source-code/my-service/handler.ts:24",
            "message": "This is the second error",
            "stack": "Error: Unexpected error #2    at lambdaHandler (/path/to/my/source-code/my-service/handler.ts:24:11)    at Object.<anonymous> (/path/to/my/source-code/my-service/handler.ts:35:1)    at Module._compile (node:internal/modules/cjs/loader:1108:14)    at Module.m._compile (/path/to/my/source-code/node_modules/ts-node/src/index.ts:1371:23)    at Module._extensions..js (node:internal/modules/cjs/loader:1137:10)    at Object.require.extensions.<computed> [as .ts] (/path/to/my/source-code/node_modules/ts-node/src/index.ts:1374:12)    at Module.load (node:internal/modules/cjs/loader:973:32)    at Function.Module._load (node:internal/modules/cjs/loader:813:14)    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:76:12)    at main (/path/to/my/source-code/node_modules/ts-node/src/bin.ts:331:12)"
        }
    }
    ```

!!! tip "Logging errors and log level"
    You can also log errors using the `warn`, `info`, and `debug` methods. Be aware of the log level though, you might miss those  errors when analyzing the log later depending on the log level configuration.


## Advanced

### Using multiple Logger instances across your code

Logger supports quick instance cloning via the `createChild` method.
This can be useful for example if you want to enable multiple Loggers with different logging levels in the same Lambda invocation.

=== "handler.ts"

    ```typescript hl_lines="9-11 18-19"
    import { Logger } from '@aws-lambda-powertools/logger';

    // With this logger, all the INFO logs will be printed
    const logger = new Logger({
        logLevel: 'INFO'
    });

    // With this logger, only the ERROR logs will be printed
    const childLogger = logger.createChild({
        logLevel: 'ERROR'
    });
    
    export const handler = async (_event: any, _context: any): Promise<void> => {
    
        logger.info('This is an INFO log, from the parent logger');
        logger.error('This is an ERROR log, from the parent logger');
        
        childLogger.info('This is an INFO log, from the child logger');
        childLogger.error('This is an ERROR log, from the child logger');
    
    };
    ```

=== "Example CloudWatch Logs excerpt"

    ```json hl_lines="15-21"
    {
        "level": "INFO",
        "message": "This is an INFO log, from the parent logger",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:32:54.667Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    {
        "level": "ERROR",
        "message": "This is an ERROR log, from the parent logger",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:32:54.670Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    {
        "level": "ERROR",
        "message": "This is an ERROR log, from the child logger",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:32:54.670Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    ```

### Sampling logs

Use sampling when you want to print all the log items generated in your code, based on a **percentage of your concurrent/cold start invocations**.

You can do that by setting a "sample rate", a float value ranging from `0.0` (0%) to `1` (100%), by using a `POWERTOOLS_LOGGER_SAMPLE_RATE` env var or passing the `sampleRateValue` parameter in the Logger constructor.
This number represents the probability that a Lambda invocation will print all the log items regardless of the log level setting.

For example, by setting the "sample rate" to `0.5`, roughly 50% of your lambda invocations will print all the log items, including the `debug` ones.

!!! tip "When is this useful?"
    In production, to avoid log data pollution and reduce CloudWatch costs, developers are encouraged to use the logger with `logLevel` equal to `ERROR` or `WARN`.
    This means that only errors or warnings will be printed.

    However, it might still be useful to print all the logs (including debug ones) of a very small percentage of invocations to have a better understanding of the behaviour of your code in production even when there are no errors.
    
    Sampling decision happens at the Logger initialization. This means sampling may happen significantly more or less than depending on your traffic patterns, for example a steady low number of invocations and thus few cold starts.

=== "handler.ts"

    ```typescript hl_lines="6"
    import { Logger } from '@aws-lambda-powertools/logger';

    // Notice the log level set to 'ERROR'
    const logger = new Logger({
        logLevel: 'ERROR',
        sampleRateValue: 0.5
    });
    
    export const handler = async (_event: any, _context: any): Promise<void> => {

        // This log item (equal to log level 'ERROR') will be printed to standard output
        // in all Lambda invocations
        logger.error('This is an ERROR log');

        // These log items (below the log level 'ERROR') have ~50% chance 
        // of being printed in a Lambda invocation
        logger.debug('This is a DEBUG log that has 50% chance of being printed');
        logger.info('This is an INFO log that has 50% chance of being printed');
        logger.warn('This is a WARN log that has 50% chance of being printed');
        
        // Optional: refresh sample rate calculation on runtime
        // logger.refreshSampleRateCalculation();

    };
    ```

=== "Example CloudWatch Logs excerpt - Invocation #1"

    ```json
    {
        "level": "ERROR",
        "message": "This is an ERROR log",
        "sampling_rate": "0.5",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:59:06.334Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    {
        "level": "DEBUG",
        "message": "This is a DEBUG log that has 50% chance of being printed",
        "sampling_rate": "0.5", 
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:59:06.337Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    {
        "level": "INFO",
        "message": "This is an INFO log that has 50% chance of being printed",
        "sampling_rate": "0.5", 
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:59:06.338Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    {
        "level": "WARN",
        "message": "This is a WARN log that has 50% chance of being printed",
        "sampling_rate": "0.5", 
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:59:06.338Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    ```

=== "Example CloudWatch Logs excerpt - Invocation #2"

    ```json
    {
        "level": "ERROR",
        "message": "This is an ERROR log",
        "sampling_rate": "0.5",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:59:06.334Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    ```

=== "Example CloudWatch Logs excerpt - Invocation #3"

    ```json
    {
        "level": "ERROR",
        "message": "This is an ERROR log",
        "sampling_rate": "0.5",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:59:06.334Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    {
        "level": "DEBUG",
        "message": "This is a DEBUG log that has 50% chance of being printed",
        "sampling_rate": "0.5", 
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:59:06.337Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    {
        "level": "INFO",
        "message": "This is an INFO log that has 50% chance of being printed",
        "sampling_rate": "0.5", 
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:59:06.338Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    {
        "level": "WARN",
        "message": "This is a WARN log that has 50% chance of being printed",
        "sampling_rate": "0.5", 
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:59:06.338Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    ```

=== "Example CloudWatch Logs excerpt - Invocation #4"

    ```json
    {
        "level": "ERROR",
        "message": "This is an ERROR log",
        "sampling_rate": "0.5",
        "service": "serverlessAirline",
        "timestamp": "2021-12-12T22:59:06.334Z",
        "xray_trace_id": "abcdef123456abcdef123456abcdef123456"
    }
    ```

### Custom Log formatter (Bring Your Own Formatter)

You can customize the structure (keys and values) of your log items by passing a custom log formatter, an object that implements the `LogFormatter` abstract class.

=== "handler.ts"

    ```typescript hl_lines="2 5"
    import { Logger } from '@aws-lambda-powertools/logger';
    import { MyCompanyLogFormatter } from './utils/formatters/MyCompanyLogFormatter';

    const logger = new Logger({
        logFormatter: new MyCompanyLogFormatter(),
        logLevel: 'DEBUG',
        serviceName: 'serverlessAirline',
        sampleRateValue: 0.5,
        persistentLogAttributes: {
            awsAccountId: process.env.AWS_ACCOUNT_ID,
            logger: {
                name: '@aws-lambda-powertools/logger',
                version: '0.0.1'
            }
        },
    });
    
    export const handler = async (event, context): Promise<void> => {

        logger.addContext(context);

        logger.info('This is an INFO log', { correlationIds: { myCustomCorrelationId: 'foo-bar-baz' } });

    };
    ```

This is how the `MyCompanyLogFormatter` (dummy name) would look like:

=== "utils/formatters/MyCompanyLogFormatter.ts"

    ```typescript
    import { LogFormatter } from '@aws-lambda-powertools/logger';
    import { LogAttributes, UnformattedAttributes } from '@aws-lambda-powertools/logger/lib/types';
    
    // Replace this line with your own type
    type MyCompanyLog = LogAttributes;
    
    class MyCompanyLogFormatter extends LogFormatter {
    
        public formatAttributes(attributes: UnformattedAttributes): MyCompanyLog {
            return {
                message: attributes.message,
                service: attributes.serviceName,
                environment: attributes.environment,
                awsRegion: attributes.awsRegion,
                correlationIds: {
                    awsRequestId: attributes.lambdaContext?.awsRequestId,
                    xRayTraceId: attributes.xRayTraceId
                },
                lambdaFunction: {
                    name: attributes.lambdaContext?.functionName,
                    arn: attributes.lambdaContext?.invokedFunctionArn,
                    memoryLimitInMB: attributes.lambdaContext?.memoryLimitInMB,
                    version: attributes.lambdaContext?.functionVersion,
                    coldStart: attributes.lambdaContext?.coldStart,
                },
                logLevel: attributes.logLevel,
                timestamp: this.formatTimestamp(attributes.timestamp), // You can extend this function
                logger: {
                    sampleRateValue: attributes.sampleRateValue,
                },
            };
        }
        
    }
    
    export {
        MyCompanyLogFormatter
    };
    ```

This is how the printed log would look:

=== "Example CloudWatch Logs excerpt"

    ```json
        {
            "message": "This is an INFO log",
            "service": "serverlessAirline",
            "awsRegion": "eu-west-1",
            "correlationIds": {
                "awsRequestId": "c6af9ac6-7b61-11e6-9a41-93e812345678",
                "xRayTraceId": "abcdef123456abcdef123456abcdef123456",
                "myCustomCorrelationId": "foo-bar-baz"
            },
            "lambdaFunction": {
                "name": "shopping-cart-api-lambda-prod-eu-west-1",
                "arn": "arn:aws:lambda:eu-west-1:123456789012:function:shopping-cart-api-lambda-prod-eu-west-1",
                "memoryLimitInMB": 128,
                "version": "$LATEST",
                "coldStart": true
            },
            "logLevel": "INFO",
            "timestamp": "2021-12-12T23:13:53.404Z",
            "logger": {
                "sampleRateValue": "0.5",
                "name": "aws-lambda-powertools-typescript",
                "version": "0.0.1"
            },
            "awsAccountId": "123456789012"
        }
    ```

## Testing your code

### Inject Lambda Context

When unit testing your code that makes use of `logger.addContext()` or `injectLambdaContext` middleware and decorator, you can optionally pass a dummy Lambda Context if you want your logs to contain this information.

This is a Jest sample that provides the minimum information necessary for Logger to inject context data:

=== "handler.test.ts"

    ```typescript

    const dummyContext = {
        callbackWaitsForEmptyEventLoop: true,
        functionVersion: '$LATEST',
        functionName: 'foo-bar-function',
        memoryLimitInMB: '128',
        logGroupName: '/aws/lambda/foo-bar-function',
        logStreamName: '2021/03/09/[$LATEST]abcdef123456abcdef123456abcdef123456',
        invokedFunctionArn: 'arn:aws:lambda:eu-west-1:123456789012:function:foo-bar-function',
        awsRequestId: 'c6af9ac6-7b61-11e6-9a41-93e812345678',
        getRemainingTimeInMillis: () => 1234,
        done: () => console.log('Done!'),
        fail: () => console.log('Failed!'),
        succeed: () => console.log('Succeeded!'),
    };

    describe('MyUnitTest', () => {

        test('Lambda invoked successfully', async () => {
        
            const testEvent = { test: 'test' };
            await handler(testEvent, dummyContext);

        });

    });

    ```

!!! tip
    If you don't want to declare your own dummy Lambda Context, you can use [`ContextExamples.helloworldContext`](https://github.com/awslabs/aws-lambda-powertools-typescript/blob/main/packages/commons/src/samples/resources/contexts/hello-world.ts#L3-L16) from [`@aws-lambda-powertools/commons`](https://www.npmjs.com/package/@aws-lambda-powertools/commons).
