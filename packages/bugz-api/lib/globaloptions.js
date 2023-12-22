let opts = {};

export default function globalOptions(options) {
    if (options) {
        Object.assign(opts, options);
    }

    return opts;
}