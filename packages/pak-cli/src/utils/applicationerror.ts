import {logError} from "./logger.js";

export default function applicationError(error: unknown){
    logError(error);
    process.exit(1);
}