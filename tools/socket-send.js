const defaults = require('defaults');
const join = require('path').join;
const uid = require('uid');
const toRGB32 = require(join(__dirname, 'helpers')).rgb_to_rgb32;

const socket = (ws) => {

    let config = {};
    config.ws = ws;
    config.ready = false;

    //on getting config data
    ws.on('message', (msg) => {

        msg = JSON.parse(msg);

        if(msg.type === 'CONFIG') {

            console.log("NEW LIGHTS STRIP CONNECTED");

            config.ready = true;
            config.pipe = ws;
            config.length = msg.length;
            config.index = msg.index;

            //send confirmation
            ws.send("CONNECTED");

        }

    });

    //on end connection
    ws.on('close', (e) => {
        
        console.log('disconnect ' + e);
        
        // if(rsn.code  === 1000) { //normal

        //     console.log('NORMAL DISCONNECT');

        // } else { //abnormal

        //     console.log('ABNORMAL DISCONNECT, ATTEMPING RECONNECT');


        // }
    });

    config.send_state = (state) => {

        //should do some input checking here, it's bad if the arduino dies

        //colors: list of lists of length config.length
        //length: colors.length
        //mode: static / run / loop / bounce
        //id: uid

        state.id = uid();
        state.length = state.colors.length;
        state.colors = contruct_diff(state.colors);

        ws.send(JSON.stringify(state));

        console.log('sending state: ' + state.id);

        return new Promise((res, rej) => {
            const callback_listener = (msg) => {

                msg = JSON.parse(msg);

                if(msg.type === 'CALLBACK' && msg.id === state.id) {
                    ws.removeEventListener('message', callback_listener);
                    // console.log('callback');
                    res();
                }

                setTimeout(() => { 
                    rej("took too long");
                    ws.removeEventListener('message', callback_listener);
                }, config.length * 1000);

            };
            ws.on('message', callback_listener);
        });

    };

    return config;

};

const contruct_diff = (colors) => {

    let diff = [];

    for(let i = 0; i < colors.length; i++) {
        diff.push({});
        for(let j = 0; j < colors[i].length; j++) {
            if(colors[i][j] && (i == 0 || !colorEq(colors[i][j], colors[i - 1][j]))) {
                diff[i][`${j}`] = toRGB32(colors[i][j]);
            }
        }
    }

    return diff;

}

const colorEq = (a, b) => {
    for(i in a) if(a[i] != b[i]) return false;
    return true;
}


module.exports = {
    socket
};