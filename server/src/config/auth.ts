const authConfig = {
    tokenExpiryTime: 300, // seconds => 5 minutes
    redisServerPort: process.env.NETTU_REDIS_PORT ? parseInt(process.env.NETTU_REDIS_PORT) : 6379,
    redisServerHost: process.env.NETTU_REDIS_HOST as string,
    redisConnectionString: process.env.REDIS_URL as string,
};

export { authConfig };
