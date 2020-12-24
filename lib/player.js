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
const INFO_URL = 'https://api.spotify.com/v1/me/player';

async function listDevices(token) {
  const response = await request.get(DEVICES_URL, token);
  let devices = JSON.parse(response).devices;
  console.log("list devices:", devices);
  return devices;
}

async function getInfo(token) {
  const response = await request.get(INFO_URL, token);
  let info = JSON.parse(response);
  // console.log("player info", info);
  return info;
}

function findDevice(deviceName, devices) {
  if(deviceName != null && deviceName) {
    for (const device of devices) {
      console.log(device.name, device.name.toLowerCase() === deviceName.toLowerCase());
      let keys = device.keys || [];
      if (device.name.toLowerCase() === deviceName.toLowerCase() || keys.includes(deviceName.toLowerCase())) {
        return device;
      }
    }
    console.info(`Could not find device named ${deviceName}`);
  }
  return undefined;
}

function findActiveDevice(devices) {
  for (const device of devices) {
    if (device.is_active) {
      return device;
    }
  }
  console.info(`No active device /shrug`);
}

function activateDevice(token, device, play) {
  const body = JSON.stringify({ device_ids: [device.id], play: play });
  return request.put(ACTIVATE_DEVICE_URL, token, body);
}

function setVolumeTo(token, volume, device) {
  let query_params = `?volume_percent=${volume}`
  if(device != null && device) {
    query_params += `&device_id=${device.id}`;
  }
  let url = VOLUME_URL + query_params;
  console.log(url);
  return request.put(url, token);
}

exports.skipNext = async function skipNext() {
  console.log('Skipping one track forward');
  const token = await getToken();
  return await request.post(SKIP_NEXT_URL, token);
};

exports.skipPrevious = async function skipPrevious() {
  console.log('Skipping one track backward');
  const token = await getToken();
  return await request.post(SKIP_PREVIOUS_URL, token);
};

exports.pause = async function pause() {
  console.log('Pausing playback');
  const token = await getToken();
  return await request.put(PAUSE_URL, token);
};

exports.play = async function play() {
  console.log('Initiating playback');
  const token = await getToken();
  return await request.put(PLAY_URL, token);
};

exports.playToggle = async function playToggle() {
  console.log('Playback toggle');
  const token = await getToken();
  const info = await getInfo(token);
  const isPlaying = info.is_playing;
  console.log("isPlaying: ", isPlaying);
  if (isPlaying) {
    return await request.put(PAUSE_URL, token);
  } else {
    return await request.put(PLAY_URL, token);
  }
};

exports.playOnDevice = async function playOnDevice(deviceName, play = null, devices = null) {
  const token = await getToken();
  devices = devices || await listDevices(token);
  // Find correct device, default to first
  const device = findDevice(deviceName, devices) || findDevice(deviceName, config.DEVICES);
  if (!device) {
    return Promise.reject('No devices found');
  }
  console.log('Transferring playback to', device.name);
  if (play) {
    console.log('And initiating playback');
  }
  let response = activateDevice(token, device, play);
  console.log(response);
  return devices;
};

exports.setVolume = async function setVolume(volume, deviceName = null, devices = null) {
  console.log('Setting volume to', volume);
  const token = await getToken();
  let devicesFuture = new Promise((resolve) => resolve(config.DEVICES));
  if (deviceName != null && deviceName) {
    devicesFuture = listDevices(token);
  }
  devices = devices || await devicesFuture;
  let device = findDevice(deviceName, devices) || findDevice(deviceName, config.DEVICES);
  if (device != null && device) {
    console.log('For device', device.name);
  }
  let response = setVolumeTo(token, volume, device);
  console.log(response);
  return devices;
};

exports.adjustVolume = async function adjustVolume(volumeChange, deviceName = null) {
  console.log('Changing volume by', volumeChange);
  const token = await getToken();
  let devices = await listDevices(token);
  console.log("devices: ", devices);
  let device = findDevice(deviceName, devices) || findDevice(deviceName, config.DEVICES) || findActiveDevice(devices);
  let newVolume = Math.round(Number.parseFloat(device.volume_percent) + Number.parseFloat(volumeChange));
  if(newVolume > 100) {
    newVolume = 100;
  }
  if(newVolume < 0) {
    newVolume = 0;
  }
  console.log('Setting new volume', newVolume, 'for device', device.name);
  let response = await setVolumeTo(token, newVolume, device);
  console.log(response);
  return devices;
};

exports.playerInfo = async function playerInfo() {
  console.log('Playback toggle');
  const token = await getToken();
  const info = getInfo(token);
  return info;
};
