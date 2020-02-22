const request = require('./request.js');
const getToken = require('./getToken.js');
const config = require('../config.json');

const ACTIVATE_DEVICE_URL = 'https://api.spotify.com/v1/me/player';
const SKIP_NEXT_URL = 'https://api.spotify.com/v1/me/player/next';
const SKIP_PREVIOUS_URL = 'https://api.spotify.com/v1/me/player/previous';
const PAUSE_URL = 'https://api.spotify.com/v1/me/player/pause';
const PLAY_URL = 'https://api.spotify.com/v1/me/player/play';
const VOLUME_URL = 'https://api.spotify.com/v1/me/player/volume';
const DEVICES_URL = 'https://api.spotify.com/v1/me/player/devices';

function listDevices(token) {
  return request.get(DEVICES_URL, token)
    .then(response => {
      let devices = JSON.parse(response).devices;
      console.log(`devices: ${devices}`);
      return devices;
  });
}

function findDevice(deviceName, devices) {
  if(typeof deviceName !== 'undefined' && deviceName) {
    for (const device of devices) {
      console.log(device.name, device.name.toLowerCase() === deviceName.toLowerCase());
      let keys = device.keys || [];
      if (device.name.toLowerCase() === deviceName.toLowerCase() || keys.includes(deviceName.toLowerCase())) {
        return device;
      }
    }
    console.info(`Could not find device named ${deviceName}`);
    // Todo: Store these devices somewhere
  }
  return undefined;
}

function activateDevice(token, device, play) {
  const body = JSON.stringify({ device_ids: [device.id], play: play });
  return request.put(ACTIVATE_DEVICE_URL, token, body);
}

function setVolumeTo(token, volume, device) {
  let query_params = `?volume_percent=${volume}`
  if(typeof device !== 'undefined' && device) {
    query_params += `&device_id=${device.id}`;
  }
  let url = VOLUME_URL + query_params;
  console.log(url);
  return request.put(url, token);
}

exports.skipNext = function skipNext() {
  console.log('Skipping one track forward');
  return getToken()
    .then(token => request.post(SKIP_NEXT_URL, token));
};

exports.skipPrevious = function skipPrevious() {
  console.log('Skipping one track backward');
  return getToken()
    .then(token => request.post(SKIP_PREVIOUS_URL, token));
};

exports.pause = function pause() {
  console.log('Pausing playback');
  return getToken()
    .then(token => request.put(PAUSE_URL, token));
};

exports.play = function play() {
  console.log('Initiating playback');
  return getToken()
    .then(token => request.put(PLAY_URL, token));
};

exports.playOnDevice = function playOnDevice(deviceName, play) {
  return getToken()
    .then(token => {
      return listDevices(token)
        .then(devices => {
          // Find correct device, default to first
          const device = findDevice(deviceName, devices) || findDevice(deviceName, config.DEVICES);
          if (!device) {
            return Promise.reject('No devices found');
          }

          console.log('Transferring playback to', device.name);
          if (play) {
            console.log(play);
            console.log('And initiating playback');
          }

          return activateDevice(token, device, play);
        });
    });
};

exports.setVolume = function setVolume(volume, deviceName) {
  console.log('Setting volume to', volume);
  return getToken()
    .then(token => {
      let future = new Promise((resolve, reject) => resolve(config.DEVICES));
      if(typeof deviceName !== 'undefined' && deviceName) {
        future = listDevices(token);
      }
      return future
        .then(devices => {
          let device = findDevice(deviceName, devices) || findDevice(deviceName, config.DEVICES);
          if(typeof device !== 'undefined' && device) {
          console.log('For device', device.name);
          }
          return setVolumeTo(token, volume, device);
        });
    });
};
