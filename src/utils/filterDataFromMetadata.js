export const getFormatData = (format) => {
    const { tagTypes, codec, sampleRate, bitrate, duration } = format;
    return { tagTypes, codec, sampleRate, bitrate, duration };
};

export const getCommonData = (common) => {
    const { title, artists, artist, album, year } = common;
    return { title, artists, artist, album, year };
};