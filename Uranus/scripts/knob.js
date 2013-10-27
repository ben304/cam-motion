/**
 * 基于canvas实现的loading
 * @author gonghao.gh
 * @param  {[type]} S [description]
 * @return {[type]}   [description]
 */
KISSY.add(function(S) {
	var $ = S.Node.all;

	var Knob = function(el, rect, callback) {
		this.el = el;
		this.no = el.attr("data-no");
		this.cb = callback;
		this.init(rect);
	};

	Knob.prototype = {
		init: function(rect) {
			this.canvas = $("<canvas width="+rect+" height="+rect+"></cavas>");
			this.context = this.canvas[0].getContext("2d");
			this.canvas.appendTo(this.el);

			this.halfRect = rect/2;
			this.linecap = "butt";
			this.bgColor = "#EEEEEE";
			this.fgColor = "#87CEEB";
			this.lineWidth = 15;
			this.radius = this.halfRect-this.lineWidth;
			this.startAngle = 1.5*Math.PI;
			this.currentAngle = 1.5*Math.PI;
			this.angleArc = 2*Math.PI;

			this.drawBg();
		},

		reset: function() {
			this.canvas[0].width = this.canvas[0].width;
			this.drawBg();
			this.el.all(".text").text("0%");
			this.currentAngle = this.startAngle;
		},

		angle: function (v) {
            return v * this.angleArc / 100;
        },

        drawBg: function() {
        	var c = this.context;

        	c.lineWidth = this.lineWidth;
			c.linecap = this.linecap;

			c.beginPath();
            c.strokeStyle = this.bgColor;
            c.arc(this.halfRect, this.halfRect, this.radius, 0, 2*Math.PI, true);
        	c.stroke();

        	this.el.all(".text").text("0%");
        },

		draw: function(v) {
			var c = this.context,
				arc = this.startAngle+this.angle(v);

			this.el.all(".text").text(v+"%");

			c.lineWidth = this.lineWidth;
			c.linecap = this.linecap;

        	c.beginPath();
            c.strokeStyle = this.fgColor;
            c.arc(this.halfRect, this.halfRect, this.radius, this.currentAngle, arc, false);
        	c.stroke();
        	this.currentAngle = arc-0.1;
        	if (v >= 100 && this.cb && S.isFunction(this.cb)) {
        		this.cb();
        	}
		}
	};

	return Knob;
});