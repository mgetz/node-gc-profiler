"use strict";

var EventEmitter = require('events').EventEmitter;
var GcProfiler = require('./build/Release/GcProfiler');

var main = new EventEmitter();
module.exports = main;

// https://github.com/v8/v8/blob/ca9ec36eb5881f73c1ac1b5a5df710227ad96fae/include/v8.h#L5228
var GC_TYPES = {
	1: 'Scavenge',
	2: 'MarkSweepCompact',
	4: 'IncrementalMarking',
	8: 'ProcessWeakCallbacks',
	15: 'All'
};

main.GCCallbackFlags = {
	kNoGCCallbackFlags: 0,
	kGCCallbackFlagCompacted: 1 << 0,
	kGCCallbackFlagConstructRetainedObjectInfos: 1 << 1,
	kGCCallbackFlagForced: 1 << 2
};

GcProfiler.loadProfiler(function (startTime, ms, type, flags, startSec, startNs)
{
	var dateMs;
	if (startSec && startNs) {
		dateMs = (startSec * 1000) + Math.floor(startNs/1000000)
	} else {
		dateMs = startTime * 1000;
	}
	var info = {
		date: new Date(dateMs),
		duration: ms,
		type: GC_TYPES[type],
		forced: !!(flags && main.GCCallbackFlags.kGCCallbackFlagForced),
		flags: flags,
		startSec: startSec,
		startNs: startNs
	};

	main.emit('gc', info);
});
