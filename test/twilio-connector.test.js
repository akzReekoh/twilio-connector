'use strict';

const ACCOUNT_SID = 'ACa172f64f41e3369893dcc30dd1ef01f9',
    AUTH_TOKEN = 'ede3899ad202e90771567a446850ef8b';

var cp     = require('child_process'),
	assert = require('assert'),
	connector;

describe('Connector', function () {
	this.slow(5000);

	after('terminate child process', function (done) {
		this.timeout(7000);

        setTimeout(function(){
            connector.kill('SIGKILL');
			done();
        }, 5000);
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			assert.ok(connector = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			connector.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			connector.send({
				type: 'ready',
				data: {
					options: {
						account_sid: ACCOUNT_SID,
						auth_token: AUTH_TOKEN
					}
				}
			}, function (error) {
				assert.ifError(error);
			});
		});
	});

	describe('#data', function (done) {
		it('should process the JSON data', function () {
			connector.send({
				type: 'data',
				data: {
					to: '+12016694769',
					from: '+12016694769',
					body: 'This is a test SMS message from twilio-connector plugin'
				}
			}, done);
		});
	});

	describe('#data', function (done) {
		it('should process the Array data', function () {
			connector.send({
				type: 'data',
				data: [
					{
						to: '+12016694769',
						from: '+12016694769',
						body: 'This is a test SMS message from twilio-connector plugin'
					},
					{
						to: '+12016694769',
						from: '+12016694769',
						body: 'This is a test SMS message from twilio-connector plugin'
					}
				]
			}, done);
		});
	});
});