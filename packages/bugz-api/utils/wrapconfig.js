export default function applyConfig(fn, config) {
    return async (...args) => {
        return await fn.apply(null, [...args, config]);
    }
};