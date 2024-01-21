export default function makePost({token, origin}: {token: string, origin: string}): APIPost{
    return async function post(params){
        const response = await fetch(`${origin}/f/api/0/jsonapi`, {
            method: 'POST',
            body: JSON.stringify({
                ...params,
                token
            })
        });

        const responseJSON = await response.json();

        if(responseJSON.errorCode){
            throw new Error(responseJSON.errors[0]?.message);
        }

        return responseJSON;
    }
}