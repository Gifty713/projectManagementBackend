import {createClient} from "redis";

let redisErrorLogged = false;
const redisClient = createClient({
    username: "default",
    password:process.env.REDISPWD,
    socket: {
        host: 'monumental-slow-spirited-37578.db.redis.io',
        port: 10105,
        connectTimeout: 10000
    }
})

redisClient.on('error', err =>{
    if (!redisErrorLogged) {
        console.error("Redis client error:", err.message);
        redisErrorLogged = true;
    }
});

redisClient.on("ready", () => {
  redisErrorLogged = false;
  console.log("Redis connected.");
});

await redisClient.connect();
export default redisClient;