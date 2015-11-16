'use strict';

var _            = require('lodash'),
	domain       = require('domain'),
	platform     = require('./platform'),
	twilioClient = require('twilio'),
	config;

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {
	var d = domain.create();

	d.once('error', function (error) {
		platform.handleException(error);
	});

	d.run(function () {
		var to, from, body;

		if (_.isEmpty(data.to))
			to = config.default_receiver;
		else
			to = data.to;

		if (_.isEmpty(data.from))
			from = config.default_sender;
		else
			from = data.from;

		if (_.isEmpty(data.body))
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

		if (_.isEmpty(body))
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

			d.exit();
		});
	});
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
