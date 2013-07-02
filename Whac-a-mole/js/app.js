(function($) {

	var GRID_ROW = 3,
		GRID_COLUMN = 3,
		TOTAL_RATS = 1,
		SPEED = 2000;

	/* 用于控制地鼠出现 */
	var controller = {

		level: 0,

		contentEl: null,

		grids: [],

		map: [],

		initialized: false,

		init: function(cb) {
			var that = this;
			if (!that.initialized) {
				that.contentEl = $("table");
				$(".row").each(function(index, row) {
					var holes = $(row).children().each(function(index, hole) {
						return hole;
					});
					that.grids.push(holes);
				});
				that.map = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
				that.startup();
				that.initialized = true;
			}
			cb && cb();
		},

		startup: function() {
			
			if (this.paused) {
				clearTimeout(this.timer);
				return;
			}

			if (this.timeout) {
				clearTimeout(this.timer);
				return;
			} 

			var that = this;

			that.timer = setTimeout(function() {
				for (var i = 0; i < TOTAL_RATS; i++) {
					var	row = that.findVacantPos()[0],
						column = that.findVacantPos()[1],
						hole = that.grids[row][column];

					if (!that.map[row][column]) {
						that.map[row][column] = true;
						that.popup(row, column);
					}
				}
				that.startup();
			}, 2000);
		},

		popup: function(row, column) {
			var that = this,
				actor = $(that.grids[row][column]).find(".mouse"),
				star = actor.find(".star");

			actor.addClass("active");
			actor.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
			    function(e) {
			    	that.map[row][column] = false;
			    	actor.removeClass('active');
			});
			star.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
			    function(e) {
			    	star.removeClass('faint');
			});
		},

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
	var app = {

		paused: false,

		score: 0,

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
		}
	};

	app.init();

	window.app = app;

})(jQuery);