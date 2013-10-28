/**
 * 游戏主体逻辑
 * @param  {[type]} S       [description]
 * @param  {[type]} Game    [description]
 * @param  {[type]} Watcher [description]
 * @return {[type]}         [description]
 */
KISSY.add(function(S, SoundBox) {

	var $ = S.Node.all,
		hammer = $(".hammer");

	return {

		mapArea: [],

		initialized: false,

		// 最小为1
		current: null,

		holeRect: {w: 0, h: 0},

		config: function(game, listener) {
			this.Game = game;
            this.Listener = listener;
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

		hit: function(left, top, hit) {
			var that = this;
			hammer.css({"left": left, "top": top});
			if (hit) {
                if (this.current != null) {
                    var monster = $(".monster").item(this.current-1),
                        score = parseInt(monster.attr("data-score"));

                    if (this.checkCollision(left, top, monster)) {
                        var totalScore = this.Game.addScore(score);
                        this.showScore(score, totalScore);

                        hammer.addClass("bang");
                        monster.data("hit", true);
                        monster.addClass("pause");
                        monster.addClass("hit");
                        SoundBox.play('HIT');
                        this.Listener.sendScore(score, totalScore);
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
		    self.Game.nextPhase(function() {
		        self.Game.on('start', function(mapArea) {
		          self.init(mapArea);
		          //TODO: kinect绑定
		        });
		        self.Game.on('over', function(score) {
		          self.stop(score);
		        });
		    });
		},

		restart: function() {
			var self = this;
            // TODO: kinect解除绑定
			self.Game.on('start', function(mapArea) {
			  	$("#totalScore").html(0);
	          	self.init(mapArea);
	        });
	        self.Game.on('over', function(score) {
	          	self.stop(score);
	        });
            //TODO: kinect绑定
		},

		// 停止游戏
		stop: function(score) {
			var self = this;
            this.Listener.sendEnd(score);
            // TODO: kinect解除绑定
			this.initialized = false;
			this.unbindEvent();
			$(".monster").attr("class", "monster");
			$(".monster").all("p").attr("class", "");
			$("#endScore").html(score);
			$("#gameScore").empty().append($('<span id="totalScore" class="total">0</span>'));
			$("#timer").removeClass("onprocess");
            self.Game.nextPhase();
		}
	};
}, {
	requires: [
		'./soundbox'
	]
});