const fs = require('fs');
const request = require('request');
const util = require('util');
const EventEmitter = require('events').EventEmitter;

const UPLOAD_URL = 'https://upload.diawi.com/';
const STATUS_URL = 'https://upload.diawi.com/status';
const POLL_MAX_COUNT = 10;
const POLL_INTERVAL = 2;
const DEBUG = false;

const sleep = (seconds) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, (seconds * 1000));
  });
};

const Diawi = function (opts) {
  if (!opts) {
    opts = {};
  }

  this.token = opts.token.trim();
  this.path = opts.path.trim();
  if (!fs.existsSync(this.path)) {
    throw (new Error('Could not find file at ' + this.path));
  }

  if (DEBUG) {
    console.log('Starting upload of \'' +
      this.path + '\' with token \'' + this.token.substring(0, 3) + '...\'');
  }

  // Create the required form fields
  this.formData = {
    token: this.token,
    file: fs.createReadStream(this.path),
  };

  // Append the optional parameters to the formData
  ['password', 'comment', 'callback_emails',
    'wall_of_apps', 'find_by_udid', 'installation_notifications']
    .forEach((key) => {
      if (opts[key]) {
        this.formData[key] = opts[key];
      }
    });
  if (DEBUG) {
    console.log(this.formData);
  }
};

Diawi.prototype.execute = function () {
  request.post({ url: UPLOAD_URL, formData: this.formData },
    this.onUploadComplete.bind(this));
};

Diawi.prototype.onUploadComplete = function (err, response, body) {
  if (err) {
    this.emit('error', new Error(err));
    return;
  }

  try {
    const json = JSON.parse(body);
    this.job = json.job;
    if (DEBUG) {
      console.log('Job found: ', this.job);
    }

    this.poll.bind(this)();
  } catch (err) {
    this.emit('error', new Error(err));
  }
};

Diawi.prototype.poll = function (pollCount) {
  if (pollCount > POLL_MAX_COUNT) {
    this.emit('error', new Error('Timed out polling for job completion'));
    return;
  }

  sleep(POLL_INTERVAL).then(function () {
    const url = STATUS_URL + '?job=' + this.job + '&token=' + this.token;
    request.get(url, function (err, response, body) {
      if (err) {
        this.emit('error', new Error(err));
        return;
      }

      try {
        const json = JSON.parse(body);

        switch (json.status) {
          case 2000:
            if (json.link) {
              this.emit('complete', json.link);
            } else {
              this.emit('error', new Error('Failed to get link from success response'));
            }

            return;

          case 2001:
            // Nothing, this just means poll again
            break;

          default:
            this.emit('error', new Error('Error in status response - ' + json.message));
            return;
        }
      } catch (err) {
        this.emit('error', new Error(err));
        return;
      }

      this.poll(pollCount + 1);
    }.bind(this));
  }.bind(this));
};

util.inherits(Diawi, EventEmitter);
module.exports = Diawi;