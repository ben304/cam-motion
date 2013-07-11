(function($) {

	var GRID_ROW = 3,
		GRID_COLUMN = 3,
		TOTAL_RATS = 1,
		SPEED = 2000;

	var hammer = $(".hammer");

	/* 用于控制地鼠出现 */
	var App = {

		// 其实没用上
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
				this.map = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
				this.current = null;
				$("#timer").addClass("onprocess");
				this.popup();
			}
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
		},

		getVacantHole: function() {
			var rnd = Math.floor(Math.random()*10);
			if (this.lastChoice) {
				if (this.lastChoice == rnd) {
					rnd = (rnd+1)%10;
				}
				this.lastChoice = rnd
			} else {
				this.lastChoice = rnd;
			}
			return rnd+1;
		},

		bindEvnet: function() {

			var that = this;
			// 绑定动物消失后出现另一个动物
			$(".monster").bind('webkitAnimationEnd', function(e) {
			    //that.map[row][column] = false;
			    //actor.removeClass('active');
			    var holeID = $(this).data("hole");
			    $(this).attr("class", "monster");
			    // 延时防止class未能清除
			    setTimeout(function() {
			    	that.map[holeID-1] = 0;
			    	that.popup();
				}, 10);
			});

			$("#gameScore").delegate(".raise", "webkitAnimationEnd", function() {
				$(this).remove();
			});

			$("#oneScore").bind('webkitAnimationEnd', function() {
				$(this).removeClass("raise");
			});
		},

		unbindEvent: function() {
			// 绑定动物消失后出现另一个动物
			$(".monster").unbind();
			$("#oneScore").unbind();
			$("#gameScore").undelegate();
		},

		hit: function(left, top) {
			var that = this;
			hammer.css({"left": left, "top": top});
			if (this.current != null) {
				var monster = $(".monster").eq(this.current-1),
					score = monster.data("score");

				if (this.checkCollision(left, top, monster)) {
					var totalScore = game.addScore(score);
					this.showScore(score, totalScore);

					//console.log("hit"+this.current);
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
						//this.map[this.current-1] = 0;
						that.popup();
					}, 10);
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
			$("<span class='add raise'>+"+score+"</span>").appendTo("#gameScore");
			$("#totalScore").html(total);
		},

		start: function() {
			// 存用户名
			// var user = UserCtrl.addUser($('#username').val() || "UED-0")
   //    		UserCtrl.setUser(user);
			Watcher.clearTimer();
		    game.nextPhase(function() {
		        game.on('start', function(mapArea) {
		          App.init(mapArea);
		        }).on('over', function(score) {
		          App.stop(score);
		        });
		        Watcher.gameStart.bind(undefined, App.hit.bind(App))();
		    });
		},

		restart: function() {
			Watcher.clearTimer();
			game.on('start', function(mapArea) {
			  $("#totalScore").html(0);
	          App.init(mapArea);
	        }).on('over', function(score) {
	          App.stop(score);
	        });
	        Watcher.gameStart.bind(undefined, App.hit.bind(App))();
		},

		process: function(time) {
			// donothing
		},

		// 停止游戏
		stop: function(score) {
			this.initialized = false;
			this.unbindEvent();
			UserCtrl.setScore(UserCtrl.getUser(), score);
			$(".monster").attr("class", "monster");
			$(".monster").find("p").attr("class", "");
			Watcher.clearTimer();
			$("#endScore").html(score);
			$("#gameScore").empty().append($('<span id="totalScore" class="total">0</span>'));
			$("#timer").removeClass("onprocess");
			var lettersCtrl = new LettersCtrl('Page2', '#J_KeyBoardCircle2');
			game.nextPhase(function() {
				Watcher.leaveOrRestart(lettersCtrl.bind.bind(lettersCtrl));	
			});
		},

		showScoreList: function() {
			var list = UserCtrl.listScore();
			list.sort(function(a,b){return b.score - a.score});
			list.splice(10);
			var tpl = $('.rank-item').html();
			var str = ((function() {
	        	var _i, _len, _results = [];
		        for (_i = 0, _len = list.length; _i < _len; _i++) {
		          item = list[_i];
		          _results.push(tpl.replace('{name}', item.name).replace('{score}', item.score));
		        }
		        return _results;
			})()).join("");
			$('.rank ul').html("").append(str);
			var lettersCtrl = new LettersCtrl('Page3', '#J_KeyBoardCircle3');
			game.nextPhase(function() {
				Watcher.leaveOrRestart(lettersCtrl.bind.bind(lettersCtrl));
			});
		},

		LauncherMonster: {
			init: function(){
				var m = $('#sm li'), th = this;
				$.extend(th, {
				  _m: m,
				  _l: m.length,
				  _tf: 'bounce',
				  _timer: null,
				  _i: 300
				});
				m.bind('webkitAnimationEnd', function(){
				  $(this).removeClass(th._tf);
				});
			},
			start: function(){
				var th = this;
				th._timer = setInterval(function(){
		            $(th._m[(Math.random()*th._l)|0]).addClass(th._tf);
            	}, th._i);
          	},
          	stop: function(){
            	clearInterval(this._timer);
            	this._timer = null;
            	this._m.removeClass(this._tf);
          	}
        }
	};

	window.App = App;

})(jQuery);