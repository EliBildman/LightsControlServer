module.exports.rgb_to_rgb32 = (rgb) => {
    [red, green, blue] = rgb;
    return (red << 16) | (green) << 8 | blue;
}