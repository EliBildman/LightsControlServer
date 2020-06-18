const wol = require('wakeonlan');
const join = require('path').join;
const tpApi = require('tplink-smarthome-api');

const desktop_config = require(join(__dirname, '..', 'configs', 'desktop-config'));
const ac_config = require(join(__dirname, '..', 'configs', 'ac-config'));

let ac_plug;

const client = new tpApi.Client();
client.startDiscovery({macAddresses: [ac_config.mac], discoveryTimeout: 5000}).on('plug-new', (plug) => {
    ac_plug = plug;
    client.stopDiscovery();
});

// all toggleable devices should support 'on' 'off' and 'get'

const desktop = (action) => {

    if ( action == 'on' ) {
    
        return new Promise((res, rej) => {

            wol(desktop_config.mac)

            .then(() => {
                res('Sending WOL package');
            })

            .catch((e) => {
                rej(e);
            });

        });

    } else if ( action == 'off' ) {

        

    } else if ( action == 'get' ) {


        
    } else {
        return new Promise( (res, rej) => { rej('Bad Action') } );
    }

}

const ac = (action) => {

    if ( action == 'on' ) {

        return ac_plug.setPowerState(true);

    } else if ( action == 'off' ) {

        return ac_plug.setPowerState(false);

    } else if ( action == 'get' ) {

        return ac_plug.getPowerState();

    } else {
        return new Promise( (res, rej) => { rej('Bad Action') } );
    }

}

module.exports = {
    desktop,
    ac
}