const index = require('./index.js');
const config = require('./config.json');

const [, , cmd, payload] = process.argv;

const parseJson = (str) => JSON.parse(str.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": '));

let body = {secret: config.SECRET};
let req = {
  body: {...parseJson(payload), ...body}
};

let res;
res = {
  send: (x) => {console.log("done", x); return res;},
  status: (code) => {console.log("status:", code); return res;}
};

let response = index[cmd](req, res);
console.log(response);
