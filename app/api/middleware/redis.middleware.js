const redis = require("redis")
const client = redis.createClient(redis_url)


module.exports = {
  getCached: (req, res, next) => {
    const { redis_key } = req.headers
    client.get(redis_key, (err, reply) => {
      if (err) {
        res.status(500).json({
          message: "Somethin Went Wrong"
        })
      }
      if (reply == null) {
        next()
      } else {
        res.status(200).json({
          message: `Success Read ${redis_key}`,
          data: JSON.parse(reply)
        })
      }
    });
  },
  caching: (key, data) => {
    client.set(key, JSON.stringify(data) )
  },
  delCache: (key) => {
    client.del(key)
  }
}