MyThingsHub
----------------
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

<b>Original work by [Felix Rusu](lowpowerlab.com/contact), Low Power Lab LLC</b>
<br/>
Thank you very much Felix.
<br/>

### A little history:
I really liked the functionality and the speed of [Felix Rusu's] software and I used it as the base for my own implementation.
<br/>I did not have great success with SD cards in Raspberry Pis in the past so this lead to some changed, things escalated and a different approach was born.
<br/>To avoid confusion with original PiGateway, I renamed my version as MyThingsHub.

### Modifications:
MyThingsHub can get/send messages over serial port and/or MQTT broker. For the moment HTTP is disabled.<br/>
My hardware gateway is connected to a Raspberry Pi that runs a simple Serial2Mqtt script. It does not write on the SD card, everything (including system logs) are sent to a local server, so SD card corruption is gone. <br/>
My nodes usualy have multiple identical sensors and I wanted to avoid hard codeing multiple almost identical metrics. [MySensors](https://www.mysensors.org/) uses the ideea of child sensors for nodes and I implemented something similar. Every node metric has a sensorId for identification. If no sensorId is specified a default 0 is used.<br/>
For example, a message `[123] C:24.3 2:C:5.1 SS:-70` will use the same metrics data for type C, but treat each value as two distinct sensor IDs, `C:24.3` default to sensor ID 0, `2:C:5.1` has the sensor ID specified, and SS also default to 0. The original message format is still valid, they are just stored differently.<br/>
I use the Mqtt interface to get data from multiple sources. Sometimes, multiple messages from the same node ID got published in parallel, and I noticed that caused some issues because of the way neDB saves and reads data from the database. To solve this I switched to neDB-promises and used mqtt package for backpressure. His is partially solved because, parallel publishing still causes some problems, not with neDB but with mqtt module.<br/>   

### Features:
- MQTT communication support
- HTTPS secured with self signed certificate
- HTTP `auth_basic` authentication
- responsive & mobile friendly design
- realtime updated via socket.io websockets & node.js backend 
- [neDB-promises](https://github.com/bajankristof/nedb-promises) storage of node data and logs
- [flot](http://flotcharts.org/) front end graphs
- [nconf](https://github.com/indexzero/nconf) for easy global variable configuration maintenance
- [nodemailer](https://github.com/andris9/Nodemailer) for sending email (and SMS relayed via email)
- [Font-awesome](http://htmlpreview.github.io/?https://github.com/dotcastle/jquery-mobile-font-awesome/blob/master/index.html) icons for jQuery-Mobile

### LICENSE - ORIGINAL AUTHOR
This project is released under [CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).<br/>
The licensing TLDR; is: You are free to use, copy, distribute and transmit this Software for personal, non-commercial purposes, as long as you give attribution and share any modifications under the same license. Commercial or for-profit use [requires a license](https://lowpowerlab.com/contact).
For more details see the [LICENSE](https://github.com/LowPowerLab/RaspberryPi-Gateway/blob/master/LICENSE)

### Details & Setup Guide
[Felix Rusu] wrote a great HOW TO for [PiGateway](https://lowpowerlab.com/guide/gateway/), available on his site. This is generally valid for MyThingsHub also.
