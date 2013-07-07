// Generated by CoffeeScript 1.3.3
var Circle, LETTER_CHECKING_DELAY, LETTER_CHECKING_TIME, Letter, LettersCtrl;

LETTER_CHECKING_TIME = 3000;

LETTER_CHECKING_DELAY = 300;

Circle = $('#J_KeyBoardCircle').knob({
  thickness: 0.3,
  width: 60
});

LettersCtrl = (function() {

  function LettersCtrl() {
    var letter, letters, _i, _len;
    this.letters = [];
    letters = [["Q", 23, 249], ["W", 99, 249], ["E", 0, 0], ["R", 0, 0], ["T", 0, 0], ["Y", 0, 0], ["U", 0, 0], ["I", 0, 0], ["O", 0, 0], ["P", 0, 0], ["A", 0, 0], ["S", 136, 329], ["D", 213, 329], ["F", 0, 0], ["G", 0, 0], ["H", 0, 0], ["J", 0, 0], ["K", 0, 0], ["L", 0, 0], ["Z", 0, 0], ["X", 0, 0], ["C", 0, 0], ["V", 0, 0], ["B", 0, 0], ["N", 0, 0], ["M", 0, 0]];
    for (_i = 0, _len = letters.length; _i < _len; _i++) {
      letter = letters[_i];
      this.letters.push(new Letter(letter[0], letter[1], letter[2]));
    }
    this.init();
  }

  LettersCtrl.prototype.init = function() {
    this.delayTimer = null;
    this.inputTimer = null;
    return this.inLetter = "";
  };

  LettersCtrl.prototype.bind = function(x, y) {
    var letter,
      _this = this;
    this.x = x;
    this.y = y;
    Circle[0].style.cssText = "position: absolute; left: " + x + "px; top: " + y + "px;";
    letter = this.checkInLetter(x, y);
    if (letter === this.preLetter) {
      return;
    }
    this.preLetter = letter;
    clearTimeout(this.delayTimer);
    clearTimeout(this.inputTimer);
    return this.delayTimer = setTimeout(function() {
      return _this.checkAfterDelay.call(_this);
    }, LETTER_CHECKING_DELAY);
  };

  LettersCtrl.prototype.checkAfterDelay = function() {
    var _this = this;
    this.showProgress();
    return this.inputTimer = setTimeout(function() {
      return _this.inputLetter(_this.preLetter);
    }, LETTER_CHECKING_TIME);
  };

  LettersCtrl.inputLetter = function(letter) {};

  LettersCtrl.prototype.showProgress = function() {
    var value;
    Circle.show().val(0);
    value = 0;
    return this.progressTimer = setInterval(function() {
      var val;
      val = Circle.val();
      return Circle.val(value++);
    }, LETTER_CHECKING_TIME / 100);
  };

  LettersCtrl.prototype.hideProgress = function() {
    return clearInterval(this.progressTimer);
  };

  LettersCtrl.prototype.checkInLetter = function(x, y) {
    var letter, _i, _len, _ref;
    _ref = this.letters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      letter = _ref[_i];
      if (letter.checkIsSelf(x, y)) {
        return letter;
        break;
      }
    }
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
