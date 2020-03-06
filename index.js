const config = require('./config.json');
const player = require('./lib/player.js');

let devicesCache;

function isAuthenticated(req, res) {
  if (req.body.secret && req.body.secret === config.SECRET) {
    return true;
  }
  console.error('Authentication failed for client');
  res(403).send('Authentication failed for client');
  return false;
}

function handleRequest(handler, req, res) {
  // Ensure authentication
  if (!isAuthenticated(req, res)) return;

  handler()
    .then(response => res.send(response))
    .catch((body) => {
      console.error(body);
      res.end();
    });
}

function updateCache(newValue) {
  if(!devicesCache && newValue.length > 0) {
    devicesCache = newValue;
  }
}

function parsePayload(req, requiredArgs, optionalArgs = []) {
  let required = requiredArgs.reduce((agg, arg) => ({...agg, [arg]: req.body[arg]}), {});
  let optional = optionalArgs.reduce((agg, arg) => ({...agg, [arg]: req.body[arg]}), {});
  Object.entries(required).forEach(([name, value]) => {
    if(value == null || value === undefined || value === '') {
      throw new Error(`${name} is required. Invalid value for ${name}: ${value}`);
    }
  });
  return {...required, ...optional};
}

function playOnDevice(req) {
  console.log("initialCache: ", devicesCache);
  let args = parsePayload(req, ["device"], ["play"]);
  let playBoolean = (args.play == "true" || args.play == true);
  let response = player.playOnDevice(args.device, playBoolean, devicesCache);
  updateCache(response);
  return response;
}

function setVolume(req) {
  console.log("initialCache: ", devicesCache);
  let args = parsePayload(req, ["volume"], ["device"]);
  let response = player.setVolume(args.volume, args.device, devicesCache);
  updateCache(response);
  return response;
}

async function adjustVolume(req) {
  let args = parsePayload(req, ["volume", "device"]);
  let response = await player.adjustVolume(args.volume, args.device);
  updateCache(response);
  return response;
}

exports.skipNext = (req, res) => handleRequest(player.skipNext, req, res);
exports.skipPrevious = (req, res) => handleRequest(player.skipPrevious, req, res);
exports.pause = (req, res) => handleRequest(player.pause, req, res);
exports.play = (req, res) => handleRequest(player.play, req, res);
exports.playOnDevice = (req, res) => handleRequest(playOnDevice.bind(this, req), req, res);
exports.setVolume = (req, res) => handleRequest(setVolume.bind(this, req), req, res);
exports.adjustVolume = (req, res) => handleRequest(adjustVolume.bind(this, req), req, res);
