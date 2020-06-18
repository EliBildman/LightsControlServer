
let config;

$.getJSON("/data/leds-config.json", (data) => { config = data; });

const manualDemo = () => {
    setAllLights([parseInt($('#r').val()), parseInt($('#g').val()), parseInt($('#b').val())]);
}

const cascadeDemo = () => {
    let color = [parseInt($('#aniR').val()), parseInt($('#aniG').val()), parseInt($('#aniB').val())]
    $.post({
        url: 'api/lights/cascade',
        data: {color: color},
        success: console.log
    });
}

const rippleDemo = () => {
    let color = [parseInt($('#aniR').val()), parseInt($('#aniG').val()), parseInt($('#aniB').val())]
    $.post({
        url: 'api/lights/random-ripple',
        data: {color: color},
        success: console.log
    });
}

const pingPongDemo = () => {
    let color = [parseInt($('#aniR').val()), parseInt($('#aniG').val()), parseInt($('#aniB').val())]
    $.post({
        url: 'api/lights/ping-pong',
        data: {color: color},
        success: console.log
    });
}

const setAllLights = (color) => {
    $.post({
        url: "api/lights/set-all",
        data: {color: color},
        success: (msg) => {
            console.log(msg);
        }
    });
}

const turnOff = () => {
    $.post({
        url: "api/lights/all-off",
        success: console.log
    });
}


const sendWake = () => {
    $.post({
        url: '/api/toggle/desktop',
        data: {action: "on"},
        success: (msg) => {
            console.log(msg);
        }
    });
}

const ac = () => {
    $.post({
        url: '/api/toggle/ac',
        data: {action: "off"},
        success: (msg) => {
            console.log(msg);
        }
    });
}