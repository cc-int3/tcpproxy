import https from 'https';
import { ClientCredentials, AccessToken } from 'simple-oauth2';
import { localConfig } from './config';
import { remoteConfig } from './remoteConfig';

// const api = '/v1/unv-config?skipCache=true';
//const api = '/v2/mis-person/6c4db6ab-d032-5528-8f2f-9385ca1c089f?skipCache=true'
//const scope = 'general unv-config/read user-identity mis-dictionaries mis-dictionaries-ro';

const api = '/v2/bundle?skipCache=true';
const scope = 'general unv-config/read user-identity mis-dictionaries mis-dictionaries-ro performance-testing';

let accessToken: AccessToken;

const bundle = 
{
  resource: "v1/resource/bundle/_version/2/",
  type: "batch",
  strategy: { 
    batch: { 
      executionPlan: "parallel" }
    },
    limit: 10,
  entry : [] as any[]
}

async function post( host: string, requestNum: number){

  const url = new URL(host);
  console.log(url.hostname);
  const options = {
    hostname: url.hostname,
    port: 443,
    path: api,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer '+ accessToken.token.access_token
    }
  }
  console.log('starting request ' + requestNum);
  const start = new Date().getTime();

  const req = https.request(options, (res) => {
    
    const { statusCode } = res;
    const contentType = res.headers['content-type'];
    const requestId = res.headers['mtrestapi-requestid'];
    res.on('data', (d) => {
      // console.log(d);
    });


    res.on('end', () => {
      try {
        const elapsed = new Date().getTime() - start;
        console.log( 'elapsed time for req ' + requestNum + ' was ' + elapsed + ' ' + requestId);
      } catch (e: any) {
        console.error(e.message);
      }
    });

    res.on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.write(JSON.stringify(bundle));
  req.end();
};

async function get( host: string, requestNum: number){

    console.log('starting request ' + requestNum);
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
    const configTemplate = remoteConfig;
    const config = {
      client: configTemplate.client,
      auth: {
        tokenHost : configTemplate.host + configTemplate.auth.tokenEndpoint
      }
    }
    console.log(JSON.stringify(config));
    const client = new ClientCredentials(config);
  
    const tokenParams = {
      scope
    };
  
    try {
      accessToken = await client.getToken(tokenParams,{rejectUnauthorized: false});
    } catch (error: any) {
      console.log('Access Token error', error.message);
    }


    //for( let i = 0; i < 10; ++i ){
    //    get(configTemplate.host,i);
    //}
    const entry = {
      "request": {
        "method": "GET",
        "url": "/v1/performance-testing-empty?skipCache=true"
      }
    }
    for( let i =0; i < 1480; ++i){
      bundle.entry.push(entry);
    }
    console.log( 'num entries ' + bundle.entry.length );
    post(configTemplate.host,1);
}
run();