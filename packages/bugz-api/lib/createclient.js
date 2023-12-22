
import globalOptions from './globaloptions.js';
import * as api from './api/api.js';

export default function createClient({ token, origin }) {
    if (!token) {
        throw new TypeError('createClient requires a token option');
    }

    if (!origin) {
        throw new TypeError('createClient requires a origin option');
    }

    globalOptions({ token, origin });

    return {
        ...api
    }
}