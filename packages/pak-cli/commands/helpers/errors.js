export function handleStandardError(error) {
    if (error.cmd && error.stderr) {
        console.error(`pak command:\n"${error.cmd}"\n\nError:\n${error.stderr}`);
        return;
    }

    console.error(error);
}