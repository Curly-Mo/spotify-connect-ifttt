const player = require('./lib/player.js');

const [, , cmd, ...args] = process.argv;


switch(cmd.toLowerCase()) {
  case "device":
    player
      .playOnDevice(...args)
      .then(() => console.log('Playback started successfully'))
      .catch((err) => { console.error(err); });
    break;
  case "volume":
    player
      .setVolume(...args)
      .then(() => console.log('Volume changed successfully'))
      .catch((err) => { console.error(err); });
    break;
  case "adjust_volume":
    player
      .adjustVolume(...args)
      .then(() => console.log('Volume changed successfully'))
      .catch((err) => { console.error(err); });
    break;
  case "next":
    player
      .skipNext(...args)
      .then(() => console.log('Playback skipped successfully'))
      .catch((err) => { console.error(err); });
    break;
  case "prev":
    player
      .skipPrevious(...args)
      .then(() => console.log('Playback rewound successfully'))
      .catch((err) => { console.error(err); });
    break;
  case "pause":
    player
      .pause(...args)
      .then(() => console.log('Playback paused successfully'))
      .catch((err) => { console.error(err); });
    break;
  case "play":
    player
      .play(...args)
      .then(() => console.log('Playback started successfully'))
      .catch((err) => { console.error(err); });
    break;
  default:
    console.log("available commands: {device, volume, next, prev, pause, play}");
}
