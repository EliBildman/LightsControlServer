
let config;

$.getJSON("/data/lights-config.json", (data) => { config = data; });


const lightOn = () => {
    $.post({
        url: "/api/light",
        data: {state: "on"},
        success: () => {
            console.log("turned on");
        }
    })
}

const lightOff = () => {
    $.post({
        url: "/api/light",
        data: {state: "off"},
        success: () => {
            console.log("turned on");
        }
    })
}

const setAllLights = (color) => {
    let colors = [];
    for(let i = 0; i < config.leds; i++) colors.push(color);
    $.post({
        url: "api/manual-set",
        data: {render: colors},
        success: (msg) => {
            console.log(msg);
        }
    });
}