var bleno = require('bleno');
var util = require('util');
var groveSensor = require('jsupm_grove');


var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;


util.inherits(TemperatureReadCharacteristic, BlenoCharacteristic);
util.inherits(TemperatureService,BlenoPrimaryService);


var temp = new groveSensor.GroveTemp(0);
var temperatureValue = null;


console.log('Edge Device for Temperature - Peripheral'); 


bleno.on('stateChange', function(state) {
    if (state == 'poweredOn') {
        bleno.startAdvertising('temperature', [], function(err) {
            if (err) {
                console.log(err);
            }
            setInterval(checkTemperature, 100);
        });
    }
    else {
        bleno.stopAdvertising();
    }
});

bleno.on('advertisingStart', function(err) {
    if (!err) {
        console.log('Advertising...');
        bleno.setServices([
            new TemperatureService()
        ]);
    }
});


function TemperatureService(){
    TemperatureService.super_.call(this, {
         uuid: 'ec00',
        characteristics: [
          new TemperatureReadCharacteristic()
        ]
    });
}

function TemperatureReadCharacteristic(){
    TemperatureReadCharacteristic.super_.call(this,{
        uuid: 'ec01',
        properties: ['read'],
        descriptors: [
            new BlenoDescriptor({
                uuid: 'ec02',
                value: 'Temperature Read'
            })
        ]
    });
}
            
TemperatureReadCharacteristic.prototype.onReadRequest = function(offset,callback){
    if (offset){
        callback(BlenoCharacteristic.RESULT_ATTR_NOT_LONG, null);
    }
    else{
        if (null != temperatureValue){
            var buffer = new Buffer(1);
            buffer.writeUInt8(temperatureValue,0);
            callback(BlenoCharacteristic.RESULT_SUCCESS, buffer);
        }
    }
};


function checkTemperature(){
    temperatureValue = temp.value(); // Temp in Celcius
}
