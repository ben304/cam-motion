(function($) {

	var GRID_ROW = 3,
		GRID_COLUMN = 3,
		TOTAL_RATS = 1,
		SPEED = 2000;

	window.lettersCtrl = new LettersCtrl();
	var hammer = $(".hammer");

	/* 用于控制地鼠出现 */
	var App = {

		map: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

		mapArea: [],

		initialized: false,

		// 最小为1
		current: null,

		holeRect: {w: 0, h: 0},

		init: function(mapArea) {
			if (!this.initialized) {
				this.mapArea = mapArea;
				this.initialized = true;
				this.holeRect = {w: mapArea.width, h: mapArea.height};
				this.bindEvnet();
			}
			this.popup();
		},

		popup: function() {
			
			var info = game.getMonster(),
				level = info.level,
				monster = info.monster;

			console.log(level.CLSNAME);

			var holeID = this.getVacantHole();
			//console.log(holeID+" appear");
			$(".p"+holeID).find("p").attr('class', monster.CLSNAME);
			$(".p"+holeID).find(".monster").attr('class', 'monster '+level.CLSNAME).data("score", monster.SCORE);
			this.map[holeID-1] = 1;
			this.current = holeID;
			// if (this.paused) {
			// 	clearTimeout(this.timer);
			// 	return;
			// }

			// if (this.timeout) {
			// 	clearTimeout(this.timer);
			// 	return;
			// } 

			// var that = this;

			// that.timer = setTimeout(function() {
			// 	for (var i = 0; i < TOTAL_RATS; i++) {
			// 		var	row = that.findVacantPos()[0],
			// 			column = that.findVacantPos()[1],
			// 			hole = that.grids[row][column];

			// 		if (!that.map[row][column]) {
			// 			that.map[row][column] = true;
			// 			that.popup(row, column);
			// 		}
			// 	}
			// 	that.startup();
			// }, 2000);
		},

		getVacantHole: function() {
			var rnd = Math.floor(Math.random()*10);
			if (this.map[rnd]) {
				rnd = (rnd+1)%10;
			}
			return rnd+1;
		},

		bindEvnet: function() {

			var that = this;
			
			// 绑定动物消失后出现另一个动物
			$(".monster").on('webkitAnimationEnd', function(e) {
			    //that.map[row][column] = false;
			    //actor.removeClass('active');
			    var holeID = $(this).data("hole");
			    $(this).attr("class", "monster");
			    // 延时防止class未能清除
			    setTimeout(function() {
			    	that.popup();
				}, 50);
			    that.map[holeID-1] = 0;
			    that.current = null;
			});

			$(".pause").click(function() {
				$(".monster").addClass("pause");
			});
		},

		/*
		faint: function(e) {
			var that = this,
				$target = $(e.target),
				$star = $target.prev(),
				$actor = $target.closest(".mouse"),
				column = $target.closest(".hole").data("column"),
				row = $target.closest(".row").data("row");

			setTimeout(function() {
				$star.removeClass("faint");
				$actor.removeClass("active pause");
				that.map[row][column] = false;
			}, 2000);
			$star.addClass("faint");
			$actor.addClass("pause");
		},

		toggle: function(paused) {
			this.paused = paused;
			this.toggleMouse(paused);
			this.startup();
		},

		toggleMouse: function(paused) {
			var method = paused ? "addClass" : "removeClass";
			for (var i = 0; i < GRID_ROW; i++) {
				for (var j = 0; j < GRID_COLUMN; j++) {
					if (this.map[i][j]) {
						var actor = $(this.grids[i][j]).find(".mouse");
						actor[method]("pause");
						actor.find(".star")[method]("pause");
					}
				}
			}
		},

		// TODO: find a better way to solve conflict
		findVacantPos: function() {
			var that = this,
				row = that.random(),
				column = that.random();

			if (that.map[row][column]) {
				return [(row+1)%3, (column+1)%3];
			} else {
				return [row, column];
			}
		},

		random: function() {
			return Math.floor(Math.random()*3);
		},*/

		hit: function(left, top) {
			var that = this;
			hammer.css({"left": left, "top": top});
			if (this.current != null) {
				var monster = $(".monster").eq(this.current-1),
					score = monster.data("score");

				if (this.checkCollision(left, top, monster)) {
					var totalScore = game.addScore(score);
					this.showScore(totalScore);

					console.log("hit"+this.current);
					hammer.addClass("bang");
					monster.data("hit", true);
					monster.addClass("pause");
					monster.addClass("hit");
					SoundBox.play('HIT');
					setTimeout(function(){
						hammer.removeClass("bang");
						monster.attr("class", "monster");
						monster.removeClass("hit");
						monster.removeClass("pause");
						monster.data("hit", false);
						that.popup();
					}, 200);
				}
			}
		},

		checkCollision: function(left, top, monster) {
			var w = this.holeRect.w,
				h = this.holeRect.h,
				point = this.mapArea.holes[this.current-1],
				x = point.x,
				y = point.y,
				elemTop = monster.offset().top - $("#stage").offset().top;

			if (left>=x && left<=x+w && top>=elemTop && top<=y+h && !monster.data("hit")) {
				return true;
			}
			return false;
		},

		showScore: function(score) {
			console.log(score);
		},

		process: function(time) {
			//TODO: 刷新计时条
			//console.log(time);
		},

		// 停止游戏
		stop: function(score) {
			$(".monster").attr("class", "monster");
			Watcher.clearTimer();
			//TODO: 显示分数
			//game.nexePhase();
		}
	};

	var mouseEvent = {
		move: function(x, y) {
			$("#hammer").animate({left: "200px", top: "200px"}, SPEED, "linear");
		},

		firePause: function() {
			var btn = document.getElementById("pause");
 			var event = document.createEvent("MouseEvents");
 			event.initMouseEvent("click", true, true, document.defaultView, 0, 0, 0, 0, 0,false, false, false, false, 0, null);
 			btn.dispatchEvent(event);
		},

		fireClick: function() {

		},

		whichMouse: function(x, y) {
			//console.log(x, y);
			var mouse_x, mouse_y;
			if (x >= 0 && x < 200) {
				mouse_x = 0;
			} else if (x >= 220 && x < 440) {
				mouse_x = 1;
			} else if (x >= 440 && x < 640) {
				mouse_x = 2;
			} else {
				return false;
			}
			mouse_y = Math.floor(y/160);
			var index = mouse_y*3+mouse_x;
			//console.log(index, mouse_x, mouse_y);
			var mt = parseInt($(".mouse").eq(index).css("margin-top"));
			if (controller.map[mouse_y][mouse_x]) {
				if (y%160 < mt) {
					return false;
				} else {
					return index;
				}
			} else {
				return false;
			}
		}
	};

	/* 总控 */
	/*
	var app = {

		paused: false,

		score: 0,

		currentPhase: 1,

		init: function(cb) {
			this.bindEvent();
			controller.init(cb);
		},

		bindEvent: function() {
			var that = this;
			$("#pause").click(function() {
				that.paused = !that.paused;
				var text = that.paused ? "恢复" : "暂停";
				$(this).text(text);
				controller.toggle(that.paused);
			});

			$("#container").delegate(".body", "click", function(e) {
				that.score++;
				controller.faint(e);
				$("#score").find("span").text(that.score);
			});
		},

		hit: function(x, y) {
			var index;
			if (index = mouseEvent.whichMouse(x, y)) {
				$("#hammer").addClass("bang")[0].getBoundingClientRect();

				$("#hammer").one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
				    function(e) {
				    	$("#hammer").removeClass('bang');
				});

				var mouse = $(".body")[index];
	 			var event = document.createEvent("MouseEvents");
	 			event.initMouseEvent("click", true, true, document.defaultView, 0, 0, 0, 0, 0,false, false, false, false, 0, null);
	 			mouse.dispatchEvent(event);
			}
		},

		roll: function() {
			var next = (this.currentPhase+1)%3;
			$("#phase"+this.currentPhase).hide();
			$("#phase"+next).show();
			this.currentPhase = next;

			if(next == 2) {

			}

			// temp
			Watcher.gameStart(function(x, y) {lettersCtrl.bind(y, x);});
		}
	};*/

	//app.init();

	window.App = App;

})(jQuery);