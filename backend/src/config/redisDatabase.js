import {createClient} from "redis";

const redisClient = createClient({
    username: "default",
    password:"AUe73lYI6pddPJuSTrJcihH6EPQ3DavU",
    socket: {
        host: 'monumental-slow-spirited-37578.db.redis.io',
        port: 10105,
        connectTimeout: 10000
    }
})

redisClient.on('error', err =>{
    console.log('Redis Client Error', err)
    process.exit(1);
});

await redisClient.connect();

export default redisClient;