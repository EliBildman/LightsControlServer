
let config;

$.getJSON("/data/leds-config.json", (data) => { config = data; });

const manualDemo = () => {
    setAllLights([parseInt($('#r').val()), parseInt($('#g').val()), parseInt($('#b').val())]);
}

const cascadeDemo = () => {
    let color = [150, 0, 150];
    $.post({
        url: 'api/cascade',
        data: {color: color},
        success: console.log
    });
}

const setAllLights = (color) => {
    $.post({
        url: "api/set-all",
        data: {color: color},
        success: (msg) => {
            console.log(msg);
        }
    });
}

const turnOff = () => {
    $.post({
        url: "api/all-off",
        success: console.log
    });
}