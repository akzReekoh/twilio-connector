'use strict';

var isEmpty       = require('lodash.isempty'),
	isPlainObject = require('lodash.isplainobject'),
	platform      = require('./platform'),
	twilioClient  = require('twilio'),
	config;

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {
	if (isPlainObject(data)) {
		var to, from, body;

		if (isEmpty(data.to))
			to = config.default_receiver;
		else
			to = data.to;

		if (isEmpty(data.from))
			from = config.default_sender;
		else
			from = data.from;

		if (isEmpty(data.body))
			body = config.body;
		else
			body = data.body;

		delete data.to;
		delete data.from;
		delete data.body;

		var params = {
			to: to,
			from: from
		};

		if (isEmpty(body))
			params.body = JSON.stringify(data, null, 4);
		else
			params.body = body + '\n\n' + JSON.stringify(data, null, 4);

		twilioClient.sendMessage(params, function (error) {
			if (error) {
				console.error(error);
				platform.handleException(error);
			}
			else {
				platform.log(JSON.stringify({
					title: 'Twilio SMS Sent',
					data: params
				}));
			}
		});
	}
	else
		platform.handleException(new Error('Invalid data received. Must be a valid JSON Object. Data ' + data));
});

/*
 * Event to listen to in order to gracefully release all resources bound to this service.
 */
platform.on('close', function () {
	platform.notifyClose();
});

/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {
	twilioClient = require('twilio')(options.account_sid, options.auth_token);
	config = options;

	platform.log('Twilio Connector Initialized.');
	platform.notifyReady();
});
