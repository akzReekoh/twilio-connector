'use strict'

let reekoh = require('reekoh')
let _plugin = new reekoh.plugins.Connector()
let async = require('async')
let isArray = require('lodash.isarray')
let isEmpty = require('lodash.isempty')
let isPlainObject = require('lodash.isplainobject')
let isError = require('lodash.iserror')
let twilioClient = require('twilio')

let sendData = (data, callback) => {
  let to = null
  let from = null
  let body = null

  if (isEmpty(data.to)) {
    to = _plugin.config.defaultReceiver
  } else {
    to = data.to
  }

  if (isEmpty(data.from)) { from = _plugin.config.defaultSender } else {
    from = data.from
  }

  if (isEmpty(data.body)) {
    body = _plugin.config.body
  } else {
    body = data.body
  }

  delete data.to
  delete data.from
  delete data.body

  let params = {
    to: to,
    from: from
  }

  if (isEmpty(body)) { params.body = JSON.stringify(data, null, 4) } else {
    params.body = body + '\n\n' + JSON.stringify(data, null, 4)
  }

  twilioClient.sendMessage(params, function (error) {
    if (!error) {
      _plugin.log(JSON.stringify({
        title: 'Twilio SMS Sent',
        data: params
      }))
    }

    callback(error)
  })
}

/**
 * Emitted when device data is received.
 * This is the event to listen to in order to get real-time data feed from the connected devices.
 * @param {object} data The data coming from the device represented as JSON Object.
 */
_plugin.on('data', (data) => {
  if (isPlainObject(data)) {
    sendData(data, (error) => {
      if (error) {
        console.error(error)

        if (!isError(error)) {
          error = new Error(error)
        }

        _plugin.logException(error)
      }
    })
  } else if (isArray(data)) {
    async.each(data, (datum, done) => {
      sendData(datum, done)
    }, (error) => {
      if (error) {
        console.error(error)

        if (!isError(error)) {
          error = new Error(error)
        }

        _plugin.logException(error)
      }
    })
  } else { _plugin.logException(new Error('Invalid data received. Must be a valid Array/JSON Object. Data ' + data)) }
})

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 */
_plugin.once('ready', () => {
  twilioClient = require('twilio')(_plugin.config.accountSid, _plugin.config.authToken)

  _plugin.log('Twilio Connector has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
