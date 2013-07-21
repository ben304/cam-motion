/**
 * 监测图像核心对象
 * @type {Object}
 */
KISSY.add(function(S, Game) {

	/*---- 常数 ----*/
	// 用于侦测颜色
	var TIMES_RATE = 2,
		_WIDTH = 640,
		_HEIGHT = 480;

	// 用于游戏
	var WIDTH = 800,
		HEIGHT = 600,
		AREA_IN_ROW = 50,
		AREA_IN_COL = 50;

	/*---- 全局变量 ----*/
	var initialized = false;

	// 用于缓存侦测的值
	var nTimes = 0,
		res = [false, false, false],
		current = 0,
		// 1代表边框的线
		LEFT = 155+1,
		RIGHT = 175+1,
		TOP = 120+1,
		BOTTOM = 140+1;

	// Watching Area
	var matrix = [],
		cloneMatrix = [],
		last = {up: 0, right: 0, down: 0, left: 0};

	var __cb = function() {};

	// 用于查找指定颜色所在区域
	// -------------------------------------------------------------start
	var __makeArray = function() {
		var total = AREA_IN_ROW * AREA_IN_COL;
		for (var i = 0; i < total; i++) {
			matrix.push({index: i, sum: 0});
		}
	};

	// Get area from x & y
	var __getPos = function(x, y) {
		var w_per_area = WIDTH/AREA_IN_ROW,
			h_per_area = HEIGHT/AREA_IN_COL;
		return Math.floor(x/w_per_area)+AREA_IN_ROW*Math.floor(y/h_per_area);
	};

	var __collectData = function(pixels) {
		var d = pixels.data;
		cloneMatrix = S.clone(matrix);
		for (var i = 0, l = d.length; i < l; i+=4) {
			if (d[i] == 0 && d[i+1] == 0 && d[i+2] == 0) {
				var pixel = i/4,
					x = pixel % WIDTH,
					y = Math.floor(pixel/WIDTH),
					pos = __getPos(x, y);

				cloneMatrix[pos].sum += 1;
			}
		}
	};

	var __handleData = function() {
		var w_per_area = WIDTH/AREA_IN_ROW,
			h_per_area = HEIGHT/AREA_IN_COL,
			TOTAL_IN_AREA = w_per_area*h_per_area,
			selected = [],
			queue = [],
			start = 1;

		cloneMatrix.sort(function(a, b) {return b.sum - a.sum;});

		var beginner = cloneMatrix[0];
		if (beginner.sum >= TOTAL_IN_AREA*0.6) {
			beginner.selected = true;
			selected.push(beginner);
			queue.push(beginner);
		}

		while (queue.length) {
			var base = queue[0];
			start = base.start || 1;
			queue.shift();
			for (var i = start, l = cloneMatrix.length; i < l; i++) {
				// 只看覆盖率60%以上的
				if (cloneMatrix[i].sum >= TOTAL_IN_AREA*0.6) {
					var distance = Math.abs(cloneMatrix[i].index - base.index);
					// 是在base的附近
					if (distance == 1 || distance == 49 || distance == 50 || distance == 51) {
						selected.push(cloneMatrix[i]);
						// 如果后面的元素也是占满的，检测它附近的
						if (cloneMatrix[i].sum == TOTAL_IN_AREA && !cloneMatrix[i].selected) {
							// 防止无限递归
							cloneMatrix[i].selected = true;
							cloneMatrix[i].start = i;
							queue.push(cloneMatrix[i]);
						}
					} else if (cloneMatrix[i].sum == TOTAL_IN_AREA && !cloneMatrix[i].selected) {
						// 防止无限递归
						cloneMatrix[i].selected = true;
						cloneMatrix[i].start = i;
						queue.push(cloneMatrix[i]);
					}
				// 由于是降序，一旦不满足直接跳出
				} else {
					break;
				}
			}
		}
		__selectRect(selected);
	};

	var __selectRect = function(selected) {
		var up = 10000, down = -1, left = 10000, right = -1;
		for (var i = 0, l = selected.length; i < l; i++) {
			var x = selected[i].index%AREA_IN_ROW,
				y = Math.floor(selected[i].index/AREA_IN_COL);
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
		}
		if (!selected.length) {
			up = last.up;
			right = last.right;
			down = last.down;
			left = last.left;
		} else {
			last.up = up;
			last.right = right;
			last.down = down;
			last.left = left;
		}

		__calCenter([up, right, down, left]);
	};

	var __calCenter = function(pos) {
		var w_per_area = WIDTH/AREA_IN_ROW,
			h_per_area = HEIGHT/AREA_IN_COL,
			top = pos[0]*h_per_area,
			left = pos[3]*w_per_area,
			height = (pos[2]-pos[0])*h_per_area/2,
			width = (pos[1]-pos[3])*w_per_area/2;

		var i_top = top + height,
			i_left = left + width;

		if (__cb && S.isFunction(__cb)) {
			__cb(i_left, i_top);
		}
	};
	// -------------------------------------------------------------end

	// 用于侦测颜色
	// 记录黑白区别，以判断是否停止运动
	// -------------------------------------------------------------start
	var __isStop = function(pixels) {
		var data = pixels.data,
			NUM_IN_ROW = _WIDTH*4,
			white = 0,
			black = 0,
			counter = 0;

		// 根据倍率设置区域大小
		var J_START = TOP * TIMES_RATE,
			J_END = BOTTOM * TIMES_RATE,
			I_STRAT = LEFT * TIMES_RATE,
			I_END = RIGHT * TIMES_RATE;

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
		return black/(black+white) > 0.98;
	};

	var __takeColor = function(pixels) {
		var data = pixels.data;
		var NUM_IN_ROW = _WIDTH*4;
		var r_t = 0, g_t = 0, b_t = 0, i_t = 0, r, g, b;

        // 获取特定区域的颜色
		for (var j = 242; j < 282; j++) {
			var prev = NUM_IN_ROW*(j-1);
			for (var i = 312; i < 352; i++) {
				var start = prev + (i-1)*4;
				r_t += data[start];
				g_t += data[start+1];
				b_t += data[start+2];
				i_t += 1;
			}
		}
		r = Math.floor(r_t/i_t);
		g = Math.floor(g_t/i_t);
		b = Math.floor(b_t/i_t);

		return {r:r, g:g, b:b};
	};

	var detectColor = function(pixels, real, process, reset) {
		var once;

		once = __isStop(pixels);
		res[current] = once;
		current = (current+1)%3;
		if (res[0] && res[1] && res[2] && nTimes>=100) {
			//console.log(res);
			nTimes = 0;
			res = [false, false, false];
			current = 0;
			return __takeColor(real);
		}
		if (once) {
			nTimes+=1.2;
			if (process && S.isFunction(process)) {
				process(nTimes);
			}
			return false;
		} else {
			nTimes = 0;
			if (reset && S.isFunction(reset)) {
				reset();
			}
			return false;
		}
	};
	// -------------------------------------------------------------end

	var startup = function(pixels, callback) {
		if (!initialized) {
			__makeArray();
			initialized = true;
		}
		__cb = callback;
		__collectData(pixels);
		__handleData();
	};

	return {
		detectColor: detectColor,
		startup: startup
	}
});

