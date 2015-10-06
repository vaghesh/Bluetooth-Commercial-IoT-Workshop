var noble = require('noble');

var ServiceName = 'Led'
var Service_UUID = 'ed00';
var Characteristic_UUID = 'ed01';
var LedCharacteristic = null;
var LedValue = null;
var flag = true;


noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});


noble.on('discover', function(peripheral) {
    console.log("Peripheral Name is " +  peripheral.advertisement.localName)
    if(peripheral.advertisement.localName == ServiceName){
		noble.stopScanning();
        peripheral.connect(function(error) {
            if(error){
                console.log(error);
                return;
            } 
            peripheral.discoverServices([], function(error, services){
                console.log('Services Discovered');
                    for (var i =0, l = services.length; i < l; i++ ){
                        console.log('Entered Services')
                        var service = services[i];
                        if (Service_UUID == service.uuid) {
                            noble.stopScanning();
                            console.log("Specific Service Found");
                            handleService(service);
                        }
                    } 
                });
         });
    }    
});


function handleService(service){
    service.discoverCharacteristics([], function(error, characteristics) {
        characteristics.forEach(function(characteristic){
            console.log('Found Characteristic:', characteristic.uuid);
            for(var i = 0, l = characteristics.length; i < l; i++) {
                if (characteristics[i].uuid === Characteristic_UUID){
                    LedCharacteristic = characteristics[i];
                    setInterval(writeLed,10000);
                    break;	
                }
            }     
        });
    });
}

function writeLed(){
    if (flag == true){
        var value =  1
        var buffer;
        buffer = new Buffer(1);	
		buffer.writeUInt8(value, 0);
        LedCharacteristic.write(buffer,false)
        console.log ("LED ON")
        flag = false;
    }
    else {
        var value = 0
        var buffer;
        buffer = new Buffer(1);	
		buffer.writeUInt8(value,0);
        LedCharacteristic.write(buffer,false)
        console.log("LED OFF")
        flag = true;
    }
}


noble.on('disconnect', function() {
        console.log('Trying to reconnect');
        noble.startScanning();
});
