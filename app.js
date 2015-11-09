'use strict';

var platform = require('./platform'),
    _ = require('lodash'),
    isJSON = require('is-json'),
    twilioClient = require('twilio');

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {
    if(isJSON(data, true)) {
        if (_.isEmpty(data.to))
            return platform.handleException(new Error('Kindly specify SMS recipient.'));

        if (_.isEmpty(data.from))
            return platform.handleException(new Error('Kindly specify SMS sender.'));

        if (_.isEmpty(data.body))
            return platform.handleException(new Error('Kindly provide SMS message body.'));

        twilioClient.sendMessage(data, function (error, responseData) {
            if (error) {
                console.error(error);
                platform.handleException(error);
            }
            else {
                platform.log(JSON.stringify({
                    title: 'Twilio SMS Sent',
                    data: data
                }));
            }
        });
    }
    else
        platform.handleException(new Error('Invalid data received. ' + data));
});

/*
 * Event to listen to in order to gracefully release all resources bound to this service.
 */
platform.on('close', function () {
	var domain = require('domain');
	var d = domain.create();

	d.on('error', function(error) {
		console.error(error);
		platform.handleException(error);
		platform.notifyClose();
	});

	d.run(function() {
		// TODO: Release all resources and close connections etc.
		platform.notifyClose(); // Notify the platform that resources have been released.
	});
});

/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {
    twilioClient = require('twilio')(options.account_sid, options.auth_token);

	platform.notifyReady();
});