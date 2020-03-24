const express = require('express')
const app = express()
const rateLimiter = require('./routes/ratelimit')

app.set('trust proxy', true)
app.use(rateLimiter)

app.listen(process.env.PORT || 3000)