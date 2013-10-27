/**
 * 游戏主体逻辑
 * @param  {[type]} S       [description]
 * @param  {[type]} Game    [description]
 * @param  {[type]} Watcher [description]
 * @return {[type]}         [description]
 */
KISSY.add(function(S, SoundBox, UserCtrl) {

	var $ = S.Node.all,
		hammer = $(".hammer");

	return {

		mapArea: [],

		initialized: false,

		// 最小为1
		current: null,

		holeRect: {w: 0, h: 0},

		config: function(game, watcher, key) {
			this.Game = game;
			this.Watcher = watcher;
			this.Key = key;
		},

		init: function(mapArea) {
			if (!this.initialized) {
				this.mapArea = mapArea;
				this.initialized = true;
				this.holeRect = {w: mapArea.width, h: mapArea.height};

				this.bindEvnet();
				this.current = null;
				$("#timer").addClass("onprocess");
				$("#debug1").show();
				this.popup();
			}
		},

		popup: function() {
			var info = this.Game.getMonster(),
				level = info.level,
				monster = info.monster;

			//console.log(level.CLSNAME);

			var holeID = this.getVacantHole();
			//console.log(holeID+" appear");
			$(".p"+holeID).all("p").attr('class', monster.CLSNAME);
			$(".p"+holeID).all(".monster").attr('class', 'monster '+level.CLSNAME).attr("data-score", monster.SCORE);
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
			$(".monster").on('webkitAnimationEnd', function() {
			    $(this).attr("class", "monster");
			    // 延时防止class未能清除
			    setTimeout(function() {
			    	that.popup();
				}, 10);
			});

			$("#gameScore").delegate(".raise", "webkitAnimationEnd", function() {
				$(this).remove();
			});

			$("#oneScore").on('webkitAnimationEnd', function() {
				$(this).removeClass("raise");
			});
		},

		unbindEvent: function() {
			// 绑定动物消失后出现另一个动物
			$(".monster").detach();
			$("#oneScore").detach();
			$("#gameScore").undelegate();
		},

		hit: function(left, top) {
			var that = this;
			hammer.css({"left": left, "top": top});
			if (this.current != null) {
				var monster = $(".monster").item(this.current-1),
					score = parseInt(monster.attr("data-score"));

				if (this.checkCollision(left, top, monster)) {
					var totalScore = this.Game.addScore(score);
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

			return left>=x && left<=x+w && top>=elemTop && top<=y+h && !monster.data("hit");
		},

		showScore: function(score, total) {
			$("<span class='add raise'>+"+score+"</span>").appendTo("#gameScore");
			$("#totalScore").html(total);
		},

		start: function() {
			var self = this;
			self.Watcher.clearTimer();
		    self.Game.nextPhase(function() {
		        self.Game.on('start', function(mapArea) {
		          self.init(mapArea);
		          self.Watcher.gameStart.bind(undefined, self.hit.bind(self))();
		        });
		        self.Game.on('over', function(score) {
		          self.stop(score);
		        });
		    });
		},

		restart: function() {
			var self = this;
			self.Watcher.clearTimer();
			self.Game.on('start', function(mapArea) {
			  	$("#totalScore").html(0);
	          	self.init(mapArea);
	        });
	        self.Game.on('over', function(score) {
	          	self.stop(score);
	        });
	        self.Watcher.gameStart.bind(undefined, self.hit.bind(self))();
		},

		process: function() {
			// donothing
		},

		// 停止游戏
		stop: function(score) {
			var self = this;

			this.initialized = false;
			this.unbindEvent();
			UserCtrl.setScore(UserCtrl.getUser(), score);
			$(".monster").attr("class", "monster");
			$(".monster").all("p").attr("class", "");
			this.Watcher.clearTimer();
			$("#endScore").html(score);
			$("#gameScore").empty().append($('<span id="totalScore" class="total">0</span>'));
			$("#timer").removeClass("onprocess");
			//var lettersCtrl = new LettersCtrl('Page2', '#J_KeyBoardCircle2');
			$("#debug1").hide();
			this.Game.nextPhase(function() {
				var knob3 = self.Key.knobs[2];
				self.Watcher.leaveOrRestart(knob3.process.bind(knob3));
			});
		},

		showScoreList: function(cb) {
			var self = this;

			this.Watcher.clearTimer();
			var list = UserCtrl.listScore();
			list.sort(function(a,b){return b.score - a.score});
			list.splice(10);
			var tpl = $('.rank-item').html();
			var str = ((function() {
	        	var _i, _len, _results = [];
		        for (_i = 0, _len = list.length; _i < _len; _i++) {
		          var item = list[_i];
		          _results.push(tpl.replace('{name}', item.name).replace('{score}', item.score));
		        }
		        return _results;
			})()).join("");
			$('.rank').all('ul').html("").append(str);
			//var lettersCtrl = new LettersCtrl('Page3', '#J_KeyBoardCircle3');
			if (cb && S.isFunction(cb)) {
				cb();
			}
			this.Game.nextPhase(function() {
				var knob4 = self.Key.knobs[3];
				self.Watcher.leaveOrRestart(knob4.process.bind(knob4));
			});
		}
	};
}, {
	requires: [
		'./soundbox',
		'./user'
	]
});