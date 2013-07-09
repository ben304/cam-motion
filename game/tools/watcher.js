Watcher = (function() {

	window.URL = window.URL || window.webkitURL;
	navigator.getUerMedia = navigator.getUerMedia
		|| navigator.webkitGetUserMedia
		|| navigator.mozGetUserMedia
		|| navigator.msGetUserMedia;

	var video = document.querySelector("video"),
		c1 = document.querySelector("#c1"),
		c2 = document.querySelector("#c2"),
		c3 = document.querySelector("#c3"),
		ctx1 = c1.getContext("2d"),
		ctx2 = c2.getContext("2d"),
		ctx3 = c3.getContext("2d"),
		localMediaStream = null,
		last,
		camInterval = 500,
		gameInterval = 30,
		currentColor,
		last,
		timer,
		currentColor,
		bg,
		cloneBg,
		enter = false,
		detect = [false, false, false],
		current = 0,
		stopTimes = 0;

	var DETECT_WIDTH = 640,
		DETECT_HEIGHT = 480;

	var __isFunction = function(func) {
		return Object.prototype.toString.call(func) == "[object Function]";
	};

	var __dec2hex = function(dec) {
		var hex = Number(dec).toString(16);
		return hex.length == 1 ? "0"+hex : hex;
	};

	var __onFail = function() {
		console.log("fail");
	};

	var __takeAction = function(interval, callback) {
		timer = setInterval(function() {
			ctx1.drawImage(video, 0, 0);
			if (callback && __isFunction(callback)) {
				callback();
			}
		}, interval);
	}

	var camStart = function(callback) {
		if (navigator.getUerMedia) {
			navigator.getUerMedia({video: true}, function(stream) {

				video.src = window.URL.createObjectURL(stream);
				localMediaStream = stream;
				if (callback && __isFunction(callback)) {
					callback();
				}
			}, __onFail);
		}
	};

	var camPause = function() {
		video.pause();
	};

	var camPlay = function() {
		video.play();
	};

	var reset = function() {
		enter = false;
		detect = [false, false, false];
		current = 0;
		stopTimes = 0;
	};

	/**
	 * 检测背景
	 * @param  {Function} callback [回调]
	 * @return {[type]}            []
	 */
	var inspectBg = function(callback) {
		bg = ctx1.getImageData(0, 0, DETECT_WIDTH, DETECT_HEIGHT);
		cloneBg = bg;
		ctx3.putImageData(bg, 0, 0);
		if (callback && __isFunction(callback)) {
			callback();
		}
	};

	/**
	 * 检测人物进入
	 * @return {[type]} [description]
	 */
	var inspectPerson = function() {
		clearTimer();
		__takeAction(200, function() {
			var cur = ctx1.getImageData(0, 0, DETECT_WIDTH, DETECT_HEIGHT);
			var d = ctx2.createImageData(DETECT_WIDTH, DETECT_HEIGHT);
			var black = 0, white = 0;
			var pixels = d.data;

			Filters.differenceAccuracy(d.data, cur.data, cloneBg.data);
			for (var i = 0; i < DETECT_WIDTH*DETECT_HEIGHT*4; i+=4) {
				if (pixels[i] == 0 || pixels[i+1] == 0 || pixels[i+2] == 0) {
					black++;
				} else {
					white++;
				}
			}
			rate = black/(white+black);

			if (!enter) {
				if (rate > 0.05) {
					//console.log("ok");
					enter = true;
				}
			} else {
				if (detect[0] && detect[1] && detect[2] && stopTimes>=20) {
					//console.log("next");
					Watcher.clearTimer();
					$("#showProject").hide();
					reset();
					game.nextPhase(Watcher.inspectColor);
				}
				if ((1-rate) < 0.02) {
					detect[current] = true;
					stopTimes++;
					console.log(stopTimes);
				} else {
					detect[current] = false;
					stopTimes = 0;
				}
				cloneBg = cur;
				current = (current+1)%3;
			}
			ctx3.putImageData(d, 0, 0);
		});
	};

	/**
	 * 判断人离开或者继续操作
	 * @return {[type]} [description]
	 */
	var leaveOrRestart = function() {
		$("#showProject").show();
		//先清除timer
		clearTimer();
		callback = function() {}
		__takeAction(30, function(callback) {
			cloneBg = bg;
			var cur_diff = ctx1.getImageData(0, 0, DETECT_WIDTH, DETECT_HEIGHT);
			var d = ctx2.createImageData(DETECT_WIDTH, DETECT_HEIGHT);

			ctx1.setTransform(-1.25, 0, 0, 1.25, 800, 0);
			var cur_detect = ctx1.getImageData(0, 0, 800, 600);
			var d2 = Filters.filter(cur_detect, [currentColor.r, currentColor.g, currentColor.b]);
			ctx3.putImageData(d2, 0, 0);
			Processor.startup(d2, callback);

			var black = 0, white = 0;
			var pixels = d.data;

			Filters.differenceAccuracy(d.data, cur_diff.data, cloneBg.data);
			for (var i = 0; i < DETECT_WIDTH*DETECT_HEIGHT*4; i+=4) {
				if (pixels[i] == 0 || pixels[i+1] == 0 || pixels[i+2] == 0) {
					black++;
				} else {
					white++;
				}
			}
			rate = white/(white+black);

			if (rate >= 1) {
				console.log("first");
			}
			//ctx3.putImageData(d, 0, 0);
		});
	};


	var colorer = function() {
		var cur = ctx1.getImageData(0, 0, DETECT_WIDTH, DETECT_HEIGHT);
		var d = ctx2.createImageData(DETECT_WIDTH, DETECT_HEIGHT);

		if (!last) {
			last = cur;
		} else {
			Filters.differenceAccuracy(d.data, cur.data, last.data);
			ctx2.putImageData(d, 0, 0);
			if (currentColor = Processor.detectColor(d, cur)) {
				timer = clearInterval(timer);
				//console.dir(currentColor);
				game.nextPhase(Watcher.gameStart.bind(undefined, lettersCtrl.bind.bind(lettersCtrl), 30));
			}
			last = cur;
		}
	};

	var inspectColor = function(callback, interval) {
		var myInterval = interval || camInterval;
		clearTimer();
		__takeAction(myInterval, colorer);
	};

	var gamer = function(callback) {
		//var start = new Date().getTime();
		ctx1.setTransform(-1.25, 0, 0, 1.25, 800, 0);
		var cur = ctx1.getImageData(0, 0, 800, 600);
		var d = Filters.filter(cur, [currentColor.r, currentColor.g, currentColor.b]);
		ctx3.putImageData(d, 0, 0);
		Processor.startup(d, callback);
		ctx2.putImageData(d, 0, 0);
		//console.log((new Date().getTime()) - start);
	};

	var gameStart = function(callback, interval) {
		if (!currentColor) {
			alert("请先检测一个颜色");
			return;
		}
		clearTimer();
		var myInterval = interval || gameInterval;
		__takeAction(myInterval, gamer.bind(undefined, callback));
	};

	var clearTimer = function() {
		clearInterval(timer);
	};

	return {
		camStart: camStart,
		camPause: camPause,
		camPlay: camPlay,
		inspectColor: inspectColor,
		gameStart: gameStart,
		clearTimer: clearTimer,
		inspectBg: inspectBg,
		inspectPerson: inspectPerson,
		leaveOrRestart: leaveOrRestart
	}
})();