var bleno = require('bleno');
var util = require('util');
var groveSensor = require('jsupm_grove');
var led = new groveSensor.GroveLed(13);

var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;



util.inherits(LedWriteCharacteristic, BlenoCharacteristic);
util.inherits(LedService,BlenoPrimaryService);


console.log('Edge Device for LED - Peripheral'); 


bleno.on('stateChange', function(state) {
    if (state == 'poweredOn') {
        bleno.startAdvertising('Led', [], function(err) {
            if (err) {
                console.log(err);
            }
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
            new LedService()
        ]);
    }
});


function LedService(){
    LedService.super_.call(this, {
         uuid: 'ed00',
        characteristics: [
          new LedWriteCharacteristic()
        ]
    });
}

function LedWriteCharacteristic(){
    LedWriteCharacteristic.super_.call(this,{
        uuid: 'ed01',
        properties: ['write'],
        descriptors: [
            new BlenoDescriptor({
                uuid: 'ed02',
                value: 'LED Write'
            })
        ]
    });
}
            
LedWriteCharacteristic.prototype.onWriteRequest = function(data,offset,withoutResponse,callback){
    if (offset){
        callback(BlenoCharacteristic.RESULT_ATTR_NOT_LONG);
    }
    var value = data.readUInt8(0);
    callback(BlenoCharacteristic.RESULT_SUCCESS,data);
	LedBlink(value);
};

function LedBlink(value){
	if (value == 1){
		led.on();
	}
	else if (value == 0){
		led.off();
	}
	else{
		console.log ("LED command not found");
	}
	
}

