import { ChainData } from '@/lib/connext/chainData'
import { contractDeployments } from '@/lib/connext/contracts'
import { Logger } from '@/lib/connext/logger'

import { getConfig, SdkConfig } from './config'
import { SdkBase } from './sdkBase'

export const create = async (
	_config: SdkConfig,
	_logger?: Logger,
	_chainData?: Map<string, ChainData>
): Promise<{
	sdkBase: SdkBase
	/*sdkUtils: SdkUtils;
  sdkRouter: SdkRouter;
  sdkPool: SdkPool;*/
}> => {
	const { nxtpConfig, chainData } = await getConfig(_config, contractDeployments, _chainData)
	const logger = _logger || new Logger()

	const sdkBase = await SdkBase.create(nxtpConfig, logger, chainData)
	/*const sdkUtils = await SdkUtils.create(nxtpConfig, logger, chainData);
  const sdkRouter = await SdkRouter.create(nxtpConfig, logger, chainData);
  const sdkPool = await SdkPool.create(nxtpConfig, logger, chainData);*/

	//const { requestContext, methodContext } = createLoggingContext("SDK create()");
	//logger.info(`Initialized SDK with config: `, requestContext, methodContext, { nxtpConfig: nxtpConfig });

	return { sdkBase /*, sdkUtils, sdkRouter, sdkPool*/ }
}
