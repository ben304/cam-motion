// Generated by CoffeeScript 1.3.3
var LETTER_CHECKING_DELAY, LETTER_CHECKING_TIME, Letter, LettersCtrl, Page1_Letters, Page2_Letters, Page3_Letters;

LETTER_CHECKING_TIME = 300;

LETTER_CHECKING_DELAY = 100;

Page1_Letters = [["Q", 23, 249], ["W", 99, 249], ["E", 175, 249], ["R", 252, 249], ["T", 330, 249], ["Y", 407, 249], ["U", 484, 249], ["I", 561, 249], ["O", 637, 249], ["P", 713, 249], ["A", 60, 328], ["S", 136, 328], ["D", 213, 328], ["F", 289, 328], ["G", 367, 328], ["H", 445, 328], ["J", 521, 328], ["K", 598, 328], ["L", 675, 328], ["Z", 97, 410], ["X", 173, 410], ["C", 250, 410], ["V", 326, 410], ["B", 404, 410], ["N", 481, 410], ["M", 558, 410], ["BackSpace", 531, 110], ["Enter", 655, 110]];

Page2_Letters = [["Restart", 0, 0], ["Rank", 0, 0]];

Page3_Letters = [["Restart", 0, 0]];

LettersCtrl = (function() {

  function LettersCtrl(page, cirleSelector) {
    var letter, letters, _i, _len;
    this.letters = [];
    this.circleInput = $(cirleSelector);
    this.circle = this.circleInput.knob({
      thickness: 0.3,
      width: 60
    });
    letters = window[page + "_Letters"];
    for (_i = 0, _len = letters.length; _i < _len; _i++) {
      letter = letters[_i];
      this.letters.push(new Letter(letter[0], letter[1], letter[2]));
    }
    this.init();
  }

  LettersCtrl.prototype.init = function() {
    var _this = this;
    this.delayTimer = null;
    this.inputTimer = null;
    this.inLetter = "";
    return this.cirle.bind('change', function(ev) {
      if (ev.target.value >= 100) {
        return _this.inputLetter(_this.preLetter);
      }
    });
  };

  LettersCtrl.prototype.bind = function(x, y) {
    var letter,
      _this = this;
    this.x = x - 33;
    this.y = y - 33;
    letter = this.checkInLetter(x, y);
    this.cirle[0].style.cssText = "position: absolute; left: " + this.x + "px; top: " + this.y + "px;";
    if (letter === this.preLetter) {
      return;
    }
    clearTimeout(this.delayTimer);
    clearTimeout(this.inputTimer);
    this.hideProgress();
    this.preLetter = letter;
    if (!letter) {
      return;
    }
    return this.delayTimer = setTimeout(function() {
      return _this.checkAfterDelay.call(_this);
    }, LETTER_CHECKING_DELAY);
  };

  LettersCtrl.prototype.checkAfterDelay = function() {
    return this.showProgress();
  };

  LettersCtrl.prototype.inputLetter = function(letter) {
    var val;
    console.log(letter);
    if (!letter) {
      return;
    }
    SoundBox.play('ding');
    val = $('#username').val();
    if (letter.letter === "BackSpace") {
      return $('#username').val(val.substring(0, val.length - 1));
    } else if (letter.letter === "Enter") {
      Watcher.clearTimer();
      return game.nextPhase(function() {
        game.on('start', function(mapArea) {
          return App.init(mapArea);
        }).on("process", function(i) {
          return App.process(i);
        }).on('over', function(score) {
          return App.stop(score);
        });
        return Watcher.gameStart.bind(void 0, App.hit.bind(App))();
      });
    } else {
      val = $('#username').val();
      return $('#username').val(val + letter.letter);
    }
  };

  LettersCtrl.prototype.showProgress = function() {
    var value,
      _this = this;
    this.isStart = true;
    this.cirleInput.val(6).trigger('change');
    clearInterval(this.progressTimer);
    value = 6;
    this.progressTimer = setInterval(function() {
      if (value >= 100) {
        return;
      }
      value = value + 6;
      return _this.cirleInput.val(value).trigger('change');
    }, LETTER_CHECKING_TIME / 17);
  };

  LettersCtrl.prototype.hideProgress = function() {
    this.isStart = false;
    this.cirleInput.val(0).trigger('change');
    return clearInterval(this.progressTimer);
  };

  LettersCtrl.prototype.checkInLetter = function(x, y) {
    var letter, _i, _len, _ref;
    _ref = this.letters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      letter = _ref[_i];
      if (letter.checkIsSelf(x, y)) {
        this.x = letter.x;
        this.y = letter.y;
        console.log(letter);
        return letter;
        break;
      }
    }
    return false;
  };

  return LettersCtrl;

})();

Letter = (function() {

  Letter.prototype.width = 66;

  Letter.prototype.height = 66;

  function Letter(letter, x, y) {
    this.letter = letter;
    this.x = x;
    this.y = y;
    this.r = x + this.width;
    this.b = y + this.height;
  }

  Letter.prototype.checkIsSelf = function(x, y) {
    return x >= this.x && x <= this.r && y >= this.y && y <= this.b;
  };

  return Letter;

})();
