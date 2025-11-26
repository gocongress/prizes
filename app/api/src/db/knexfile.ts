import * as config from '@/config';
import { buildServiceContext } from '@/context';
import { buildKnexConfig } from './db';

async function buildConfigurationForEnv() {
  const context = buildServiceContext(config);

  return {
    [context.env]: buildKnexConfig({
      db: config.db,
    }),
  };
}

export const knexConfig = async () => {
  const configuration = await buildConfigurationForEnv();
  return {
    ...configuration,
  };
};

export default knexConfig;
