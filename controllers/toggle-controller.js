const wol = require('wakeonlan');
const join = require('path').join;
const tpApi = require('tplink-smarthome-api');
const ping = require('ping');
const ssh2 = require('ssh2');
const fs = require('fs');

const devices = require("../configs/devices-config.json");
const ssh_config = require("../configs/ssh-config.json");

// let ac_plug;

// const client = new tpApi.Client();
// client.startDiscovery({macAddresses: [devices.ac.mac], discoveryTimeout: 5000}).on('plug-new', (plug) => {
//     ac_plug = plug;
//     client.stopDiscovery();
// });

// all toggleable devices should support only 'on' 'off' and 'get' and always returns a promise

const desktop = (action) => {

    if ( action == 'on' ) {
    
        return new Promise((res, rej) => {

            wol(devices.desktop.mac)
            .then(() => {
                res('Sending WOL package');
            })
            .catch((e) => {
                rej(e);
            });

        });

    } else if ( action == 'off' ) {

        let conn = new ssh2.Client();

        return new Promise((res, rej) => {

            desktop('get').then(status => {
                
                if(!status) res("Desktop already off");
                else {
                    conn.on('ready', () => {
                        conn.exec('shutdown /p', (err, stream) => { 
                            if(err) rej(err);
                            res("Sent Shutdown Command"); 
                        });
                    }).on('error', (e) => {
                        //lol nothing i love this hack
                    }).connect({
                        host: devices.desktop.ip,
                        port: devices.desktop.ssh_port,
                        username: devices.desktop.username,
                        privateKey: fs.readFileSync(ssh_config.private_key_path)
                    });

                }

            }).catch(e => { rej(e) });

        });

        

    } else if ( action == 'get' ) {

        return new Promise((res, rej) => {

            ping.sys.probe(devices.desktop.ip, (isAlive) => {
                res(isAlive);
            });

            setTimeout(() => { rej('Something stalled...') }, 5000);

        });
        
        
    } else {
        return new Promise( (res, rej) => { rej('Bad Action') } );
    }

}

// const ac = (action) => {

//     if ( action == 'on' ) {

//         return ac_plug.setPowerState(true);

//     } else if ( action == 'off' ) {

//         return ac_plug.setPowerState(false);

//     } else if ( action == 'get' ) {

//         return ac_plug.getPowerState();

//     } else {
//         return new Promise( (res, rej) => { rej('Bad Action') } );
//     }

// }

module.exports = {
    desktop,
    // ac
}