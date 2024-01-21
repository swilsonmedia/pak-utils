
interface CMD{
    cmd: string
}

type APIPost = <T extends CMD>(params: T) => Promise<any>;