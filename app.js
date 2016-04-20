'use strict';

var isEmpty       = require('lodash.isempty'),
	isArray = require('lodash.isarray'),
	async = require('async'),
	isPlainObject = require('lodash.isplainobject'),
	platform      = require('./platform'),
	twilioClient  = require('twilio'),
	config;

let sendData = (data, callback) => {
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
		if (!error) {
			platform.log(JSON.stringify({
				title: 'Twilio SMS Sent',
				data: params
			}));
		}

        callback(error);
	});
};

platform.on('data', function (data) {
    if(isPlainObject(data)){
        sendData(data, (error) => {
            if(error) {
                console.error(error);
                platform.handleException(error);
            }
        });
    }
    else if(isArray(data)){
        async.each(data, (datum, done) => {
            sendData(datum, done);
        }, (error) => {
            if(error) {
                console.error(error);
                platform.handleException(error);
            }
        });
    }
	else
		platform.handleException(new Error('Invalid data received. Must be a valid Array/JSON Object. Data ' + data));
});

platform.on('close', function () {
	platform.notifyClose();
});

platform.once('ready', function (options) {
	twilioClient = require('twilio')(options.account_sid, options.auth_token);
	config = options;

	platform.log('Twilio Connector Initialized.');
	platform.notifyReady();
});
