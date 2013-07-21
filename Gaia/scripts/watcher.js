/**
 * 摄像头相关方法
 * @param  {[type]} S       [description]
 * @param  {[type]} Filters [description]
 * @return {[type]}         [description]
 */
KISSY.add(function(S, Processor, Filters, UserCtrl, Key) {

	window.URL = window.URL || window.webkitURL;
	navigator.getUserMedia = navigator.getUserMedia
		|| navigator.webkitGetUserMedia
		|| navigator.mozGetUserMedia
		|| navigator.msGetUserMedia;

	var Game = null,
		$ = S.Node.all;

	var video = document.querySelector("video"),
		c0 = document.querySelector("#c0"),
		c1 = document.querySelector("#c1"),
		c2 = document.querySelector("#c2"),
		ctx0 = c0.getContext("2d"),
		ctx1 = c1.getContext("2d"),
		ctx2 = c2.getContext("2d"),
		localMediaStream = null,
		last = null,
		camInterval = 50,
		gameInterval = 30,
		currentColor,
		timer,
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

	var d1 = document.querySelector("#debug1"),
		d_ctx1 = d1.getContext("2d");

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
	};

	var camStart = function(callback) {
		if (navigator.getUserMedia) {
			navigator.getUserMedia({video: true}, function(stream) {

				video.src = window.URL.createObjectURL(stream);
				localMediaStream = stream;

                // 设置图像
                setInterval(function() {
                    d_ctx1.drawImage(video, 0, 0, 160, 120);
                    d_ctx1.setTransform(-1, 0, 0, 1, 160, 0);
                }, 30);

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
		Key.knobs[0].reset();
		state = "init";
		personFlag = true;
		Game.launcherMonster.stop();
		enter = false;
		detect = [false, false, false];
		current = 0;
		stopTimes = 0;
	};

	/**
	 * 检测背景
	 */
	var inspectBg = function(callback) {
		bg = ctx1.getImageData(0, 0, DETECT_WIDTH, DETECT_HEIGHT);
		if (callback && __isFunction(callback)) {
			callback();
		}
        return null;
	};
	
	var inspectPerson = function() {
		clearTimer();
		cloneBg = bg;
		__takeAction(200, function() {
			var cur = ctx1.getImageData(0, 0, DETECT_WIDTH, DETECT_HEIGHT);
			var d = ctx2.createImageData(DETECT_WIDTH, DETECT_HEIGHT);
			var black = 0, white = 0;
			var pixels = d.data;

			Filters.difference(d.data, cur.data, cloneBg.data);
			for (var i = 0; i < DETECT_WIDTH*DETECT_HEIGHT*4; i+=4) {
				if (pixels[i] == 0 || pixels[i+1] == 0 || pixels[i+2] == 0) {
					black++;
				} else {
					white++;
				}
			}
			rate = black/(white+black);
			//console.log(rate);

			if (!enter) {
				if (rate > 0.02) {
					//console.log("ok");
					enter = true;
				}
			} else {
				// 下一步
				if (personFlag) {
					Game.launcherMonster.start();
					personFlag = false;
				}
				if (detect[0] && detect[1] && detect[2] && stopTimes>=20) {
					//console.log("next");
					clearTimer();
					reset();
					//var letterCtrl = new LettersCtrl('Page1', '#J_KeyBoardCircle');
					Game.nextPhase(inspectColor);
				}
				if ((1-rate) < 0.02) {
					// 再次查看是否和背景相同
					white = black = 0;
					Filters.difference(d.data, cur.data, bg.data);
					pixels = d.data;
					for (var j = 0; j < DETECT_WIDTH*DETECT_HEIGHT*4; j+=4) {
						if (pixels[j] == 0 || pixels[j+1] == 0 || pixels[j+2] == 0) {
							black++;
						} else {
							white++;
						}
					}
					var newRate = white/(white+black);
					if (newRate >= 0.99) {
						reset();
					} else {
						detect[current] = true;
						stopTimes++;
						Key.knobs[0].draw(stopTimes*5);
					}
					//console.log(stopTimes);
				} else {
					detect[current] = false;
					stopTimes = 0;
					Key.knobs[0].reset();
				}
				cloneBg = cur;
				current = (current+1)%3;
			}
		});
	}; 

	/**
	 * 判断人离开或者继续操作
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

			Filters.difference(d.data, cur_diff.data, cloneBg.data);
			for (var i = 0; i < DETECT_WIDTH*DETECT_HEIGHT*4; i+=4) {
				if (pixels[i] == 0 || pixels[i+1] == 0 || pixels[i+2] == 0) {
					black++;
				} else {
					white++;
				}
			}
			rate = white/(white+black);

			if (rate >= 0.99) {
				Game.reset(function() {
					Key.knobs[0].reset();
					setTimeout(inspectPerson, 100);
				});
			}
		});
	};


	var colorer = function() {
		var cur = ctx0.getImageData(0, 0, DETECT_WIDTH, DETECT_HEIGHT);
		var d = ctx2.createImageData(DETECT_WIDTH, DETECT_HEIGHT);

		if (!last) {
			last = cur;
		} else {
			Filters.difference(d.data, cur.data, last.data);
			ctx2.putImageData(d, 0, 0);
			if (currentColor = Processor.detectColor(d, cur, function(nTimes) {Key.knobs[1].draw(nTimes);}, function() {Key.knobs[1].reset();})) {
				timer = clearInterval(timer);
				$("#colorSpan").css("background", "rgb("+currentColor.r+","+currentColor.g+","+currentColor.b+")");
				$("#colorName").text(currentColor.r+","+currentColor.g+","+currentColor.b);
				
				var name = UserCtrl.addUser("UED-0");
				UserCtrl.setUser(name);
				$('.id').text(name);
				//var lettersCtrl = new LettersCtrl('Page1', '#J_KeyBoardCircle');
				//lettersCtrl.circle.hide();
				Game.nextPhase(function() {
					$('#CountDown').addClass('show');
				});
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
		ctx1.setTransform(-1.25, 0, 0, 1.25, 800, 0);
		var cur = ctx1.getImageData(0, 0, 800, 600);
		var d = Filters.filter(cur, [currentColor.r, currentColor.g, currentColor.b]);
		Processor.startup(d, callback);
		ctx2.putImageData(d, 0, 0);
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

	var init = function(g) {
		Game = g;
	};

	return {
		init: init,
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
}, {
	requires: [
		'./processor',
    	'./filters',
    	'./user',
    	'./keyboard'
    ]
});