(function($) {

	var GRID_ROW = 3,
		GRID_COLUMN = 3,
		TOTAL_RATS = 1,
		SPEED = 2000;

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
			$("#timer").addClass("onprocess");
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

			$("#timer").on('webkitAnimationEnd', function() {
				$(this).removeClass("onprocess");
			});

			$("#oneScore").on('webkitAnimationEnd', function() {
				$(this).removeClass("raise");
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
					this.showScore(score, totalScore);

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

		showScore: function(score, total) {
			$("#oneScore").html("+"+score).removeClass("raise").addClass("raise");
			$("#totalScore").html(total);
		},

		start: function() {
			Watcher.clearTimer();
		    game.nextPhase(function() {
		        game.on('start', function(mapArea) {
		          App.init(mapArea);
		        }).on("process", function(i) {
		          App.process(i);
		        }).on('over', function(score) {
		          App.stop(score);
		        });
		        Watcher.gameStart.bind(undefined, App.hit.bind(App))();
		    });
		},

		process: function(time) {
			//TODO: 刷新计时条
			console.log(time);
		},

		// 停止游戏
		stop: function(score) {
			$(".monster").attr("class", "monster");
			Watcher.clearTimer();
			$("#endScore").html(score);
			var lettersCtrl = new LettersCtrl('Page2', '#J_KeyBoardCircle2');
			game.nextPhase(function() {
				Watcher.leaveOrRestart(lettersCtrl.bind.bind(lettersCtrl));	
			});
		}
	};

	window.App = App;

})(jQuery);