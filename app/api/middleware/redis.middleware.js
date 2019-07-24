const Redis = require('ioredis')
const client = new Redis({
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST
})

client.on('error', (err) => {
  console.log("Error " + err)
});

const deleteKey = (key) => {
  let count = 100
  const match = `${key}:*`
  console.log(match)
  const stream = client.scanStream({ match, count });
  const pipeline = client.pipeline()
  const localKeys = [];

  stream.on('data', (resultKeys) => {
    console.log("Data Received", count, localKeys.length);
    for (let i = 0; i < resultKeys.length; i++) {
      localKeys.push(resultKeys[i]);
      pipeline.del(resultKeys[i]);
    }

    if (localKeys.length > 100) {
      pipeline.exec(() => { console.log("one batch delete complete") });
      localKeys = [];
      pipeline = client.pipeline();
    }

  });

  stream.on('end', () => {
    pipeline.exec(() => { console.log("final batch delete complete") });
  });

  stream.on('error', (err) => {
    console.log("error", err)
  })
}

module.exports = { client, deleteKey }