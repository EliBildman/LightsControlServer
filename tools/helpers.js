module.exports.rgb_to_rgb32 = (rgb) => {
    [red, green, blue] = rgb;
    return (red << 16) | (green) << 8 | blue;
};

const matches_fields = (sub, _super) => {
    for( f in sub ) {
        if(!_super[f] || _super[f] != sub[f]) return false;
    }
    return true;
};

module.exports.get_device = (info, devices) => {
    for( d of devices ) {
        if(matches_fields(info, d)) return d;
    }
};
