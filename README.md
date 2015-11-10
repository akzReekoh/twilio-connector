# Twilio Connector
[![Build Status](https://travis-ci.org/Reekoh/twilio-connector.svg)](https://travis-ci.org/Reekoh/twilio-connector)
![Dependencies](https://img.shields.io/david/Reekoh/twilio-connector.svg)
![Dependencies](https://img.shields.io/david/dev/Reekoh/twilio-connector.svg)
![Built With](https://img.shields.io/badge/built%20with-gulp-red.svg)

Twilio Connector Plugin for the Reekoh IoT Platform. Integrates a Reekoh instance with Twilio Service to send SMS/Notifications based on incoming data from connected devices.

## Description
This plugin sends SMS/Nofications based on incoming data from devices connected to the Reekoh instance to Twilio Messaging Service.

## Configuration
To configure this plugin a Twilio account is needed in order to provide the following:

1. Account SID - The Twilio Account SID to use
2. Auth Token -  The corresponding Auth Token of the Twilio Account SID

Other parameters:
1. Default Sender - The default sender(number) of the SMS/Notification.
2. Default Receiver - The default receiver(number) of the SMS/Notification.
3. Default Text - The default text/body of the SMS/Notification.

These parameters are then injected to the plugin from the platform.