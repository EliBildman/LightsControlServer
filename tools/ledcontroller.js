const fs = require('fs');
const join = require('path').join;
const leds = require('rpi-ws281x');
const defaults = require('defaults');

const led_config = JSON.parse(fs.readFileSync(join(__dirname, '..', 'public', 'data', 'leds-config.json')));
leds.configure(led_config);


//TODO: Make the config dynamic for multiple strips and put in deffinition obj


const state = {
    baseColor: [0, 0, 0],
    brightness: 0,
    routine: null,
    remove: null
}

const randint = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}

const randchoice = (itt) => {
    return itt[randint(0, itt.length)];
}

const RGBtoRGB32 = (rgb) => {
    [red, green, blue] = rgb;
    return (red << 16) | (green) << 8 | blue;
}

const combineColors = (a, b) => {
    let comb = [];
    for(i in a) {
        comb.push((a[i] + b[i]) / 2);
    }
    return comb;
}

//must be {color: [r, g, b], weight: num}

const combineColorsWeighted = (colorWeights) => {

    let sum = colorWeights.reduce((acc, curr) => acc + curr.weight, 0);

    let comb = [0, 0, 0];

    for(i in comb) comb[i] = (colorWeights.reduce((acc, curr) => {
        return acc + curr.color[i] * (curr.weight / sum);
    }, 0));

    return comb;

}


const setAllLeds = (color) => {
    return new Promise((res, rej) => {

        let conv = RGBtoRGB32(color);
        let pixels = new Uint32Array(led_config.leds);

        for(i in pixels) {
            pixels[i] = conv;
        }

        leds.render(pixels);

        res();
    })

}

const setLedsRGB32 = (colors) => {
    return new Promise((res, rej) => {
        leds.render(colors);
        res();
    });
}

const setLeds = (colors) => {

    if(colors.length != led_config.leds) throw `Length of colors must be ${led_config.leds}, is ${colors.length}`;

    return new Promise((res, rej) => {
        let pixels = new Uint32Array(led_config.leds);
        
        for(i in pixels) {
            pixels[i] = RGBtoRGB32(colors[i]);
        }

        leds.render(pixels);
        res();

    });
}

const cascadeLeds = (speed, color) => {
    clearInterval(state.routine);
    let currLed = 0;
    let numLeds = led_config.leds;
    let off32 = RGBtoRGB32([0, 0, 0]);
    let color32 = RGBtoRGB32(color);
    return new Promise((res, rej) => {
        state.routine = setInterval(() => {

            let pixels = new Uint32Array(led_config.leds);
            for(let i = 0; i < led_config.leds; i++) {
                if(i <= currLed) pixels[i] = color32;
                else pixels[i] = off32;
            }

            leds.render(pixels);

            currLed += 1;

            if(currLed >= numLeds) {
                clearInterval(state.routine);
                res();
            }
        }, 1000/speed);
    });
}


class Wave {

    /**
     * creates a Wave object
     * @param {object} settings { refreshRate, location, dir, radius/size, color, speed, edgeTaper }
     */
    constructor(settings) {
        //setting default values (might revisit this)
        if (!settings.refreshRate)
            throw "i need the refresh rate man come on";
        
        if (!settings.dir) {
            if (!settings.location)
                this.dir = 1;
            else {
                if (settings.location > led_config.leds / 2)
                    this.dir = -1;
                else
                    this.dir = 1;
            }
        } else
            this.dir = settings.dir;

        if (!settings.location) {
            if (!settings.dir)
                this.location = 0;
            else {
                if (settings.dir == 1)
                    this.location = 0;
                else
                    this.location = led_config.leds;
            }
        }
        else
            this.location = settings.location;

        if (!settings.radius) {
            if (settings.size)
                this.radius = settings.size / 2;
            else
                this.radius = 5;
        }

        if (!settings.color)
            this.color = [150, 150, 150];
        else
            this.color = settings.color;

        if (!settings.speed)
            this.speed = 10;
        else
            this.speed = settings.speed;

        if (!settings.edgeTaper)
            this.edgeTaper = 0;
        else
            this.edgeTaper = settings.edgeTaper;

        
        this.size = this.radius * 2


        this.move = () => {
            // console.log(this.speed);
            this.location += this.speed / settings.refreshRate * this.dir;
        };

        this.outOfBounds = () => {
            return this.location - this.radius > led_config.leds || this.location + this.radius < 0;
        },

        this.colorWeightAt = (i) => {
            if (!this.covers(i))
                return 0;
            else
                return 1 - (Math.abs(this.location - i) / this.radius * this.edgeTaper);
        },

        this.covers = (i) => {
            // console.log(i, this.location, this.radius, i > this.location - this.radius && i < this.location + this.radius)
            return i > this.location - this.radius && i < this.location + this.radius;
        };

        /**
         * pastes this wave onto a render list, averages in stored value based on colorWeightAt()
         * @param {Array<Array<number>} colors Render List
         */
        this.applyTo = (colors) => {

            for(let i = this.location - this.radius; i < this.location + this.radius; i++) {
                i = Math.floor(i);
                if( i >= 0 && i < colors.length) {
                    let w = this.colorWeightAt(i);
                    
                    colors[i] = combineColorsWeighted([{color: this.color, weight: w}, {color: colors[i], weight: 1 - w}]);
                }
            }
        }
    }
}


const randomRipple = (settings) => {

    settings = defaults(settings, {
        creationSpeed: 0.2,
        speedRange: {min: 5, max: 10},
        sizeRange: {min: 25, max: 40},
        auxColors: [[200, 100, 0], [0, 200, 200], [100, 0, 100], [0, 200, 50]],
        refreshRate: 30,
    });

    let waves = [];

    let createWave = setInterval(() => {

        let size = randint(settings.sizeRange.min, settings.sizeRange.max);

        let waveSettings = {
            size: size,
            speed: randint(settings.speedRange.min, settings.speedRange.max),
            color: randchoice(settings.auxColors),
            location: randchoice([-1 * size / 2, led_config.leds + size / 2]),
            refreshRate: settings.refreshRate,
            edgeTaper: 1
        }

        waves.push(new Wave(waveSettings));

    }, 1000 / settings.creationSpeed);


    let render = () => {

        let colors = [];

        for(let i = 0; i < led_config.leds; i++) {
            let weights = [];
            for(wave of waves) {
                if(wave.covers(i)) {
                    weights.push({color: wave.color, weight: wave.colorWeightAt(i)});
                }
            }
            weights.push({color: baseColor, weight: 1}); //not sure ab how to make the center the true color
            colors.push(combineColorsWeighted(weights));
        }

        return colors;

    }

    console.log('SET STATE: RANDOM_RIPPLE');
    clearState();
    state.baseColor = settings.baseColor;
    state.routine = setInterval(() => {

        let colors = render();

        for(wave of waves) {
            wave.move();
            if(wave.outOfBounds()) {
                waves.splice(waves.indexOf(wave), 1);
            }
        }

        setLeds(colors);

    }, 1000 / settings.refreshRate);

}

/**
 * Creates ping-ponging waves
 * @param {settings} { baseColor, auxColors, numPings, pingSize, pingSpeed, pingSpacing, refreshRate, alternateDir } 
 */
const pingPong = (settings) => {

    if(!settings) settings = {};
    
    settings = defaults(settings, {
        baseColor: [255, 255, 255],
        auxColors: [[0, 0, 255]],
        numPings: 1,
        pingSize: 10,
        pingSpeed: 40,
        pingSpacing: 20,
        refreshRate: 30,
        alternateDir: false
    });

    // if(settings.auxColors.length != settings.numPings) throw `why is numPings ${settings.numPings} but auxColors ${settings.auxColors.length} long`;

    let pings = [];

    for(let i = 0; i < settings.numPings; i++) {

        let refreshRate = settings.refreshRate;
        let size = settings.pingSize;

        let location;
        let dir;
        
        if(settings.alternateDir) {
            location = (i % 2 == 0) ? (size / 2) : (led_config.leds - 1 - size / 2);
            dir = (i % 2 == 0) ? (1) : (-1);
        } else {
            location = 0;
            dir = 1;
        }

        let color = settings.auxColors[i % settings.auxColors.length];
        let speed = settings.pingSpeed;

        location += ((-dir * settings.pingSpacing * i) + settings.pingSize / 2) / (settings.alternateDir ? 2 : 1); // do the initial offset, puts them all out of bounds (assuming they started on the ends)

        pings.push(new Wave({
            refreshRate,
            size,
            location,
            dir,
            color,
            speed,
        }));

    }

    let render = () => {
        
        let colors = [];

        for(let i = 0; i < led_config.leds; i++) {
            colors.push(settings.baseColor);
        }
        
        for(ping of pings) {
            ping.applyTo(colors);
        }

        setLeds(colors);

    }

    console.log('SET STATE: PING_PONG');
    clearState();
    state.baseColor = settings.baseColor;

    state.routine = setInterval(() => {

        for(ping of pings) {

            ping.move();


            if(ping.dir == 1) {
                if(ping.location >= led_config.leds - ping.radius) ping.dir = -1;
            } else {
                if(ping.location <= ping.radius) ping.dir = 1;
            }

        }

        render();

    }, 1000 / settings.refreshRate);

}

const clearState = () => {
    if(state.routine) clearInterval(state.routine);
    if(state.remove) state.remove();
}

module.exports = {
    anis: {
        cascadeLeds,
        setAllLeds
    },
    states: {
        pingPong,
        randomRipple
    }
}
