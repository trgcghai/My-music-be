import Redis from "ioredis";

// Connect to Redis
const redis = new Redis({
    host: "127.0.0.1",  // Change if Redis is hosted remotely
    port: 6379,
    password: "",       // Set password if required
});

export default redis;
