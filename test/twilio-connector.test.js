'use strict'

const amqp = require('amqplib')

const ACCOUNT_SID = 'ACa172f64f41e3369893dcc30dd1ef01f9'
const AUTH_TOKEN = 'ede3899ad202e90771567a446850ef8b'

let _channel = null
let _conn = null
let app = null

describe('Twilio Connector Test', () => {
  before('init', () => {
    process.env.ACCOUNT = 'adinglasan'
    process.env.CONFIG = JSON.stringify({
      accountSid: ACCOUNT_SID,
      authToken: AUTH_TOKEN
    })
    process.env.INPUT_PIPE = 'ip.twilio'
    process.env.LOGGERS = 'logger1, logger2'
    process.env.EXCEPTION_LOGGERS = 'ex.logger1, ex.logger2'
    process.env.BROKER = 'amqp://guest:guest@127.0.0.1/'

    amqp.connect(process.env.BROKER)
      .then((conn) => {
        _conn = conn
        return conn.createChannel()
      }).then((channel) => {
      _channel = channel
    }).catch((err) => {
      console.log(err)
    })
  })

  after('close connection', function (done) {
    _conn.close()
    done()
  })

  describe('#start', function () {
    it('should start the app', function (done) {
      this.timeout(10000)
      app = require('../app')
      app.once('init', done)
    })
  })

  describe('#data', () => {
    it('should send data to third party client', function (done) {
      this.timeout(15000)

      let data = {
        to: '+12016694769',
        from: '+12016694769',
        body: 'This is a test SMS message from twilio-connector plugin'
      }

      _channel.sendToQueue('ip.twilio', new Buffer(JSON.stringify(data)))
      setTimeout(done, 10000)
    })
  })
})
