import { loadEnv } from './env.js';
import { createConfig } from './config.js';
import { createContainer } from './container.js';
export function bootstrap() {
    const env = loadEnv();
    const config = createConfig(env);
    const container = createContainer(config);
    container.logger.info('startup_complete', { appMode: config.appMode, nodeEnv: config.nodeEnv });
    return container;
}
