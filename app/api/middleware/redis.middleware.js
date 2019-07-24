const Redis = require('ioredis')
const client = new Redis(6379)

client.on('error', (err) => {
  console.log("Error " + err)
});

const deleteKey = (key) => {
  const stream = redis.scanStream({ match: `${key}:*`,count: 100 });
  const pipeline = redis.pipeline()
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
      pipeline = redis.pipeline();
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