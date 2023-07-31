import https from 'https';
import { ClientCredentials, AccessToken } from 'simple-oauth2';

const host = 'https://devmtx.myhost.meditech.com:8443';
// const api = '/v1/unv-config?skipCache=true';
const api = '/v2/mis-person/6c4db6ab-d032-5528-8f2f-9385ca1c089f?skipCache=true'
const scope = 'general unv-config/read user-identity mis-dictionaries mis-dictionaries-ro';

let accessToken: AccessToken;

const config = {
    client: {
      id: 'testClient',
      secret: 'testSecret'
    },
    auth: {
      tokenHost: host+'/oauth/token'
    }
  };

async function get( requestNum: number){

    console.log('starting reqquest ' + requestNum);
    const start = new Date().getTime();

    https.get(host+api, 
        {
            rejectUnauthorized:false,
            headers:{ 
                Authorization: 'Bearer '+ accessToken.token.access_token
            }
        },
        (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
        const requestId = res.headers['mtrestapi-requestid'];
   
        let error;
        // Any 2xx status code signals a successful response but
        // here we're only checking for 200.
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        } else if (contentType && !/^application\/json/.test(contentType)) {
          error = new Error('Invalid content-type.\n' +
                            `Expected application/json but received ${contentType}`);
        }
        if (error) {
          console.error(error.message);
          // Consume response data to free up memory
          res.resume();
          return;
        }
      
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            // console.log(parsedData);

            const elapsed = new Date().getTime() - start;
            console.log( 'elapsed time for req ' + requestNum + ' was ' + elapsed + ' ' + requestId);
          } catch (e: any) {
            console.error(e.message);
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
      });
      
}


async function run() {
    const client = new ClientCredentials(config);
  
    const tokenParams = {
      scope
    };
  
    try {
      accessToken = await client.getToken(tokenParams,{rejectUnauthorized: false});
    } catch (error: any) {
      console.log('Access Token error', error.message);
    }

    for( let i = 0; i < 10; ++i ){
        get(i);
    }
}
run();