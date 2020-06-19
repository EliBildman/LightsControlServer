const wol = require('wakeonlan');
const join = require('path').join;
const tpApi = require('tplink-smarthome-api');
const ping = require('ping');
const ssh2 = require('ssh2');
const fs = require('fs');

const desktop_config = require(join(__dirname, '..', 'configs', 'desktop-config'));
const ac_config = require(join(__dirname, '..', 'configs', 'ac-config'));
const ssh_config = require(join(__dirname, '..', 'configs', 'ssh-config'));

let ac_plug;

const client = new tpApi.Client();
client.startDiscovery({macAddresses: [ac_config.mac], discoveryTimeout: 5000}).on('plug-new', (plug) => {
    ac_plug = plug;
    client.stopDiscovery();
});

// all toggleable devices should support 'on' 'off' and 'get' and always returns a promise

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

        let conn = new ssh2.Client();

        return new Promise((res, rej) => {

            desktop('get').then(status => {
                if(!status) res("Desktop already off");
                else {

                    conn.on('ready', () => {
                        console.log('connceted');
                        conn.exec('shutdown /p', (err, stream) => { 
                            if(err) rej(err);
                            stream.on('close', (code, signal) => {
                                console.log('herer');
                                conn.end();
                            });
                            res("Sent Shutdown Command"); 
                        });
                    }).connect({
                        host: desktop_config.ip,
                        port: desktop_config.ssh_port,
                        username: desktop_config.user,
                        privateKey: fs.readFileSync(ssh_config.private_key_path)
                    });

                }

            }).catch(e => { rej(e) });

        });

        

    } else if ( action == 'get' ) {

        return new Promise((res, rej) => {

            ping.sys.probe(desktop_config.ip, (isAlive) => {
                res(isAlive);
            });

            setTimeout(() => { rej('Something stalled...') }, 5000);

        });
        
        
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