
export default function applicationError(error: unknown){
    console.error(error);
    process.exit(1);
}