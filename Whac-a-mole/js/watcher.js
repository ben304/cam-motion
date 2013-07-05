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
		currentColor;

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
				console.dir(currentColor);
				var color = [currentColor.r, currentColor.g, currentColor.b];
				var hex = color.map(function(dec, i) {return __dec2hex(dec);})
				document.getElementById("block").style.background = "rgb("+color.join(",")+")";
				document.getElementById("text").innerHTML = "#"+hex.join("");
			}
			last = cur;
		}
	};

	var inspectColor = function(interval) {
		var myInterval = interval || camInterval;
		__takeAction(myInterval, colorer);
	};

	var gamer = function() {
		var start = new Date().getTime();
		ctx1.setTransform(-1.25, 0, 0, 1.25, 800, 0);
		var cur = ctx1.getImageData(0, 0, 800, 600);
		var d = Filters.filter(cur, [currentColor.r, currentColor.g, currentColor.b]);
		Processor.startup(d);
		ctx2.putImageData(d, 0, 0);
		//ctx1.setTransform(-0.5, 0, 0, 0.5, 640, 0);
		//cur = ctx1.getImageData(0, 0, 320, 240);
		//ctx3.putImageData(d, 0, 0);
		console.log((new Date().getTime()) - start);
	};

	var gameStart = function(interval) {

		if (timer) {
			alert("另一个timer正在运行，先执行clearTimer清除。");
			return;
		}
		if (!currentColor) {
			alert("请先检测一个颜色");
			return;
		}
		var myInterval = interval || gameInterval;
		__takeAction(myInterval, gamer);
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
		clearTimer: clearTimer
	}
})();