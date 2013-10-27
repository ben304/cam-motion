/**
 * loading相关事件
 * @return {[type]} [description]
 */
KISSY.add(function(S, Knob, SoundBox) {

    var $ = S.Node.all;
    var Game, Core, knobs = [], rate = 0;

    var keyWidth = 120,
        letterMap = {
            '3': [{
                key: "Restart",
                range: {x:223, y:290, w:150, h:130},
                center: {x:245, y:300}
              }, {
                key: "Rank",
                range: {x:433, y:290, w:150, h:130},
                center: {x:456, y:300}
              }],
            '4': [{
                key: "Restart",
                range: {x:352, y:430, w:120, h:120},
                center: {x:352, y:430}
              }]
        };

    var config = function(game, core) {
        Game = game;
        Core = core;
        init();
    };

    var init = function() {
        var knob1 = new Knob($(".loading1"), 100);
        knobs.push(knob1);
        var knob2 = new Knob($(".loading2"), 100);
        knobs.push(knob2);
        var knob3 = new Knob($(".loading3"), 100, function() {
            knob3.inputLetter(knob3.preLetter);
        });
        knobs.push(knob3);
        var knob4 = new Knob($(".loading4"), 100, function() {
            knob4.inputLetter(knob4.preLetter);
        });
        knobs.push(knob4);

        S.mix(Knob.prototype, {
            process: process,
            checkInLetter: checkInLetter,
            checkIsSelf: checkIsSelf,
            inputLetter: inputLetter
        });
    };

    var process = function(x, y) {
        var letter, rx, ry,
            _this = this;

        letter = this.checkInLetter(x, y);
        rx = letter ? letter.center.x : x;
        ry = letter ? letter.center.y : y;
        this.el[0].style.cssText = "position: absolute; left: " + rx + "px; top: " + ry + "px;";
        if (!this.preLetter) {
              this.preLetter = {};
              return;
        }

        if (letter && letter.key === this.preLetter.key) {
              rate += 10;
              this.draw(rate);
        } else if (!letter || letter !== this.preLetter) {
              rate = 0;
              this.reset();
        }
        this.preLetter = letter;
    };

    var checkInLetter = function(x, y) {
        var letter, _i, _len, _ref, key
            _ref = letterMap[this.no];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            if (letter = this.checkIsSelf(x, y, key)) {
                return letter;
            }
        }
        return false;
    };

    var checkIsSelf = function(x, y, key) {
        var range = key.range;
        if (x >= range.x && x <= (range.x+range.w) && y >= range.y && y <= (range.y+range.h)) {
            return key;
        } else {
            return false;
        }
    };

    var inputLetter = function(letter) {
        var self = this;
        if (!letter || this.disabled) {
          return;
        }
        SoundBox.play('ding');
        if (letter.key === "Restart") {
          this.disabled = true;
          return Game.restart(function() {
              self.disabled = false;
              Core.restart();
          });
        } else if (letter.key === "Rank") {
          this.disabled = true;
          return Core.showScoreList(function() {
              self.disabled = false;
          });
        }
    };

    return {
        config: config,
        knobs: knobs
    };
}, {
    requires: [
        './knob',
        './soundbox'
    ]
});
