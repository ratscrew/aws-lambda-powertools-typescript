import { BaseProvider } from './BaseProvider';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import type { SSMClientConfig } from '@aws-sdk/client-ssm';

class SSMProvider extends BaseProvider {
  public client: SSMClient;

  public constructor(config: SSMClientConfig = {}) {
    super();
    this.client = new SSMClient(config);
  }

  public async _get(name: string, sdkOptions?: GetParameterCommand): Promise<string | undefined> {
    let result;
    if (sdkOptions === undefined) {
      const command = new GetParameterCommand({
        Name: name
      });

      result = await this.client.send(command);
    } else {
      result = await this.client.send(sdkOptions);
    }

    return result.Parameter?.Value;
  }

  public _getMultiple(_path: string): Promise<Record<string, string | undefined>> {
    throw Error('Not implemented.');
  }
}

export {
  SSMProvider
};