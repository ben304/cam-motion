Watcher = (function() {

	window.URL = window.URL || window.webkitURL;
	navigator.getUerMedia = navigator.getUerMedia
		|| navigator.webkitGetUserMedia
		|| navigator.mozGetUserMedia
		|| navigator.msGetUserMedia;

	var video = document.querySelector("video"),
		c0 = document.querySelector("#c0"),
		c1 = document.querySelector("#c1"),
		c2 = document.querySelector("#c2"),
		ctx0 = c0.getContext("2d"),
		ctx1 = c1.getContext("2d"),
		ctx2 = c2.getContext("2d"),
		localMediaStream = null,
		last,
		camInterval = 50,
		gameInterval = 30,
		currentColor,
		timer,
		currentColor,
		bg,
		cloneBg,
		enter = false,
		detect = [false, false, false],
		current = 0,
		stopTimes = 0,
		personFlag = true, 
		state = "init";

	var DETECT_WIDTH = 640,
		DETECT_HEIGHT = 480;

	var debugMode = true,
		d1 = document.querySelector("#debug1"),
		d2 = document.querySelector("#debug2"),
		d3 = document.querySelector("#debug3"),
		d4 = document.querySelector("#debug4"),
		d_ctx1 = d1.getContext("2d"),
		d_ctx2 = d2.getContext("2d"),
		d_ctx3 = d3.getContext("2d"),
		d_ctx4 = d4.getContext("2d"),
		d_first = true,
		d_last,
		d_bg;

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
			ctx0.drawImage(video, 0, 0);
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
				if (debugMode) {
					setInterval(function() {
						d_ctx1.drawImage(video, 0, 0, 160, 120);
						var cur = d_ctx1.getImageData(0, 0, 160, 120);
						var newCanvas1 = d_ctx2.createImageData(160, 120),
							newCanvas2 = d_ctx2.createImageData(160, 120);
						// background
						if (d_first) {
							d_last = d_bg = cur;
							d_ctx2.putImageData(cur, 0, 0);
							d_first = false;
						} else {
							Filters.differenceAccuracy(newCanvas1.data, cur.data, d_bg.data);
							d_ctx3.putImageData(newCanvas1, 0, 0);

							Filters.differenceAccuracy(newCanvas2.data, cur.data, d_last.data);
							d_ctx4.putImageData(newCanvas2, 0, 0);

							d_last = cur;
						}

					}, 30);
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
		//$("#showProject").hide();
		$(".bigCircle1").val(0).trigger("change");
		state = "init";
		personFlag = true;
		App.LauncherMonster.stop();
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
		bg = d_ctx1.getImageData(0, 0, DETECT_WIDTH, DETECT_HEIGHT);
		if (callback && __isFunction(callback)) {
			callback();
		}
	};

	/**
	 * 检测人物进入
	 * @return {[type]} [description]
	 */
	
	/*
	var inspectPerson = function() {
		clearTimer();
		var first = true, last;
		__takeAction(200, function() {
			var cur = d_ctx1.getImageData(0, 0, 160, 120);
			var d = d_ctx2.createImageData(160, 120),
				d2 = d_ctx2.createImageData(160, 120);

			var black = 0, white = 0, black2 = 0, white2 = 0;
			var pixels = d.data;

			if (first) {
				last = cur;
				first = false;
			} else {
				// 与背景比较
				Filters.differenceAccuracy(d.data, cur.data, bg.data);
				// 与前一次比较
				Filters.differenceAccuracy(d2.data, cur.data, last.data);

				var pixels = d.data, pixels2 = d2.data;
				for (var i = 0; i < 160*120*4; i+=4) {
					if (pixels[i] == 0 && pixels[i+1] == 0 && pixels[i+2] == 0) {
						black++;
					} else {
						white++;
					}

					if (pixels2[i] == 0 && pixels2[i+1] == 0 && pixels2[i+2] == 0) {
						black2++;
					} else {
						white2++;
					}
				}

				var rate = black/(black+white),
					rate2 = white2/(black2+white2);

				if (state == "init") {
					if (rate >= 0.2 && rate2 >= 0.2) {
						state = "enter";
					}
				} else if (state == "enter") {
					if (personFlag) {
						App.LauncherMonster.start();
						personFlag = false;
					}
					if (detect[0] && detect[1] && detect[2] && stopTimes>=20) {
						//console.log("next");
						Watcher.clearTimer();
						reset();
						var letterCtrl = new LettersCtrl('Page1', '#J_KeyBoardCircle');
						game.nextPhase(Watcher.inspectColor);
					}
					if (rate2 < 0.02) {
						if (rate < 0.02) {
							reset();
						} else {
							detect[current] = true;
							stopTimes++;
							$(".bigCircle1").val(stopTimes*5).trigger("change");
						}
					} else {
						detect[current] = false;
						stopTimes = 0;
						$(".bigCircle1").val(0).trigger("change");
					}
					current = (current+1)%3;
				}
			}
		});
	}; */
	
	var inspectPerson = function() {
		clearTimer();
		cloneBg = bg;
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
			console.log(rate);

			if (!enter) {
				if (rate > 0.02) {
					//console.log("ok");
					enter = true;
				}
			} else {
				// 下一步
				if (personFlag) {
					App.LauncherMonster.start();
					personFlag = false;
				}
				if (detect[0] && detect[1] && detect[2] && stopTimes>=20) {
					//console.log("next");
					Watcher.clearTimer();
					reset();
					var letterCtrl = new LettersCtrl('Page1', '#J_KeyBoardCircle');
					game.nextPhase(Watcher.inspectColor);
				}
				if ((1-rate) < 0.02) {
					// 再次查看是否和背景相同
					white = black = 0;
					Filters.differenceAccuracy(d.data, cur.data, bg.data);
					pixels = d.data;
					for (var i = 0; i < DETECT_WIDTH*DETECT_HEIGHT*4; i+=4) {
						if (pixels[i] == 0 || pixels[i+1] == 0 || pixels[i+2] == 0) {
							black++;
						} else {
							white++;
						}
					}
					var newRate = white/(white+black);
					if (newRate >= 0.98) {
						reset();
					} else {
						detect[current] = true;
						stopTimes++;
						$(".bigCircle1").val(stopTimes*5).trigger("change");
					}
					//console.log(stopTimes);
				} else {
					detect[current] = false;
					stopTimes = 0;
					$(".bigCircle1").val(0).trigger("change");
				}
				cloneBg = cur;
				current = (current+1)%3;
			}
			
		});
	}; 

	/**
	 * 判断人离开或者继续操作
	 * @return {[type]} [description]
	 */
	var leaveOrRestart = function(callback) {
		//$("#showProject").show();
		//先清除timer
		clearTimer();
		__takeAction(30, function() {
			cloneBg = bg;
			var cur_diff = ctx1.getImageData(0, 0, DETECT_WIDTH, DETECT_HEIGHT);
			var d = ctx2.createImageData(DETECT_WIDTH, DETECT_HEIGHT);

			ctx1.setTransform(-1.25, 0, 0, 1.25, 800, 0);
			var cur_detect = ctx1.getImageData(0, 0, 800, 600);
			var d2 = Filters.filter(cur_detect, [currentColor.r, currentColor.g, currentColor.b]);
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

			if (rate >= 0.98) {
				game.reset(function() {
					$(".bigCircle1").val(0).trigger("change");
					setTimeout(Watcher.inspectPerson, 100);
				});
			}
		});
	};


	var colorer = function() {
		var cur = ctx0.getImageData(0, 0, DETECT_WIDTH, DETECT_HEIGHT);
		//ctx3.putImageData(cur, 0, 0);
		//$("#showProject").show();
		var d = ctx2.createImageData(DETECT_WIDTH, DETECT_HEIGHT);

		if (!last) {
			last = cur;
		} else {
			Filters.differenceAccuracy(d.data, cur.data, last.data);
			ctx2.putImageData(d, 0, 0);
			if (currentColor = Processor.detectColor(d, cur)) {
				timer = clearInterval(timer);
				//console.dir(currentColor);
				$(".colorCon").css("background", "#"+__dec2hex(currentColor.r)+__dec2hex(currentColor.g)+__dec2hex(currentColor.b));
				$(".colorVal").html("("+currentColor.r+", "+currentColor.g+", "+currentColor.b+")");
				

				var name = UserCtrl.addUser("UED-0");
				$('.id').text(name);
				var lettersCtrl = new LettersCtrl('Page1', '#J_KeyBoardCircle');
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

	var debug = function() {
		if (debugMode) {
			$("#debug").show();
		}
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
		leaveOrRestart: leaveOrRestart,
		debug: debug
	}
})();