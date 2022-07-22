/**
 * Test Tracer helpers
 *
 * @group unit/tracer/all
 */

import { ConfigServiceInterface } from '../../src/config';
import { TracerOptions } from '../../src/types';
import { createTracer, Tracer } from './../../src';

describe('Helper: createTracer function', () => {
  const ENVIRONMENT_VARIABLES = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ENVIRONMENT_VARIABLES };
  });

  afterAll(() => {
    process.env = ENVIRONMENT_VARIABLES;
  });

  describe('TracerOptions parameters', () => {
    test('when no tracer options are passed, returns a Tracer instance with the correct proprieties', () => {
      // Prepare
      const tracerOptions = undefined;

      // Act
      const tracer = createTracer(tracerOptions);

      // Assess
      expect(tracer).toBeInstanceOf(Tracer);
      expect(tracer).toEqual(expect.objectContaining({
        tracingEnabled: true,
        serviceName: 'hello-world',
        captureHTTPsRequests: true
      }));
            
    });

    test('when all tracer options are passed, returns a Tracer instance with the correct properties', () => {

      // Prepare
      const tracerOptions = {
        enabled: false,
        serviceName: 'my-lambda-service',
        captureHTTPsRequests: false,
      };

      // Act
      const tracer = createTracer(tracerOptions);

      // Assess
      expect(tracer).toBeInstanceOf(Tracer);
      expect(tracer).toEqual(expect.objectContaining({
        tracingEnabled: false,
        serviceName: 'my-lambda-service',
        captureHTTPsRequests: false,
      }));
      
    });

    test('when a custom serviceName is passed, returns a Tracer instance with the correct properties', () => {

      // Prepare
      const tracerOptions = {
        serviceName: 'my-lambda-service'
      };

      // Act
      const tracer = createTracer(tracerOptions);

      // Assess
      expect(tracer).toBeInstanceOf(Tracer);
      expect(tracer).toEqual(expect.objectContaining({
        tracingEnabled: true,
        serviceName: 'my-lambda-service',
        captureHTTPsRequests: true,
      }));

    });

    test('when a custom, but invalid, serviceName is passed, returns a Tracer instance with the correct properties', () => {

      // Prepare
      const tracerOptions = {
        serviceName: ''
      };

      // Act
      const tracer = createTracer(tracerOptions);

      // Assess
      expect(tracer).toBeInstanceOf(Tracer);
      expect(tracer).toEqual(expect.objectContaining({
        tracingEnabled: true,
        serviceName: 'hello-world',
        captureHTTPsRequests: true,
      }));

    });

    test('when (tracing) disabled is passed, returns a Tracer instance with the correct properties', () => {

      // Prepare
      const tracerOptions = {
        enabled: false
      };

      // Act
      const tracer = createTracer(tracerOptions);

      // Assess
      expect(tracer).toBeInstanceOf(Tracer);
      expect(tracer).toEqual(expect.objectContaining({
        tracingEnabled: false,
        serviceName: 'hello-world',
        captureHTTPsRequests: true,
      }));

    });

    test('when a custom customConfigService is passed, returns a Logger instance with the correct proprieties', () => {

      const configService: ConfigServiceInterface = {
        get(name: string): string {
          return `a-string-from-${name}`;
        },
        getCaptureHTTPsRequests(): string {
          return 'false';
        },
        getTracingEnabled(): string {
          return 'false';
        },
        getTracingCaptureResponse(): string {
          return 'false';
        },
        getTracingCaptureError(): string {
          return 'false';
        },
        getServiceName(): string {
          return 'my-backend-service';
        }
      };
      // Prepare
      const tracerOptions: TracerOptions = {
        customConfigService: configService
      };
      
      // Act
      const tracer = createTracer(tracerOptions);
      
      // Assess
      expect(tracer).toBeInstanceOf(Tracer);
      expect(tracer).toEqual(expect.objectContaining({
        customConfigService: configService,
        tracingEnabled: false,
        serviceName: 'my-backend-service',
        captureHTTPsRequests: false,
      }));

    });

    test('when tracing is enabled and patching of http requests is opted-out, captureHTTPsRequests is false', () => {

      // Prepare
      const tracerOptions = {
        enabled: true,
        captureHTTPsRequests: false
      };
      
      // Act
      const tracer = createTracer(tracerOptions);

      // Assess
      expect(tracer).toBeInstanceOf(Tracer);
      expect(tracer).toEqual(expect.objectContaining({
        tracingEnabled: true,
        captureHTTPsRequests: false,
      }));

    });

    test('when tracing is enabled captureHTTPsGlobal is true', () => {

      // Prepare
      const tracerOptions = {
        enabled: true,
      };
      
      // Act
      const tracer = createTracer(tracerOptions);

      // Assess
      expect(tracer).toBeInstanceOf(Tracer);
      expect(tracer).toEqual(expect.objectContaining({
        tracingEnabled: true,
        captureHTTPsRequests: true,
      }));

    });

  });

  describe('Environment Variables configs', () => {

    test('when AWS_EXECUTION_ENV environment variable is equal to AWS_Lambda_amplify-mock, tracing is disabled', () => {
      // Prepare
      process.env.AWS_EXECUTION_ENV = 'AWS_Lambda_amplify-mock';

      // Act
      const tracer = createTracer();

      // Assess
      expect(tracer).toEqual(expect.objectContaining({
        tracingEnabled: false,
      }));

    });

    test('when AWS_SAM_LOCAL environment variable is set, tracing is disabled', () => {
      // Prepare
      process.env.AWS_SAM_LOCAL = 'true';

      // Act
      const tracer = createTracer();

      // Assess
      expect(tracer).toEqual(expect.objectContaining({
        tracingEnabled: false,
      }));

    });

    test('when AWS_EXECUTION_ENV environment variable is set, tracing is enabled', () => {
      // Prepare
      process.env.AWS_EXECUTION_ENV = 'nodejs16.x';

      // Act
      const tracer = createTracer();

      // Assess
      expect(tracer).toEqual(expect.objectContaining({
        tracingEnabled: true,
      }));

    });

    test('when AWS_EXECUTION_ENV environment variable is NOT set, tracing is disabled', () => {
      // Prepare
      delete process.env.AWS_EXECUTION_ENV;

      // Act
      const tracer = createTracer();

      // Assess
      expect(tracer).toEqual(expect.objectContaining({
        tracingEnabled: false,
      }));
    });

    test('when POWERTOOLS_TRACE_ENABLED environment variable is set, a tracer with tracing disabled is returned', () => {
      // Prepare
      process.env.POWERTOOLS_TRACE_ENABLED = 'false';

      // Act
      const tracer = createTracer();

      // Assess
      expect(tracer).toEqual(expect.objectContaining({
        tracingEnabled: false,
      }));

    });

    test('when POWERTOOLS_SERVICE_NAME environment variable is set, a tracer with the correct serviceName is returned', () => {
      // Prepare
      process.env.POWERTOOLS_SERVICE_NAME = 'my-backend-service';

      // Act
      const tracer = createTracer();

      // Assess
      expect(tracer).toEqual(expect.objectContaining({
        serviceName: 'my-backend-service'
      }));

    });

    test('when POWERTOOLS_TRACER_CAPTURE_RESPONSE environment variable is set, a tracer with captureResponse disabled is returned', () => {
      // Prepare
      process.env.POWERTOOLS_TRACER_CAPTURE_RESPONSE = 'false';

      // Act
      const tracer = createTracer();

      // Assess
      expect(tracer).toEqual(expect.objectContaining({
        captureResponse: false
      }));

    });

    test('when POWERTOOLS_TRACER_CAPTURE_RESPONSE environment variable is set to invalid value, a tracer with captureResponse enabled is returned', () => {
      // Prepare
      process.env.POWERTOOLS_TRACER_CAPTURE_RESPONSE = '';

      // Act
      const tracer = createTracer();

      // Assess
      expect(tracer).toEqual(expect.objectContaining({
        captureResponse: true
      }));

    });

    test('when POWERTOOLS_TRACER_CAPTURE_ERROR environment variable is set, a tracer with captureError disabled is returned', () => {
      // Prepare
      process.env.POWERTOOLS_TRACER_CAPTURE_ERROR = 'false';

      // Act
      const tracer = createTracer();

      // Assess
      expect(tracer).toEqual(expect.objectContaining({
        captureError: false
      }));

    });

    test('when POWERTOOLS_TRACER_CAPTURE_ERROR environment variable is set to invalid value, a tracer with captureError enabled is returned', () => {
      // Prepare
      process.env.POWERTOOLS_TRACER_CAPTURE_ERROR = '';

      // Act
      const tracer = createTracer();

      // Assess
      expect(tracer).toEqual(expect.objectContaining({
        captureError: true
      }));

    });

    test('when POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS environment variable is set, captureHTTPsGlobal is called', () => {
      // Prepare
      process.env.POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS = 'false';

      // Act
      const tracer = createTracer();

      // Assess
      expect(tracer).toEqual(expect.objectContaining({
        captureHTTPsRequests: false,
      }));

    });

    test('when POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS environment variable is set to invalid value, captureHTTPsGlobal is called', () => {
      // Prepare
      process.env.POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS = '';

      // Act
      const tracer = createTracer();

      // Assess
      expect(tracer).toEqual(expect.objectContaining({
        captureHTTPsRequests: true,
      }));

    });

  });
});