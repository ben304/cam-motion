void function(global){
	//根据用户总得分获得关卡
	function getLevelByUserScore(totalScore){
		if(totalScore >= LEVEL[3].SCORE) return LEVEL[3];
		for(var i = 0; i < 4; i++){
			if(totalScore <= LEVEL[i].SCORE){
				return LEVEL[i];
			}
		}
	}
	//根据关卡获得怪物
	function getMonsterByLevel(level){
		var chance = level.CHANCE,
			fam = chance[Math.random()*chance.length|0],
			start = fam * 5, end = start + 5;
		return MONSTER[(Math.random()*(end-start)|0)+start];
	}
	
	var totalScore = 0,
		currentPhase = 0,
		tf = 'bounceInDown',
		f = function() { },
		evts = {
			start: f,
			process: f,
			over: f
		};
	
	function Game(){
		this.phase = $('#stage>div');
		this.evts = evts;
		this._reset();
		this._addPhaseEvent();
		this._displayCurrentPhase();
	}
	$.extend(Game.prototype, {
		_displayCurrentPhase: function(){
			$(this.phase[currentPhase]).show().addClass(tf);
		},
		_addPhaseEvent: function(){
			this.phase.bind('webkitAnimationEnd', function(){
				$(this).removeClass(tf);
			});
		},
		_start: function(){
			var i = 0, end = GAME_TIME/1000, context = this;
			var timer = setInterval(function(){
				if(i >= end){
					clearInterval(timer);
					timer = null;
					context.evts.over(totalScore);
					return;
				}
				context.evts.process(i++);
			}, 1000);
			this.evts.start(this._getHoles());
		},
		_reset: function(){
			totalScore = 0, currentPhase = 0;
			$('#holds .monster').each(function(i, v){
				v.className = 'monster';
			});
		},
		_getHoles: function(){
			var holeEles = $('#holes li'),
				result = { width: 120, height: 120, holes: [] }
			holeEles.each(function(i, v){
				var offset = $(v).offset();
				result.holes.push({
					index: i,
					x: parseInt($(v).css('left')),
					y: parseInt($(v).css('top'))
				});
			});
			return result;
		},
		on: function(evtName, handler){
			this.evts[evtName] = handler;
			return this;
		},
		nextPhase: function(callback){
			$(this.phase[currentPhase]).hide();
			currentPhase = Math.min(++currentPhase, this.phase.length-1);
			this._displayCurrentPhase();
			callback && callback();
			$(this.phase[currentPhase]).hasClass('gaming') && this._start();
			return this;
		},
		restart: function(){
			this._reset();
			this.nextPhase();
		},
		getMonster: function(){
			var level = getLevelByUserScore(totalScore),
				monster = getMonsterByLevel(level);
			return {
				level: level,
				monster: monster
			}
		},
		addScore: function(n){
			return totalScore += n;
		}
	});
	global.Game = Game;
		
}(window);
