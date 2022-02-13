import WebSocket from 'ws';
import 'dotenv/config';
import fs from 'fs';
import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });
const ws = new WebSocket('wss://35.201.97.85/.ws?ns=roster-socialgamingfactory&v=5', {
  rejectUnauthorized: false,
  headers: {
    host: 'roster-socialgamingfactory.firebaseio.com'
  }
});

let resolvePromise = () => {};
const send = async payload => {
  return await new Promise(res => {
    resolvePromise = res;
    ws.send(payload);
  });
}

const refreshToken = async () => {
  const refreshToken = fs.readFileSync('refresh_token.txt', { encoding: 'utf8' });
  const resp = await fetch(`https://142.250.65.170/v1/token?key=${process.env.ROSTER_KEY}`, {
    method: 'POST',
    body: JSON.stringify({
      grantType: "refresh_token",
      refreshToken,
    }),
    headers: {
      host: 'securetoken.googleapis.com'
    },
    agent,
  });
  const data = await resp.json();
  fs.writeFileSync('refresh_token.txt', data.refresh_token);
  return data.access_token;
}

const getMsg = async () => {
  return await new Promise(res => resolvePromise = res);
}

ws.onopen = async () => {
  const token = await refreshToken();
  const profile = await send(`{"t":"d","d":{"a":"auth","r":1,"b":{"cred":"${token}"}}}`);
  console.log(profile);
  // await getMsg();
  // ws.send('{"t":"d","d":{"a":"n","r":40,"b":{"p":"meetings\\/id2806"}}}');
  const startLists = await send('{"t":"d","d":{"a":"q","r":2,"b":{"p":"startListsMk2\/id2806","h":""}}}');
  console.log(JSON.stringify(startLists, null, 1));
};

let msg;
let cnt;
let size;
ws.onmessage = e => {
  if (!isNaN(e.data)) {
    msg = ''; cnt = 1; size = e.data;
    return;
  }
  if (cnt) {
    msg += e.data; cnt++;
    if (cnt > size) {
      cnt = 0;
      resolvePromise(JSON.parse(msg));
    }
    return;
  }
  resolvePromise(JSON.parse(e.data));
};