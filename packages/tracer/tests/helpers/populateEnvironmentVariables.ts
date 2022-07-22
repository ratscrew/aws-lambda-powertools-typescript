// Reserved variables
process.env._X_AMZN_TRACE_ID = '1-abcdef12-3456abcdef123456abcdef12';
process.env.AWS_LAMBDA_FUNCTION_NAME = 'my-lambda-function';
process.env.AWS_EXECUTION_ENV = 'nodejs16.x';
process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '128';
process.env.AWS_REGION = 'eu-west-1';
process.env._HANDLER = 'index.handler';

// Powertools variables
process.env.POWERTOOLS_SERVICE_NAME = 'hello-world';
process.env.AWS_XRAY_LOGGING_LEVEL = 'silent';