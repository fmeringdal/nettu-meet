import redis, { RedisClient } from 'redis';
import { authConfig, isProduction } from '../../../config';
import { logger } from "../../../logger"

const port = authConfig.redisServerPort;
const host = authConfig.redisServerHost;

const redisConnection: RedisClient = isProduction
    ? redis.createClient(authConfig.redisConnectionString)
    : redis.createClient({ port, host }); // creates a new client

redisConnection.on('connect', () => {
    logger.info(`[Redis]: Connected to redis server at ${host}:${port}`);
});

export { redisConnection };
