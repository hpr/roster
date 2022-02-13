import WebSocket from 'ws';
import 'dotenv/config';
import fs from 'fs';

const ws = new WebSocket('wss://35.201.97.85/.ws?ns=roster-socialgamingfactory&v=5', {
  rejectUnauthorized: false,
  headers: {
    host: 'roster-socialgamingfactory.firebaseio.com'
  }
});

ws.onopen = () => {
  ws.send(`{"t":"d","d":{"a":"auth","r":1,"b":{"cred":"${process.env.ROSTER_AUTH}"}}}`);
  // ws.send('{"t":"d","d":{"a":"n","r":40,"b":{"p":"meetings\\/id2806"}}}');
  ws.send('{"t":"d","d":{"a":"q","r":97,"b":{"p":"startListsMk2\/id2806","h":""}}}');
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
      console.log(msg);
      fs.writeFileSync('startListsMk2.json', msg);
    }
    return;
  }
  console.log(e.data);
};