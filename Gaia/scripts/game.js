/**
 * 游戏基础控制
 * @param  {[type]} S [description]
 * @return {[type]}   [description]
 */
KISSY.add(function (S, Watcher) {
	var $ = S.Node.all,
		App = null;

	// constants
	//var GAME_TIME = 6000;

	var MONSTER = [
		{ CLSNAME: 'm1', SCORE: 1 },
		{ CLSNAME: 'm2', SCORE: 2 },
		{ CLSNAME: 'm3', SCORE: 3 },
		{ CLSNAME: 'm4', SCORE: 4 },
		{ CLSNAME: 'm5', SCORE: 5 },
		{ CLSNAME: 'm6', SCORE: 6 },
		{ CLSNAME: 'm7', SCORE: 7 },
		{ CLSNAME: 'm8', SCORE: 8 },
		{ CLSNAME: 'm9', SCORE: 9 },
		{ CLSNAME: 'm10', SCORE: 10 },
		{ CLSNAME: 'm11', SCORE: 11 },
		{ CLSNAME: 'm12', SCORE: 12 },
		{ CLSNAME: 'm13', SCORE: 13 },
		{ CLSNAME: 'm14', SCORE: 14 },
		{ CLSNAME: 'm15', SCORE: 15 }
	];

	var LEVEL = [
		{ CLSNAME: 'disapear-level1', SCORE: 50,  CHANCE: [0,0,0,0,0,1,1,1,2,2] },
		{ CLSNAME: 'disapear-level2', SCORE: 120, CHANCE: [0,0,0,1,1,1,1,2,2,2] },
		{ CLSNAME: 'disapear-level3', SCORE: 300, CHANCE: [0,0,1,1,1,1,2,2,2,2] },
		{ CLSNAME: 'disapear-level4', SCORE: 400, CHANCE: [0,1,1,1,1,2,2,2,2,2] }
	];

	// variables
	var nil = function() {},
		totalScore = 0,
		currentPhase = 0,
		phase = $('#stage').all('.phase'),
		phaseShowClz = 'bounceInDown',
		knobs = [],
		evts = {
			before: nil,
			start: nil,
			process: nil,
			over: nil
		};

	// helpers
	var __getLevelByUserScore = function(totalScore) {
		if(totalScore >= LEVEL[3].SCORE) return LEVEL[3];
		for(var i = 0; i < 4; i++){
			if(totalScore <= LEVEL[i].SCORE){
				return LEVEL[i];
			}
		}
	};

	var __getMonsterByLevel = function(level) {
		var chance = level.CHANCE,
			fam = chance[Math.random()*chance.length|0],
			start = fam * 5, end = start + 5;
		return MONSTER[(Math.random()*(end-start)|0)+start];
	};

	var __bindEvents = function() {

		phase.on('webkitAnimationEnd', function(){
			$(this).removeClass(phaseShowClz);
		});

		$('#timer').on('webkitAnimationEnd',function(){
			evts.over(totalScore);
		});

		$('#CountDown').on('webkitAnimationEnd', function(el, n){
			n = +( el = $(this)).text();
			el.removeClass('show');
			if (n > 1) {
				el.html(--n);
				setTimeout(function() {
					el.addClass('show');
				}, 10);
			} else {
				el.html(5);
				evts.before();
			}
		});
	};

	var __displayCurrentPhase = function(){
		phase.item(currentPhase).show().addClass(phaseShowClz);
	};

	var __start = function(){
		evts.start(__getHoles());
	};

	var __reset = function(){
		totalScore = 0;
		currentPhase = 0;
	};

	var __goto = function(name, callback){
		var index = currentPhase;
		[].some.call(phase, function(v, i){
			if(v.className == name) {
				index = i;
				return true;
			}
		});
		if(index != currentPhase){
			$(this.phase[currentPhase]).hide();
			currentPhase = index;
			__displayCurrentPhase();
			callback && callback();
		}
	};

	var __getHoles = function(){
		var holeEles = $('#holes li'),
			result = { width: 120, height: 120, holes: [] };

		holeEles.each(function(v, i){
			var offset = $(v).offset();
			result.holes.push({
				index: i,
				x: parseInt($(v).css('left')),
				y: parseInt($(v).css('top'))
			});
		});
		return result;
	};

	var __initGame = function() {
		__reset();
		__bindEvents();
		__displayCurrentPhase();
	};

	var launcherMonster = {
		init: function(){
			var m = $('#sm li'),
				self = this;
			this._m = m;
			this._l = m.length;
			this._tf = "bounce";
			this._timer = null;
			this._i = 300;
			m.on('webkitAnimationEnd', function(){
			  $(this).removeClass(self._tf);
			});
		},

		start: function(){
			var self = this;
			self._timer = setInterval(function(){
	            $(self._m[(Math.random()*self._l)|0]).addClass(self._tf);
        	}, self._i);
      	},

      	stop: function(){
        	clearInterval(this._timer);
        	this._timer = null;
        	this._m.removeClass(this._tf);
      	}
    };

	var init = function(Watcher, app) {
		App = app;
		__initGame();

        Watcher.camStart(Watcher.inspectBg.bind(undefined, Watcher.inspectPerson));
        launcherMonster.init();
        on('before', function() {
            App.start();
        });
    };

	// exports
	var on = function(evtName, handler){
		evts[evtName] = handler;
	};

	var nextPhase = function(callback){
		phase.item(currentPhase).hide();
		currentPhase = Math.min(++currentPhase, phase.length-1);
		__displayCurrentPhase();
		callback && callback();
		phase.item(currentPhase).hasClass('gaming') && __start();
	};

	var restart = function(callback) {
		phase.item(currentPhase).hide();
		__reset();
		currentPhase = 2;
		nextPhase(callback);
	};

	var reset = function(callback) {
		phase.item(currentPhase).hide();
		__reset();
		__displayCurrentPhase();
		callback && callback();
	};

	var getMonster = function() {
		var level = __getLevelByUserScore(totalScore),
			monster = __getMonsterByLevel(level);

		return {
			level: level,
			monster: monster
		}
	};

	var addScore = function(n) {
		return totalScore += n;
	};

	return {
		on: on,
		init: init,
		getMonster: getMonster,
		addScore: addScore,
		nextPhase: nextPhase,
		restart: restart,
		reset: reset,
		launcherMonster: launcherMonster,
		knobs: knobs
	}
}, {
    requires: [
    	'./watcher'
    ]
});
