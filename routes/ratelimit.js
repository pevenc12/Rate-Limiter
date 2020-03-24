const redis = require('redis')
const redisClient = redis.createClient()
const moment = require('moment')

module.exports = (req,res,next) => {
  redisClient.exists(req.ip, (err,reply) => {
    if(err) {
      console.log("Redis not working...")
      system.exit(0)
    }
    
    if(reply === 1) {
      // user exists
      redisClient.get(req.ip, async (err,reply) => {
        let data = JSON.parse(reply)
        const currentTime = moment().unix()
        const difference = (currentTime - data.startTime)/3600
        if(difference >= 1) {
          try{
            let body = {
              'count': 1,
              'startTime': moment().unix()
            }
            redisClient.set(req.ip, JSON.stringify(body))
            res.send()
          }
          catch(e){
            console.log(e)
          }
        }
        else{
          try{
            if(data.count > 1000) {
              await res.status(429).send('Too Many Requests')
            }
            else{
              ++data.count
              await redisClient.set(req.ip, JSON.stringify(data))
              await res.set({
                'X-RateLimit-Remaining': 1000 - data.count,
                'X-RateLimit-Reset' : moment.unix(data.startTime + 3600)
              }).send()
            }
          }
          catch(e){
            console.log(e)
          }
        }
      })
    }
    else {
      // add new user
      let body = {
        'count': 1,
        'startTime': moment().unix()
      }
      redisClient.set(req.ip,JSON.stringify(body))
    }
  })
}