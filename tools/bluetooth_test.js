const bleno = require('bleno');


const serviceId = "100";

bleno.on('stateChange', (state) => {
    if(state == 'poweredOn') {
        console.log('started');
        bleno.startAdvertising('fat boi', [serviceId]);

        bleno.setServices([
            new bleno.PrimaryService({
                uuid: serviceId,
                characteristics: [
    
                    new bleno.Characteristic({
                        value: null,
                        uuid: '2',
                        properties: ['read', 'write'],
                        onReadRequest: (offset, callback) => {
                            console.log(`char was read: ${this.value ? this.value.toString('utf-8') : ""}`);
                            // this.value = 10;
                            callback(bleno.Characteristic.RESULT_SUCCESS, new Buffer(this.value ? this.value.toString('utf-8') : ""));
                        },
                        onWriteRequest: (data, offset, withoutResponse, callback) => {
                            this.value = data;
                            console.log(`wrote ${data}`);
                            callback(bleno.Characteristic.RESULT_SUCCESS);
                        }
                    })
    
                ],
            })
        ], (err) => {if(err) console.log(err)});



    } else {
        console.log('stopped');
        bleno.stopAdvertising();
    }
});

bleno.on('accept', function(clientAddress) {
    console.log("Accepted connection from address: " + clientAddress);
});

bleno.on('disconnect', (clientAddress) => {
    console.log("Disconnected from " + clientAddress);
})

bleno.on('advertisingStart', (err) => {
    if(err) throw err;



})


//dc:a6:32:0a:12:cd