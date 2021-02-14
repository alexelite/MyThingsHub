// *******************************************************************************
// This is the logging storage engine for the Moteino IoT Gateway.
// It is a vast improvement over storing data in memory (previously done in neDB)
// http://lowpowerlab.com/gateway
// Some of this work was inspired by work done by Timestore and OpenEnergyMonitor:
//          - http://www.mike-stirling.com/redmine/projects/timestore
//          - https://github.com/openenergymonitor/documentation/blob/master/BuildingBlocks/TimeSeries/variableinterval.md
// *******************************************************************************
// Data is stored in binary files, each record is 9 bytes:
//     - 1 reserved byte
//     - 4 datetime bytes (1 second resolution unix epoch timestamps)
//     - 4 bytes value with up to 4 decimals resolution (given value is multiplied by 10K going in, and divided by 10K coming out)
//     NOTE: data with greater resolution than specified above will be truncated
//     NOTE: timestamps are whole integers, in seconds, so javascript timestamps have to be divided by 1000 before being passed in
// *******************************************************************************
var fs = require('fs');
var path = require('path');
var metrics = require(path.resolve(__dirname, 'metrics/core.js'));
var tc = require("timezonecomplete");
const timezone = "Europe/Bucharest";
const db = tc.TzDatabase.instance();

exports.getLogName = function (nodeId, sensorId, metricId) {
  if (metrics.isNumeric(nodeId))
    nodeId = ('0000' + nodeId).slice(-4);
  if (metrics.isNumeric(sensorId))
    sensorId = ('0000' + sensorId).slice(-4);

  return nodeId + '_' + sensorId + '_' + metricId + '.bin'; //left pad log names with zeros
}

exports.getData = function (filename, start, end, dpcount) {
  dpcount = dpcount || 1500;
  if (dpcount < 1) dpcount = 1;
  if (dpcount < 1 || start > end) return {};

  var ts = new Date();
  data = [];

  filesize = exports.fileSize(filename);
  if (filesize == -1) return { data: data, queryTime: 0, msg: 'no log data' };
  fd = fs.openSync(filename, 'r');

  //truncate start/end to log time limits if necessary - this ensures good data resolution when time limits are out of bounds
  var buff = Buffer.alloc(9);
  fs.readSync(fd, buff, 0, 9, 0);
  var firstLogTimestamp = buff.readUInt32BE(1);
  fs.readSync(fd, buff, 0, 9, filesize - 9);
  var lastLogTimestamp = buff.readUInt32BE(1); //read timestamp (bytes 0-3 in buffer)
  if (start < firstLogTimestamp) start = firstLogTimestamp;
  if (end > lastLogTimestamp) end = lastLogTimestamp;

  //console.info('getData() [start,end] = ' + start + ', ' + end);

  interval = (end - start) / dpcount;

  // Ensure that interval request is less than 1, adjust number of datapoints to request if interval = 1
  if (interval < 1) {
    interval = 1;
    dpcount = (end - start) / interval;
  }

  timetmp = 0;
  deleted = 0;

  //first check if sequential reads (much faster) make sense
  posStart = exports.binarySearch(fd, start - interval, filesize);
  posEnd = exports.binarySearch(fd, end + interval, filesize);
  if (posStart < posEnd && (posEnd - posStart) / 9 < dpcount * 1.1) {
    //console.info('getData() reading ' + ((posEnd-posStart)/9) + ' sequential points!');
    for (var i = posStart; i <= posEnd; i += 9) {
      fs.readSync(fd, buff, 0, 9, i);
      timetmp = buff.readUInt32BE(1);
      if (buff.readUInt8(0) !== 0) { deleted++; continue; } //skip deleted data
      if (!(timetmp >= start && timetmp <= end)) continue;
      value = buff.readInt32BE(5);
      data.push({ t: timetmp * 1000, v: value / 10000 });
    }
    return {
      data: data,
      queryTime: (new Date() - ts),
      totalIntervalDatapoints: (posEnd - posStart) / 9 + 1,
      totalDatapoints: filesize / 9,
      logSize: filesize
    };
  }

  //too many data points, use binarySearch to aggregate
  for (var i = 0; i < dpcount; i++) {
    pos = exports.binarySearch(fd, start + (i * interval), filesize);
    last_time = timetmp;
    fs.readSync(fd, buff, 0, 9, pos);
    timetmp = buff.readUInt32BE(1);
    if (buff.readUInt8(0) !== 0) { deleted++; continue; } //skip deleted data
    if (!(timetmp >= start && timetmp <= end)) continue;
    value = buff.readInt32BE(5);

    if ((timetmp != last_time && timetmp > last_time) || last_time == 0) {
      var item = { t: timetmp * 1000, v: value / 10000 };
      data.push(item);
    }
    if (pos == filesize - 9) break;
  }
  fs.closeSync(fd);

  return {
    data: data,
    queryTime: (new Date() - ts),
    totalIntervalDatapoints: (posEnd - posStart) / 9 + 1 - deleted,
    totalDatapoints: filesize / 9 - deleted,
    logSize: filesize
  };
}

// read data sequentially at the begining and ending of each day in the interval requested
// data is stored using utc timestamps in seconds
// function uses  timezonecomplete lib to align data to proper day start-day end, based on time zone
// for days when daylight saving time changes state data is averaged 
//
// filename:  binary file to append new data point to
// start:  (seconds since unix epoch)
// end:     (seconds since unix epoch)
exports.getStatistic = function (filename, start, end) {
  if (start > end) return {};
  var ts = new Date();
  var days = []; ticks = [];
  var index = 0;
  var initialValue, endValue, dayDst, offset, dayMark;
  filesize = exports.fileSize(filename);
  if (filesize == -1) return { data: data, queryTime: 0, msg: 'no log data' };
  fd = fs.openSync(filename, 'r');
  //truncate start/end to log time limits if necessary - this ensures good data resolution when time limits are out of bounds
  var buff = Buffer.alloc(9);
  fs.readSync(fd, buff, 0, 9, 0);
  var firstLogTimestamp = buff.readUInt32BE(1) * 1000;
  var firstValue = buff.readUInt32BE(5);
  fs.readSync(fd, buff, 0, 9, filesize - 9);
  var lastLogTimestamp = buff.readUInt32BE(1) * 1000;
  var lastValue = buff.readUInt32BE(5);
  starttimetmp = 0;
  endtimetmp = 0;
  var temptime;
  start_ts = start * 1000;
  end_ts = end * 1000;
  data = [];
  //lt - local timestamp
  do {
    if ((dayDst === undefined) || dayDst < start_ts) {
      //set the next daylight saving changing day, not time
      dayDst = db.nextDstChange(timezone, start_ts);

      //align day start to time zone's current offset, otherwise data will not be properly alligned
      offset = new tc.DateTime(start_ts, tc.utc()).convert(tc.zone(timezone)).offsetDuration().milliseconds();
      dayDst = dayDst - ((dayDst + offset) % 86400000);

      //try to capture a full day, but if log is short get what we have
      tempTime = (start_ts - ((start_ts + offset) % 86400000))
      if (tempTime < firstLogTimestamp) start_ts = firstLogTimestamp;
      else start_ts = tempTime;
      //try to capture a full day, but if log is short get what we have
      tempTime = (end_ts - ((end_ts + offset) % 86400000))
      if (tempTime > lastLogTimestamp) end_ts = lastLogTimestamp;
      else end_ts = tempTime + 86400000;

      if (dayMark === undefined) {
        //set the first day start after start timespamp, start is not always the start of a new day
        dayMark = start_ts + 86400000;
        dayMark = dayMark - ((dayMark + offset) % 86400000);
      }
    }
    //interval does not pass a dayMark, ex: current day
    if (!(start_ts < dayMark && dayMark < end_ts)) {
      if (initialValue !== undefined) {
        initialValue = endValue;
      }
      else {
        //initialValue = new tc.DateTime(start_ts, tc.utc()).convert(tc.zone(timezone));//start_ts//getdatafromlog(start_ts);
        initialValue = exports.searchData(fd, filesize, start_ts / 1000, true);
      }
      endValue = exports.searchData(fd, filesize, end_ts / 1000, false);
      result = endValue - initialValue;
      dateLabel = new tc.DateTime(end_ts - 86400000 / 2, tc.utc()).convert(tc.zone(timezone)).format("dd/MM/yyyy")
      start_ts = end_ts;
    }
    //interval passes a dayMark
    else {
      if (initialValue !== undefined) {
        initialValue = endValue;
      }
      else {
        initialValue = exports.searchData(fd, filesize, start_ts / 1000, true);
      }
      //no daylight saving changing today
      if ((dayDst != start_ts)) {
        endValue = exports.searchData(fd, filesize, dayMark / 1000, false);
        result = endValue - initialValue;
        dateLabel = new tc.DateTime(dayMark - 86400000 / 2, tc.utc()).convert(tc.zone(timezone)).format("dd/MM/yyyy");
        start_ts = dayMark;
        dayMark += 86400000;
      }
      //daylight saving changing today
      else {
        //value of offset after the daylight change will happen
        next_offset = new tc.DateTime(dayMark, tc.utc()).convert(tc.zone(timezone)).offsetDuration().milliseconds();
        //after daylight change next day will start at
        var nextDayMark = dayMark - ((dayMark + next_offset) % 86400000) + 86400000;
        //day longer (25 hours)
        if (nextDayMark > dayMark) {
          endValue = exports.searchData(fd, filesize, nextDayMark / 1000, true);
          result = ((endValue - initialValue) / 25) * 24;
          dateLabel = new tc.DateTime(nextDayMark - 86400000 / 2, tc.utc()).convert(tc.zone(timezone)).format("dd/MM/yyyy");
        }
        //day shorter(23 hours)
        else {
          endValue = endValue = exports.searchData(fd, filesize, nextDayMark / 1000, true);
          result = ((endValue - initialValue) / 23) * 24;
          dateLabel = new tc.DateTime(nextDayMark - 86400000 / 2, tc.utc()).convert(tc.zone(timezone)).format("dd/MM/yyyy");
        }
        start_ts = nextDayMark;
        dayMark = nextDayMark + 86400000;

      }

    }
    data.push([index, result / 10000]);
    ticks.push([index, dateLabel]);
    index++;
  } while (start_ts < end_ts)
  fs.closeSync(fd);
  return {
    data: data,
    graphOptions: { xaxis: { ticks: ticks } },
    queryTime: (new Date() - ts),
    //totalIntervalDatapoints: (posEnd-posStart)/9+1-deleted,
    //totalDatapoints:filesize/9-deleted,
    logSize: filesize
  };
}

exports.searchData = function (fd, filesize, timestamp, direction_up) {
  var buff = Buffer.alloc(9);
  var data;
  pos = exports.binarySearch(fd, timestamp, filesize);
  while (data === undefined) {
    fs.readSync(fd, buff, 0, 9, pos);
    timetmp = buff.readUInt32BE(1);
    if (buff.readUInt8(0) !== 0) { //skip deleted data TODO
      if (direction_up) {
        pos += 9;
        if (pos >= filesize) data = -1;
      }
      else {
        pos -= 9;
        if (pos <= 0) data = -1;
      }
    } //skip deleted data TODO
    else if ((direction_up) && ((timetmp < timestamp) || (timetmp > timestamp + 86400))) {
      pos += 9;
      if (pos >= filesize) data = -1;
    }
    else if ((!direction_up) && ((timetmp < timestamp - 86400) || (timetmp > timestamp))) {
      pos -= 9;
      if (pos <= 0) data = -1;
    }
    else data = buff.readInt32BE(5);
  }
  return data;
}


// filename:  binary file to append new data point to
// timestamp: data point timestamp (seconds since unix epoch)
// value:     data point value (signed integer)
// duplicateInterval: if provided a duplicate value is only posted after this many seconds
exports.postData = function post(filename, timestamp, value, duplicateInterval) {
  if (!metrics.isNumeric(value)) value = 999; //catch all value
  var logsize = exports.fileSize(filename);
  if (logsize % 9 > 0) throw 'File ' + filename + ' is not multiple of 9bytes, post aborted';

  var fd;
  var buff = Buffer.alloc(9);
  var secondLastValue = 0, lastTime = 0, lastValue = 0, pos = 0;
  value = Math.round(value * 10000); //round to make an exactly even integer

  //prepare 9 byte buffer to write
  buff.writeInt8(0, 0);             //flag byte
  buff.writeUInt32BE(timestamp, 1); //timestamp 4 bytes
  buff.writeInt32BE(value, 5);     //value 4 bytes

  // If there is at least one value 
  if (logsize >= 9) {
    fd = fs.openSync(filename, 'r');
    //If at least 2 values in file, read last two
    if (logsize >= 18) {
      var buf13 = Buffer.alloc(13);
      fs.readSync(fd, buf13, 0, 13, logsize - 13);
      secondLastValue = buf13.readInt32BE(0); //read second last value (bytes 0-3 in buffer)
      lastTime = buf13.readUInt32BE(5); //read last timestamp (bytes 5-8 in buffer)
      lastValue = buf13.readInt32BE(9); //read last value (bytes 9-13 in buffer)
      fs.closeSync(fd);
    }
    else {
      // read the only value in the file
      var buf8 = Buffer.alloc(8);
      fs.readSync(fd, buf8, 0, 8, logsize - 8);
      lastTime = buf8.readUInt32BE(0); //read timestamp (bytes 0-3 in buffer)
      lastValue = buf8.readInt32BE(4); //read value (bytes 4-7 in buffer)
      fs.closeSync(fd);
    }
    if (timestamp > lastTime) {
      //If metric duplicateInterval not passed yet and new value == last value == second last value => update last timestamp to new timestamp 
      if ((secondLastValue == lastValue && lastValue == value) && (duplicateInterval != null && timestamp - lastTime < duplicateInterval)) {
        fd = fs.openSync(filename, 'r+');
        fs.writeSync(fd, buff, 0, 9, logsize - 9);
        fs.closeSync(fd);
      }
      //only write new value if different than last value or duplicateInterval seconds has passed  or not set
      else if ((secondLastValue != lastValue && lastValue == value && duplicateInterval != null) || (value != lastValue || duplicateInterval == null || timestamp - lastTime > duplicateInterval)) {
        //timestamp is in the future, append
        fd = fs.openSync(filename, 'a');
        fs.writeSync(fd, buff, 0, 9, logsize);
        fs.closeSync(fd);
      }
    }
    else {
      //timestamp is somewhere in the middle of the log, identify exact timestamp to update
      fd = fs.openSync(filename, 'r');
      pos = exports.binarySearchExact(fd, timestamp, logsize);
      fs.closeSync(fd);

      if (pos != -1) {
        fd = fs.openSync(filename, 'r+');
        fs.writeSync(fd, buff, 0, 9, pos);
        fs.closeSync(fd);
      }
    }
  }
  else {
    //empty log, just append data point
    fd = fs.openSync(filename, 'a');
    fs.writeSync(fd, buff, 0, 9, 0);
    fs.closeSync(fd);
  }

  return value;
}

exports.editData = function (filename, start, end, newValue) {
  if (!metrics.isNumeric(newValue)) {
    console.error('editData FAIL: newValue \'' + newValue + '\' is not numeric');
    return 0;
  }
  else newValue = Math.round(newValue * 10000); //round to make an exactly even integer

  var edited = 0;
  fd = fs.openSync(filename, 'r');
  posStart = exports.binarySearch(fd, start, filesize);
  posEnd = exports.binarySearch(fd, end, filesize);
  fs.closeSync(fd);

  if (posStart <= posEnd) {
    var buff = Buffer.alloc(9);
    fd = fs.openSync(filename, 'r+');
    for (var i = posStart; i <= posEnd; i += 9) {
      fs.readSync(fd, buff, 0, 9, i);
      if (buff.readUInt8(0) !== 0) { continue; } //skip deleted data
      //value = buff.readInt32BE(5);
      buff.writeInt32BE(newValue, 5); //change value only
      //timeStamp = buff.readUInt32BE(1);
      //console.log('******* editData @ ' + i + ' : ' + timeStamp + ' : ' + value + ' -> ' + newValue);
      edited++;
      fs.writeSync(fd, buff, 0, 9, i);
    }
    fs.closeSync(fd);
  }
  return edited;
}

exports.deleteData = function (filename, start, end) {
  var deleted = 0;
  fd = fs.openSync(filename, 'r');
  posStart = exports.binarySearch(fd, start, filesize);
  posEnd = exports.binarySearch(fd, end, filesize);
  fs.closeSync(fd);

  if (posStart <= posEnd) {
    var buff = Buffer.alloc(9);
    fd = fs.openSync(filename, 'r+');
    for (var i = posStart; i <= posEnd; i += 9) {
      fs.readSync(fd, buff, 0, 9, i);
      buff.writeInt8(1, 0); //flag for deletion
      //timeStamp = buff.readUInt32BE(1);
      //value = buff.readUInt32BE(5);
      //console.log('******* deleteData @ ' + i + ' : ' + timeStamp + ' : ' + value);
      deleted++;
      fs.writeSync(fd, buff, 0, 1, i);
    }
    fs.closeSync(fd);
  }
  return deleted;
}

exports.binarySearch = function (fileDescriptor, timestamp, filesize) {
  start = 0;
  end = filesize - 9;
  var buff = Buffer.alloc(4);
  var time = 0;

  fs.readSync(fileDescriptor, buff, 0, 4, end + 1);
  time = buff.readUInt32BE(0);
  if (timestamp >= time) return end;

  // 30 here is our max number of iterations, the position should usually be found within 20 iterations
  for (let i = 0; i < 30; i++) {
    // Get the value in the middle of our range
    mid = start + Math.round((end - start) / 18) * 9;
    fs.readSync(fileDescriptor, buff, 0, 4, mid + 1);
    time = buff.readUInt32BE(0);
    // If it is the value we want then exit
    if (time == timestamp) return mid;

    // If the query range is as small as it can be 1 datapoint wide: exit
    if ((end - start) == 9) return (mid - 9);

    // If the time of the last middle of the range is more than our query time then next iteration is lower half less than our query time then nest iteration is higher half
    if (timestamp > time) start = mid; else end = mid;
  }
  return mid;
}

exports.binarySearchExact = function (fileDescriptor, timestamp, filesize) {
  if (filesize == 0) return -1;
  start = 0; end = filesize - 9;
  var buff = Buffer.alloc(4);
  var tmp = 0;
  for (let i = 0; i < 30; i++) {
    mid = start + Math.round((end - start) / 18) * 9;
    fs.readSync(fileDescriptor, buff, 0, 4, mid + 1);
    tmp = buff.readUInt32BE(0);
    if (tmp == timestamp) return mid;
    if ((end - start) == 9) {
      fs.readSync(fileDescriptor, buff, 0, 4, start + 1);
      tmp = buff.readUInt32BE(0);
      return (tmp == timestamp) ? start : -1;
    }
    if (timestamp > tmp) start = mid; else end = mid;
  }
  return -1;
}

exports.fileSize = function (filename) {
  return fs.existsSync(filename) ? fs.statSync(filename)['size'] : -1;
}

exports.removeMetricLog = function (logfile) {
  if (exports.fileSize(logfile) >= 0) {
    fs.unlinkSync(logfile);
    console.warn('removeMetricLog(): removed (' + logfile + ')');
  }
  else
    console.log('removeMetricLog(): no log file found (' + logfile + ')');
}