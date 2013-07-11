//游戏时长设置（毫秒）
var GAME_TIME = 6000;

//怪物对象集
var MONSTER = [
	/* A类怪 5 等级 */
	{ CLSNAME: 'm1', SCORE: 1 },
	{ CLSNAME: 'm2', SCORE: 2 },
	{ CLSNAME: 'm3', SCORE: 3 },
	{ CLSNAME: 'm4', SCORE: 4 },
	{ CLSNAME: 'm5', SCORE: 5 },
	/* B类怪 5 等级 */
	{ CLSNAME: 'm6', SCORE: 6 },
	{ CLSNAME: 'm7', SCORE: 7 },
	{ CLSNAME: 'm8', SCORE: 8 },
	{ CLSNAME: 'm9', SCORE: 9 },
	{ CLSNAME: 'm10', SCORE: 10 },
	/* C类怪 5 等级 */
	{ CLSNAME: 'm11', SCORE: 11 },
	{ CLSNAME: 'm12', SCORE: 12 },
	{ CLSNAME: 'm13', SCORE: 13 },
	{ CLSNAME: 'm14', SCORE: 14 },
	{ CLSNAME: 'm15', SCORE: 15 }
];

//关卡等级集（4个关卡出现的怪物类别概率和速度不同）
var LEVEL = [ 
	{ CLSNAME: 'disapear-level1', SCORE: 50,  CHANCE: [0,0,0,0,0,1,1,1,2,2] },
	{ CLSNAME: 'disapear-level2', SCORE: 120, CHANCE: [0,0,0,1,1,1,1,2,2,2] },
	{ CLSNAME: 'disapear-level3', SCORE: 300, CHANCE: [0,0,1,1,1,1,2,2,2,2] },
	{ CLSNAME: 'disapear-level4', SCORE: 400, CHANCE: [0,1,1,1,1,2,2,2,2,2] }
];
