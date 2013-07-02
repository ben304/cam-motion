Processor = {

	// Constant
	WIDTH: 640,
	HEIGHT: 480,
	AREA_IN_ROW: 16,
	AREA_IN_COL: 16,

	initialized: false,

	// Watching Area
	matrix: [],

	cloneMatrix: [],

	last: null,

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
				row.append($("<td>"+(i*this.AREA_IN_COL+j)+"</td>"));
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

	//快速排序
	/*
	sortQuick: function(array){
		var low = 0, high = array.length-1;

		var sort = function(low, high) {
			if(low == high){
				return;
			}
			var key = array[low];
			var tmplow = low;
			var tmphigh = high;
			while(low < high) {
				while(low < high && key.sum <= array[high].sum) {
					--high;
				}
				array[low] = array[high];
				while(low < high && array[low].sum <= key.sum) {
					++low;
				}
				array[high] = array[low];
				if(low == tmplow) {
					sort(++low, tmphigh);
					return;
				}
			}
			array[low] = key;
			sort(tmplow, low-1);
			sort(high+1, tmphigh);
		}
		sort(low, high);
		return array;
	},*/

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

		this.sortBubble(this.cloneMatrix);
		//console.log("index ", _.pluck(this.cloneMatrix, 'index'));
		//console.log("sum ", _.pluck(this.cloneMatrix, 'sum'));

		var beginner = this.cloneMatrix[0];
		beginner.selected = true;
		selected.push(beginner);
		queue.push(beginner);

		while (queue.length) {
			var base = queue[0];
			start = base.start || 1;
			queue.shift();
			for (var i = start, l = this.cloneMatrix.length; i < l; i++) {
				// 只看覆盖率60%以上的
				if (this.cloneMatrix[i].sum >= TOTAL_IN_AREA*0.6) {
					var distance = Math.abs(this.cloneMatrix[i].index - base.index);
					// 是在base的附近
					if (distance == 1 || distance == 15 || distance == 16 || distance == 17) {
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
		var up = 10000, down = -1, left = 10000, right = -1;
		for (var i = 0, l = selected.length; i < l; i++) {
			var x = selected[i].index%this.AREA_IN_ROW,
				y = Math.floor(selected[i].index/this.AREA_IN_COL);
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

		//console.log([up, right, down, left]);
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

		//console.log([i_top, i_left]);
		var ball = document.getElementById("hammer");
		ball.style.left = i_left+"px";
		ball.style.top = i_top+"px";

		//var area = (pos[1]-pos[3])*(pos[2]-pos[0]);
		//console.log(area);
		app.hit(i_left, i_top);
	},

	startup: function(pixels) {
		if (!this.initialized) {
			this.makeArray();
			this.makeGrid($("#gridContainer"));
			this.initialized = true;
		}
		this.collectData(pixels);
		this.handleData();
	}
};

