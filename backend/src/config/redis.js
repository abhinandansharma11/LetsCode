const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-15154.c57.us-east-1-4.ec2.cloud.redislabs.com',
        port: 15154
    }
});

redisClient.on('error', (err) => {
    console.log('Redis error (non-fatal):', err.message);
});

module.exports = redisClient;