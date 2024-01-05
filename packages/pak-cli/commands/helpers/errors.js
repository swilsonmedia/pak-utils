export function handleStandardError(error) {
    if (error.cmd && error.stderr) {
        console.log(`pak command:\n"${error.cmd}"\n\nError:\n${error.stderr}`);
        return;
    }

    console.log(error);
}