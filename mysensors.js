/* MySensors v2 Message Decoder
*  Payload : JSON object
*  www.projetsdiy.fr - oct. 2016
*/
exports.processMySensors = function(message, topic){
    var mySensorsMessage = {}
    var receivedMsg = {};
    var msg;
    message = message.toString().replace(/(\r\n|\n|\r)/gm, "");
    //serial message, no topic
    if (topic == null){
        var tokens = message.split(";");
    }else{
        var tokens = topic.split("/");
        tokens[5] = message;
    }

    if(tokens.length == 6)
    {
        mySensorsMessage.nodeId =       parseInt(tokens[0]);
        mySensorsMessage.childSensorId= parseInt(tokens[1]);
        mySensorsMessage.messageType =  parseInt(tokens[2]);
        mySensorsMessage.ack =          parseInt(tokens[3]);
        mySensorsMessage.subType =      parseInt(tokens[4]);
        mySensorsMessage.value =        tokens[5];

        var messageType = mySensorsMessage.messageType;
        const labelPresentation = [
            'S_DOOR',
            'S_MOTION',
            'S_SMOKE',
            'S_BINARY',
            'S_DIMMER',
            'S_COVER',
            'S_TEMP',
            'S_HUM',
            'S_BARO',
            'S_WIND',
            'S_RAIN',
            'S_UV',
            'S_WEIGHT',
            'S_POWER',
            'S_HEATER',
            'S_DISTANCE',
            'S_LIGHT_LEVEL',
            'S_ARDUINO_NODE',
            'S_ARDUINO_REPEATER_NODE',
            'S_LOCK',
            'S_IR',
            'S_WATER',
            'S_AIR_QUALITY',
            'S_CUSTOM',
            'S_DUST',
            'S_SCENE_CONTROLLER',
            'S_RGB_LIGHT',
            'S_RGBW_LIGHT',
            'S_COLOR_SENSOR',
            'S_HVAC',
            'S_MULTIMETER',
            'S_SPRINKLER',
            'S_WATER_LEAK',
            'S_SOUND',
            'S_VIBRATION',
            'S_MOISTURE',
            'S_INFO',
            'S_GAS',
            'S_GPS',
            'S_WATER_QUALITY',
        ];
        const labelSet = [
            'V_TEMP',
            'V_HUM',
            'V_STATUS',
            'V_PERCENTAGE',
            'V_PRESSURE',
            'V_FORECAST',
            'V_RAIN',
            'V_RAINRATE',
            'V_WIND',
            'V_GUST',
            'V_DIRECTION',
            'V_UV',
            'V_WEIGHT',
            'V_DISTANCE',
            'V_IMPEDANCE',
            'V_ARMED',
            'V_TRIPPED',
            'V_WATT',
            'V_KWH',
            'V_SCENE_ON',
            'V_SCENE_OFF',
            'V_HVAC_FLOW_STATE',
            'V_HVAC_SPEED',
            'V_LIGHT_LEVEL',
            'V_VAR1',
            'V_VAR2',
            'V_VAR3',
            'V_VAR4',
            'V_VAR5',
            'V_UP',
            'V_DOWN',
            'V_STOP',
            'V_IR_SEND',
            'V_IR_RECEIVE',
            'V_FLOW',
            'V_VOLUME',
            'V_LOCK_STATUS',
            'V_LEVEL',
            'V_VOLTAGE',
            'V_CURRENT',
            'V_RGB',
            'V_RGBW',
            'V_ID',
            'V_UNIT_PREFIX',
            'V_HVAC_SETPOINT_COOL',
            'V_HVAC_SETPOINT_HEAT',
            'V_HVAC_FLOW_MODE',
            'V_TEXT',
            'V_CUSTOM',
            'V_POSITION',
            'V_IR_RECORD',
            'V_PH',
            'V_ORP',
            'V_EC',
            'V_VAR',
            'V_VA',
            'V_POWER_FACTOR',
        ]
        var labelInternal = [
            'I_BATTERY_LEVEL',
            'I_TIME',
            'I_VERSION',
            'I_ID_REQUEST',
            'I_ID_RESPONSE',
            'I_INCLUSION_MODE',
            'I_CONFIG',
            'I_FIND_PARENT',
            'I_FIND_PARENT_RESPONSE',
            'I_LOG_MESSAGE',
            'I_CHILDREN',
            'I_SKETCH_NAME',
            'I_SKETCH_VERSION',
            'I_REBOOT',
            'I_GATEWAY_READY',
            'I_SIGNING_PRESENTATION',
            'I_NONCE_REQUEST',
            'I_NONCE_RESPONSE',
            'I_HEARTBEAT_REQUEST',
            'I_PRESENTATION',
            'I_DISCOVER_REQUEST',
            'I_DISCOVER_RESPONSE',
            'I_HEARTBEAT_RESPONSE',
            'I_LOCKED',
            'I_PING',
            'I_PONG',
            'I_REGISTRATION_REQUEST',
            'I_REGISTRATION_RESPONSE',
            'I_DEBUG',
            'I_SIGNAL_REPORT_REQUEST',
            'I_SIGNAL_REPORT_REVERSE',
            'I_SIGNAL_REPORT_RESPONSE',
            'I_PRE_SLEEP_NOTIFICATION',
            'I_POST_SLEEP_NOTIFICATION',
        ]
        
        switch (messageType) {
            case 0:     // Presentation
                receivedMsg.nodeId=      mySensorsMessage.nodeId;
                receivedMsg.sensorId=    mySensorsMessage.childSensorId;
                receivedMsg.mode =       "Presentation";
                receivedMsg.type =       mySensorsMessage.subType;
                receivedMsg.typeLabel=   labelPresentation[mySensorsMessage.subType];
                receivedMsg.value=       mySensorsMessage.value;
                break;
            case 1:     // Set
                receivedMsg.nodeId=      mySensorsMessage.nodeId;
                receivedMsg.sensorId=    mySensorsMessage.childSensorId;
                receivedMsg.mode=        "Set";
                receivedMsg.type=        mySensorsMessage.subType;
                receivedMsg.typeLabel=   labelSet[mySensorsMessage.subType];
                receivedMsg.value=       mySensorsMessage.value;
                if(receivedMsg.sensorId == 254) {
                    receivedMsg.sensorId = 0;
                    receivedMsg.value = -(receivedMsg.value / 2).toFixed(0)
                }
                msg = `[${receivedMsg.nodeId}] ${receivedMsg.sensorId}:${receivedMsg.type}:${receivedMsg.value}`; 
                break;
            case 2:     // Req
                receivedMsg.nodeId=      mySensorsMessage.nodeId;
                receivedMsg.sensorId=    mySensorsMessage.childSensorId;
                receivedMsg.mode=        "Req";
                receivedMsg.type=        mySensorsMessage.subType;
                receivedMsg.typeLabel=   labelSet[mySensorsMessage.subType];
                receivedMsg.value=       mySensorsMessage.value;
                break;  
            case 3:     // Internal
                receivedMsg.nodeId=      mySensorsMessage.nodeId;
                receivedMsg.sensorId=    mySensorsMessage.childSensorId;
                receivedMsg.mode=        "Internal";
                receivedMsg.type=        mySensorsMessage.subType;
                receivedMsg.typeLabel=   labelInternal[mySensorsMessage.subType];
                receivedMsg.value=       mySensorsMessage.value;
                msg = `[${receivedMsg.nodeId}] _${receivedMsg.type}:${receivedMsg.value}`;
                break;    
            case 4:     // Stream - OTA firmware update
                receivedMsg.nodeId=      mySensorsMessage.nodeId;
                receivedMsg.mode=        "stream";
                break;
            default:
                break;
        }

        
    } else {
        msg = ""
    }  

    return msg;
}