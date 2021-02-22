const ping = require('ping');
const ssh2 = require('ssh2');
const wol = require('wakeonlan');
const fs = require('fs');
const { get_config } = require('../tools/helpers');

const devices = require("../configs/devices-config.json");
const ssh_config = require("../configs/ssh-config.json");

computers = devices.computers.map(comp => {
    return {
        ip: comp.ip,
        mac: comp.mac,
        name: comp.name,
        ssh_port: comp.ssh_port,
        username: comp.username,
        on: () => turn_on(comp) ,
        off: () => turn_off(comp),
        get: () => get(comp),
        type: 'computer'
    }
});

const turn_on = (computer) => {

    return new Promise((res, rej) => {
        
        wol(computer.mac)
        .then(() => {
            res('Sending WOL package');
        })
        .catch((e) => {
            rej(e);
        });
        
    });
    
}

const turn_off = (computer) => {

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
                    host: computer.ip,
                    port: computer.ssh_port,
                    username: computer.username,
                    privateKey: fs.readFileSync(ssh_config.private_key_path)
                });
                
            }
            
        }).catch(e => { rej(e) });
        
    });

}

const get = (computer) => {

    return new Promise((res, rej) => {
            
        ping.sys.probe(computer.ip, (isAlive) => {
            res(isAlive);
        });
        
        setTimeout(() => { rej('Something stalled...') }, 5000);
        
    });

};

module.exports = {
    computers
}
