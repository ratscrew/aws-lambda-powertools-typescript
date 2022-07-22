---
title: Metrics
description: Core utility
---

Metrics creates custom metrics asynchronously by logging metrics to standard output following [Amazon CloudWatch Embedded Metric Format (EMF)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format.html).

These metrics can be visualized through [Amazon CloudWatch Console](https://console.aws.amazon.com/cloudwatch/).

## Key features

* Aggregating up to 100 metrics using a single CloudWatch EMF object (large JSON blob).
* Validating your metrics against common metric definitions mistakes (for example, metric unit, values, max dimensions, max metrics).
* Metrics are created asynchronously by the CloudWatch service. You do not need any custom stacks, and there is no impact to Lambda function latency.
* Creating a one-off metric with different dimensions.

<br />

<figure>
  <img src="../../media/metrics_utility_showcase.png" loading="lazy" alt="Screenshot of the Amazon CloudWatch Console showing an example of business metrics in the Metrics Explorer" />
  <figcaption>Metrics showcase - Metrics Explorer</figcaption>
</figure>

## Terminologies

If you're new to Amazon CloudWatch, there are two terminologies you must be aware of before using this utility:

* **Namespace**. It's the highest level container that will group multiple metrics from multiple services for a given application, for example `ServerlessEcommerce`.
* **Dimensions**. Metrics metadata in key-value format. They help you slice and dice metrics visualization, for example `ColdStart` metric by Payment `service`.

<figure>
  <img src="../../media/metrics_terminology.png" />
  <figcaption>Metric terminology, visually explained</figcaption>
</figure>


## Getting started

### Installation

Install the library in your project:

```shell
npm install @aws-lambda-powertools/metrics
```

### Usage

The `Metrics` utility must always be instantiated outside of the Lambda handler. In doing this, subsequent invocations processed by the same instance of your function can reuse these resources. This saves cost by reducing function run time. In addition, `Metrics` can track cold start and emit the appropriate metrics.

=== "handler.ts"

    ```typescript hl_lines="1 3"
    import { Metrics } from '@aws-lambda-powertools/metrics';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

    export const handler = async (_event, _context): Promise<void> => {
        // ...
    };
    ```

### Utility settings

The library requires two settings. You can set them as environment variables, or pass them in the constructor.  

These settings will be used across all metrics emitted:

| Setting              | Description                                                                     | Environment variable           | Constructor parameter |
|----------------------|---------------------------------------------------------------------------------|--------------------------------|-----------------------|
| **Metric namespace** | Logical container where all metrics will be placed e.g. `serverlessAirline`     | `POWERTOOLS_METRICS_NAMESPACE` | `namespace`           |
| **Service**          | Optionally, sets **service** metric dimension across all metrics e.g. `payment` | `POWERTOOLS_SERVICE_NAME`      | `serviceName`         |

For a **complete list** of supported environment variables, refer to [this section](./../index.md#environment-variables).

!!! tip
    Use your application name or main service as the metric namespace to easily group all metrics

#### Example using AWS Serverless Application Model (SAM)

The `Metrics` utility is instantiated outside of the Lambda handler. In doing this, the same instance can be used across multiple invocations inside the same execution environment. This allows `Metrics` to be aware of things like whether or not a given invocation had a cold start or not.

=== "handler.ts"

    ```typescript hl_lines="1 4"
    import { Metrics } from '@aws-lambda-powertools/metrics';

    // Metrics parameters fetched from the environment variables (see template.yaml tab)
    const metrics = new Metrics();
    
    // You can also pass the parameters in the constructor
    // const metrics = new Metrics({
    //   namespace: 'serverlessAirline',
    //   serviceName: 'orders'
    // });
    ```

=== "template.yml"

    ```yaml hl_lines="9 10"
    Resources:
      HelloWorldFunction:
        Type: AWS::Serverless::Function
        Properties:
          Runtime: nodejs16.x
          Environment:
          Variables:
            POWERTOOLS_SERVICE_NAME: orders
            POWERTOOLS_METRICS_NAMESPACE: serverlessAirline
    ```

You can initialize Metrics anywhere in your code - It'll keep track of your aggregate metrics in memory.

### Creating metrics

You can create metrics using the `addMetric` method, and you can create dimensions for all your aggregate metrics using the `addDimension` method.

=== "Metrics"

    ```typescript hl_lines="6"
    import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

    export const handler = async (_event: any, _context: any): Promise<void> => {
        metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
        metrics.publishStoredMetrics();
    };
    ```

=== "Metrics with custom dimensions"

    ```typescript hl_lines="6-7"
    import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

    export const handler = async (_event: any, _context: any): Promise<void> => {
        metrics.addDimension('environment', 'prod');
        metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
        metrics.publishStoredMetrics();
    };
    ```

!!! tip "Autocomplete Metric Units"
    Use the `MetricUnit` enum to easily find a supported metric unit by CloudWatch. Alternatively, you can pass the value as a string if you already know them e.g. "Count".

!!! note "Metrics overflow"
    CloudWatch EMF supports a max of 100 metrics per batch. Metrics will automatically propagate all the metrics when adding the 100th metric. Subsequent metrics, e.g. 101th, will be aggregated into a new EMF object, for your convenience.

!!! warning "Do not create metrics or dimensions outside the handler"
    Metrics or dimensions added in the global scope will only be added during cold start. Disregard if that's the intended behaviour.

### Adding multi-value metrics

You can call `addMetric()` with the same name multiple times. The values will be grouped together in an array.

=== "addMetric() with the same name"

    ```typescript hl_lines="8 10"
    import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
    import { Context } from 'aws-lambda'; 

    const metrics = new Metrics({ namespace:'serverlessAirline', serviceName:'orders' });

    export const handler = async (event: any, context: Context): Promise<void> => {
        metrics.addMetric('performedActionA', MetricUnits.Count, 2);
        // do something else...
        metrics.addMetric('performedActionA', MetricUnits.Count, 1);
    };
    ```
=== "Example CloudWatch Logs excerpt"

    ```json hl_lines="2-5 18-19"
    {
        "performedActionA": [
            2,
            1
        ],
        "_aws": {
            "Timestamp": 1592234975665,
            "CloudWatchMetrics": [
                {
                "Namespace": "serverlessAirline",
                "Dimensions": [
                    [
                    "service"
                    ]
                ],
                "Metrics": [
                    {
                    "Name": "performedActionA",
                    "Unit": "Count"
                    }
                ]
                }
            ]
        },
        "service": "orders"
    }
    ```

### Adding default dimensions

You can add default dimensions to your metrics by passing them as parameters in 4 ways:  

* in the constructor
* in the [Middy-compatible](https://github.com/middyjs/middy){target=_blank} middleware
* using the `setDefaultDimensions` method
* in the decorator

=== "constructor"

    ```typescript hl_lines="6"
    import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';

    const metrics = new Metrics({
        namespace: 'serverlessAirline', 
        serviceName: 'orders', 
        defaultDimensions: { 'environment': 'prod', 'foo': 'bar' } 
    });

    export const handler = async (_event: any, _context: any): Promise<void> => {
        metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
    };
    ```

=== "Middy middleware"

    !!! tip "Using Middy for the first time?"
        You can install Middy by running `npm i @middy/core`.
        Learn more about [its usage and lifecycle in the official Middy documentation](https://middy.js.org/docs/intro/getting-started){target="_blank"}.

    ```typescript hl_lines="1-2 11 13"
    import { Metrics, MetricUnits, logMetrics } from '@aws-lambda-powertools/metrics';
    import middy from '@middy/core';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

    const lambdaHandler = async (_event: any, _context: any): Promise<void> => {
        metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
    };

    // Wrap the handler with middy
    export const handler = middy(lambdaHandler)
        // Use the middleware by passing the Metrics instance as a parameter
        .use(logMetrics(metrics, { defaultDimensions:{ 'environment': 'prod', 'foo': 'bar' } }));
    ```

=== "setDefaultDimensions method"

    ```typescript hl_lines="4"
    import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });
    metrics.setDefaultDimensions({ 'environment': 'prod', 'foo': 'bar' });

    export const handler = async (event: any, _context: any): Promise<void> => {
        metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
    };
    ```

=== "with logMetrics decorator"

    ```typescript hl_lines="9"
    import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
    import { LambdaInterface } from '@aws-lambda-powertools/commons';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });
    const DEFAULT_DIMENSIONS = { 'environment': 'prod', 'foo': 'bar' };

    export class MyFunction implements LambdaInterface {
        // Decorate your handler class method
        @metrics.logMetrics({ defaultDimensions: DEFAULT_DIMENSIONS })
        public async handler(_event: any, _context: any): Promise<void> {
            metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
        }
    }
    ```

If you'd like to remove them at some point, you can use the `clearDefaultDimensions` method.

### Flushing metrics

As you finish adding all your metrics, you need to serialize and "flush them" by calling `publishStoredMetrics()`. This will print the metrics to standard output.

You can flush metrics automatically using one of the following methods:  

* manually
* [Middy-compatible](https://github.com/middyjs/middy){target=_blank} middleware
* class decorator

Using the Middy middleware or decorator will **automatically validate, serialize, and flush** all your metrics. During metrics validation, if no metrics are provided then a warning will be logged, but no exception will be thrown.
If you do not use the middleware or decorator, you have to flush your metrics manually.

!!! warning "Metric validation"
    If metrics are provided, and any of the following criteria are not met, a **`RangeError`** exception will be thrown:

    * Maximum of 9 dimensions
    * Namespace is set only once (or none)
    * Metric units must be [supported by CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_MetricDatum.html)

#### Middy middleware

See below an example of how to automatically flush metrics with the Middy-compatible `logMetrics` middleware.

=== "handler.ts"

    ```typescript hl_lines="1-2 7 10-11"
    import { Metrics, MetricUnits, logMetrics } from '@aws-lambda-powertools/metrics';
    import middy from '@middy/core';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

    const lambdaHandler = async (_event: any, _context: any): Promise<void> => {
        metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
    };

    export const handler = middy(lambdaHandler)
        .use(logMetrics(metrics));
    ```

=== "Example CloudWatch Logs excerpt"

    ```json hl_lines="2 7 10 15 22"
    {
        "successfulBooking": 1.0,
        "_aws": {
        "Timestamp": 1592234975665,
        "CloudWatchMetrics": [
            {
            "Namespace": "serverlessAirline",
            "Dimensions": [
                [
                "service"
                ]
            ],
            "Metrics": [
                {
                "Name": "successfulBooking",
                "Unit": "Count"
                }
            ]
        },
        "service": "orders"
    }
    ```

#### Using the class decorator

!!! info
    Decorators can only be attached to a class declaration, method, accessor, property, or parameter. Therefore, if you prefer to write your handler as a standard function rather than a Class method, check the [middleware](#using-a-middleware) or [manual](#manually) method sections instead.  
    See the [official TypeScript documentation](https://www.typescriptlang.org/docs/handbook/decorators.html) for more details.

The `logMetrics` decorator of the metrics utility can be used when your Lambda handler function is implemented as method of a Class.

=== "handler.ts"

    ```typescript hl_lines="8"
    import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
    import { LambdaInterface } from '@aws-lambda-powertools/commons';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

    export class MyFunction implements LambdaInterface {

        @metrics.logMetrics()
        public async handler(_event: any, _context: any): Promise<void> {
            metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
        }
    }
    ```

=== "Example CloudWatch Logs excerpt"

    ```json hl_lines="2 7 10 15 22"
    {
        "successfulBooking": 1.0,
        "_aws": {
        "Timestamp": 1592234975665,
        "CloudWatchMetrics": [
            {
            "Namespace": "successfulBooking",
            "Dimensions": [
                [
                "service"
                ]
            ],
            "Metrics": [
                {
                "Name": "successfulBooking",
                "Unit": "Count"
                }
            ]
        },
        "service": "orders"
    }
    ```

#### Manually

You can manually flush the metrics with `publishStoredMetrics` as follows:

!!! warning
Metrics, dimensions and namespace validation still applies.

=== "handler.ts"

    ```typescript hl_lines="7"
    import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

    export const handler = async (_event: any, _context: any): Promise<void> => {
        metrics.addMetric('successfulBooking', MetricUnits.Count, 10);
        metrics.publishStoredMetrics();
    };
    ```

=== "Example CloudWatch Logs excerpt"

    ```json hl_lines="2 7 10 15 22"
    {
        "successfulBooking": 1.0,
        "_aws": {
        "Timestamp": 1592234975665,
        "CloudWatchMetrics": [
            {
            "Namespace": "successfulBooking",
            "Dimensions": [
                [
                "service"
                ]
            ],
            "Metrics": [
                {
                "Name": "successfulBooking",
                "Unit": "Count"
                }
            ]
            }
        ]
        },
        "service": "orders"
    }
    ```

#### Throwing a RangeError when no metrics are emitted

If you want to ensure that at least one metric is emitted before you flush them, you can use the `throwOnEmptyMetrics` parameter and pass it to the middleware or decorator:

=== "handler.ts"

    ```typescript hl_lines="11"
    import { Metrics, MetricUnits, logMetrics } from '@aws-lambda-powertools/metrics';
    import middy from '@middy/core';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

    const lambdaHandler = async (_event: any, _context: any): Promise<void> => {
        metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
    };

    export const handler = middy(lambdaHandler)
        .use(logMetrics(metrics, { throwOnEmptyMetrics: true }));
    ```

### Capturing a cold start invocation as metric

You can optionally capture cold start metrics with the `logMetrics` middleware or decorator via the `captureColdStartMetric` param.

=== "Middy Middleware"

    ```typescript hl_lines="11"
    import { Metrics, MetricUnits, logMetrics } from '@aws-lambda-powertools/metrics';
    import middy from '@middy/core';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

    const lambdaHandler = async (_event: any, _context: any): Promise<void> => {
        metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
    };

    export const handler = middy(lambdaHandler)
        .use(logMetrics(metrics, { captureColdStartMetric: true }));
    ```

=== "logMetrics decorator"

    ```typescript hl_lines="8"
    import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
    import { LambdaInterface } from '@aws-lambda-powertools/commons';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

    export class MyFunction implements LambdaInterface {

        @metrics.logMetrics({ captureColdStartMetric: true })
        public async handler(_event: any, _context: any): Promise<void> {
            metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
        }
    }
    ```

If it's a cold start invocation, this feature will:

* Create a separate EMF blob solely containing a metric named `ColdStart`
* Add the `function_name`, `service` and default dimensions

This has the advantage of keeping cold start metric separate from your application metrics, where you might have unrelated dimensions.

!!! info "We do not emit 0 as a value for the ColdStart metric for cost-efficiency reasons. [Let us know](https://github.com/awslabs/aws-lambda-powertools-typescript/issues/new?assignees=&labels=feature-request%2C+triage&template=feature_request.md&title=) if you'd prefer a flag to override it."

## Advanced

### Adding metadata

You can add high-cardinality data as part of your Metrics log with the `addMetadata` method. This is useful when you want to search highly contextual information along with your metrics in your logs.

!!! warning
    **This will not be available during metrics visualization** - Use **dimensions** for this purpose

=== "handler.ts"

    ```typescript hl_lines="8"
        import { Metrics, MetricUnits, logMetrics } from '@aws-lambda-powertools/metrics';
        import middy from '@middy/core';

        const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

        const lambdaHandler = async (_event: any, _context: any): Promise<void> => {
            metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
            metrics.addMetadata('bookingId', '7051cd10-6283-11ec-90d6-0242ac120003');
        };

        export const handler = middy(lambdaHandler)
            .use(logMetrics(metrics));
    ```

=== "Example CloudWatch Logs excerpt"

    ```json hl_lines="23"
    {
        "successfulBooking": 1.0,
        "_aws": {
        "Timestamp": 1592234975665,
        "CloudWatchMetrics": [
            {
            "Namespace": "serverlessAirline",
            "Dimensions": [
                [
                "service"
                ]
            ],
            "Metrics": [
                {
                "Namespace": "exampleApplication",
                "Dimensions": [
                    [
                    "service"
                    ]
                ],
                "Metrics": [
                    {
                    "Name": "successfulBooking",
                    "Unit": "Count"
                    }
                ]
                }
            ]
        },
        "service": "orders",
        "bookingId": "7051cd10-6283-11ec-90d6-0242ac120003"
    }
    ```

### Single metric with different dimensions

CloudWatch EMF uses the same dimensions across all your metrics. Use `singleMetric` if you have a metric that should have different dimensions.

!!! info
    For cost-efficiency, this feature would be used sparsely since you [pay for unique metric](https://aws.amazon.com/cloudwatch/pricing). Keep the following formula in mind:

    **unique metric = (metric_name + dimension_name + dimension_value)**

=== "Middy Middleware"

    ```typescript hl_lines="11 13-14"
    import { Metrics, MetricUnits, logMetrics } from '@aws-lambda-powertools/metrics';
    import middy from '@middy/core';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

    const lambdaHandler = async (_event: any, _context: any): Promise<void> => {
        metrics.addDimension('metricUnit', 'milliseconds');
        // This metric will have the "metricUnit" dimension, and no "metricType" dimension:
        metrics.addMetric('latency', MetricUnits.Milliseconds, 56);
    
        const singleMetric = metrics.singleMetric();
        // This metric will have the "metricType" dimension, and no "metricUnit" dimension:
        singleMetric.addDimension('metricType', 'business');
        singleMetric.addMetric('orderSubmitted', MetricUnits.Count, 1);
    };

    export const handler = middy(lambdaHandler)
        .use(logMetrics(metrics));
    ```

=== "logMetrics decorator"

    ```typescript hl_lines="14 16-17"
    import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
    import { LambdaInterface } from '@aws-lambda-powertools/commons';

    const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });

    class Lambda implements LambdaInterface {

        @metrics.logMetrics()
        public async handler(_event: any, _context: any): Promise<void> {
            metrics.addDimension('metricUnit', 'milliseconds');
            // This metric will have the "metricUnit" dimension, and no "metricType" dimension:
            metrics.addMetric('latency', MetricUnits.Milliseconds, 56);
        
            const singleMetric = metrics.singleMetric();
            // This metric will have the "metricType" dimension, and no "metricUnit" dimension:
            singleMetric.addDimension('metricType', 'business');
            singleMetric.addMetric('orderSubmitted', MetricUnits.Count, 1);
        }
    }

    export const myFunction = new Lambda();
    export const handler = myFunction.handler;
    ```
