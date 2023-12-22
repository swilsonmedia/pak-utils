import bugzClient from 'bugz-api';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
    const client = bugzClient({
        token: `${process.env.FB_TOKEN}`,
        origin: `${process.env.FB_ORIGIN}`
    });

    const response = await client.cases.list();



    console.log(response);
})();
