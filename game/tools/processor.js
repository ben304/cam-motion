/**
 * 监测图像核心对象
 * @type {Object}
 */
Processor = {

	/*---- 常数 ----*/
	// 用于侦测颜色
	TIMES_RATE: 2,
	_WIDTH: 640,
	_HEIGHT: 480,

	// 用于游戏
	WIDTH: 800,
	HEIGHT: 600,
	AREA_IN_ROW: 50,
	AREA_IN_COL: 50,

	/*---- 全局变量 ----*/
	initialized: false,

	// 用于缓存侦测的值
	res: [false, false, false],
	current: 0,
	// 1代表边框的线
	LEFT: 155+1,
	RIGHT: 175+1,
	TOP: 120+1,
	BOTTOM: 140+1,

	// Watching Area
	matrix: [],
	cloneMatrix: [],
	last: {up: 0, right: 0, down: 0, left: 0},

	// 用于查找指定颜色所在区域
	// -------------------------------------------------------------start
	makeArray: function() {
		var total = this.AREA_IN_ROW * this.AREA_IN_COL;
		for (var i = 0; i < total; i++) {
			this.matrix.push({index: i, sum: 0});
		}
	},

	makeGrid: function(container) {
		for (var i = 0; i < this.AREA_IN_COL; i++) {
			var row = $("<tr>");
			for (var j = 0; j < this.AREA_IN_ROW; j++) {
				row.append($("<td></td>"));
			}
			container.append(row);
		}
	},

	sortBubble: function(array) {
		var len = array.length, i, j, tmp;
		for(i = len-1; i >= 1; i--){
			for(j = 0; j <= i-1; j++){
				if(array[j].sum < array[j+1].sum) {
					tmp = array[j+1];
					array[j+1] = array[j];
					array[j] = tmp;
				}
			}
		}
		return array;
	},

	// Get area from x & y
	getPos: function(x, y) {
		var w_per_area = this.WIDTH/this.AREA_IN_ROW,
			h_per_area = this.HEIGHT/this.AREA_IN_COL;
		return Math.floor(x/w_per_area)+this.AREA_IN_ROW*Math.floor(y/h_per_area);
	},

	collectData: function(pixels) {
		var d = pixels.data;
		$.extend(true, this.cloneMatrix, this.matrix);
		for (var i = 0, l = d.length; i < l; i++) {
			if (d[i] == 0 && d[i+1] == 0 && d[i+2] == 0) {
				var pixel = i/4,
					x = pixel % this.WIDTH,
					y = Math.floor(pixel/this.WIDTH),
					pos = this.getPos(x, y);

				this.cloneMatrix[pos].sum += 1;
			}
		}
	},

	handleData: function() {
		var w_per_area = this.WIDTH/this.AREA_IN_ROW,
			h_per_area = this.HEIGHT/this.AREA_IN_COL,
			TOTAL_IN_AREA = w_per_area*h_per_area,
			selected = [],
			queue = [],
			start = 1;

		//this.sortBubble(this.cloneMatrix);
		this.cloneMatrix.sort(function(a, b) {return b.sum - a.sum;})
		//console.log("index ", _.pluck(this.cloneMatrix, 'index'));
		//console.log("sum ", _.pluck(this.cloneMatrix, 'sum'));

		var beginner = this.cloneMatrix[0];
		if (beginner.sum >= TOTAL_IN_AREA*0.6) {
			beginner.selected = true;
			selected.push(beginner);
			queue.push(beginner);
		}

		while (queue.length) {
			var base = queue[0];
			start = base.start || 1;
			queue.shift();
			for (var i = start, l = this.cloneMatrix.length; i < l; i++) {
				// 只看覆盖率60%以上的
				if (this.cloneMatrix[i].sum >= TOTAL_IN_AREA*0.6) {
					var distance = Math.abs(this.cloneMatrix[i].index - base.index);
					// 是在base的附近
					if (distance == 1 || distance == 49 || distance == 50 || distance == 51) {
						selected.push(this.cloneMatrix[i]);
						// 如果后面的元素也是占满的，检测它附近的
						if (this.cloneMatrix[i].sum == TOTAL_IN_AREA && !this.cloneMatrix[i].selected) {
							// 防止无限递归
							this.cloneMatrix[i].selected = true;
							this.cloneMatrix[i].start = i;
							queue.push(this.cloneMatrix[i]);
						}
					} else if (this.cloneMatrix[i].sum == TOTAL_IN_AREA && !this.cloneMatrix[i].selected) {
						// 防止无限递归
						this.cloneMatrix[i].selected = true;
						this.cloneMatrix[i].start = i;
						queue.push(this.cloneMatrix[i]);
					}
				// 由于是降序，一旦不满足直接跳出
				} else {
					break;
				}
			}
		}
		//console.log("minied ", _.pluck(selected, 'index'));

		this.selectRect(selected);
	},

	// 特定的形状从上到下占三格
	selectRect: function(selected) {
		var up = 10000, down = -1, left = 10000, right = -1, pos;
		for (var i = 0, l = selected.length; i < l; i++) {
			var x = selected[i].index%this.AREA_IN_ROW,
				y = Math.floor(selected[i].index/this.AREA_IN_COL);
			// max region
			if (x < left) {
				left = x;
			}
			if (x+1 > right) {
				right = x+1;
			}
			if (y < up) {
				up = y;
			}
			if (y+1 > down) {
				down = y+1;
			}
			// min region
			/*
			if (i == 0) {
				left = x;
				right = x+1;
				up = y;
				down = y+1;
			} */
		}
		if (!selected.length) {
			up = this.last.up;
			right = this.last.right;
			down = this.last.down;
			left = this.last.left;
		} else {
			this.last.up = up;
			this.last.right = right;
			this.last.down = down;
			this.last.left = left;
		}

		this.calCenter([up, right, down, left]);
	},

	calCenter: function(pos) {
		var w_per_area = this.WIDTH/this.AREA_IN_ROW,
			h_per_area = this.HEIGHT/this.AREA_IN_COL,
			top = pos[0]*h_per_area,
			left = pos[3]*w_per_area,
			height = (pos[2]-pos[0])*h_per_area/2,
			width = (pos[1]-pos[3])*w_per_area/2;

		var i_top = top + height,
			i_left = left + width;

		if (this.callback && $.isFunction(this.callback)) {
			this.callback(i_left, i_top);
		}
	},
	// -------------------------------------------------------------end

	// 用于侦测颜色
	// 记录黑白区别，以判断是否停止运动
	// -------------------------------------------------------------start
	isStop: function(pixels) {
		var data = pixels.data,
			NUM_IN_ROW = this._WIDTH*4,
			white = 0,
			black = 0,
			counter = 0;

		// 根据倍率设置区域大小
		var J_START = this.TOP * this.TIMES_RATE,
			J_END = this.BOTTOM * this.TIMES_RATE,
			I_STRAT = this.LEFT * this.TIMES_RATE,
			I_END = this.RIGHT * this.TIMES_RATE;

		for (var j = J_START; j < J_END; j++) {
			var prev = NUM_IN_ROW*(j-1);
			for (var i = I_STRAT; i < I_END; i++) {
				var start = prev + (i-1)*4;
				if (data[start] == 255 && data[start+1] == 255 && data[start+2] == 255) {
					white += 1;
				} else if (data[start] == 0 && data[start+1] == 0 && data[start+2] == 0) {
					black += 1;
				}
				counter++;
			}
		}
		//console.log(white, black, black/(black+white), counter);
		if (black/(black+white) > 0.98) {
			return true;
		} else {
			return false;
		}
	},

	takeColor: function(pixels) {
		var data = pixels.data;
		var NUM_IN_ROW = this._WIDTH*4, white = 0, black = 0, counter = 0;
		var r_t = 0, g_t = 0, b_t = 0, i_t = 0, r, g, b;

		// 根据倍率设置区域大小
		var J_START = this.TOP * this.TIMES_RATE,
			J_END = this.BOTTOM * this.TIMES_RATE,
			I_STRAT = this.LEFT * this.TIMES_RATE,
			I_END = this.RIGHT * this.TIMES_RATE;

		for (var j = 242; j < 282; j++) {
			var prev = NUM_IN_ROW*(j-1);
			for (var i = 312; i < 352; i++) {
				var start = prev + (i-1)*4;
				var ri = data[start], gi = data[start+1], bi = data[start+2];
				//console.log(ri, gi, bi);
				r_t += ri;
				g_t += gi;
				b_t += bi;
				i_t += 1;
			}
		}
		r = Math.floor(r_t/i_t);
		g = Math.floor(g_t/i_t);
		b = Math.floor(b_t/i_t);

		return {r:r, g:g, b:b};
	},

	detectColor: function(pixels, real) {
		var once;

		once = this.isStop(pixels);
		this.res[this.current] = once;
		this.current = (this.current+1)%3;
		if (this.res[0] && this.res[1] && this.res[2]) {
			console.log(this.res);
			return this.takeColor(real);
		} else {
			return false;
		}
	},
	// -------------------------------------------------------------end

	startup: function(pixels, callback) {
		if (!this.initialized) {
			this.makeArray();
			//this.makeGrid($("#gridContainer"));
			this.initialized = true;
		}
		this.callback = callback;
		this.collectData(pixels);
		this.handleData();
	}
};

