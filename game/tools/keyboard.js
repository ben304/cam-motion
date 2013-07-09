// Generated by CoffeeScript 1.3.3
var LETTER_CHECKING_DELAY, LETTER_CHECKING_TIME, Letter, LettersCtrl, Page1_Letters, Page1_Width, Page2_Letters, Page2_Width, Page3_Letters, Page3_Width;

LETTER_CHECKING_TIME = 300;

LETTER_CHECKING_DELAY = 100;

Page1_Letters = [["Q", 23, 249], ["W", 99, 249], ["E", 175, 249], ["R", 252, 249], ["T", 330, 249], ["Y", 407, 249], ["U", 484, 249], ["I", 561, 249], ["O", 637, 249], ["P", 713, 249], ["A", 60, 328], ["S", 136, 328], ["D", 213, 328], ["F", 289, 328], ["G", 367, 328], ["H", 445, 328], ["J", 521, 328], ["K", 598, 328], ["L", 675, 328], ["Z", 97, 410], ["X", 173, 410], ["C", 250, 410], ["V", 326, 410], ["B", 404, 410], ["N", 481, 410], ["M", 558, 410], ["BackSpace", 531, 110], ["Enter", 655, 110]];

Page2_Letters = [["Restart", 238, 295], ["Rank", 447, 295]];

Page3_Letters = [["Restart", 362, 445]];

Page1_Width = 66;

Page2_Width = 120;

Page3_Width = 80;

LettersCtrl = (function() {

  function LettersCtrl(page, circleSelector) {
    var letter, letters, _i, _len;
    this.letters = [];
    this.circleInput = $(circleSelector);
    this.circle = this.circleInput.knob({
      thickness: 0.3,
      width: 60
    });
    letters = window[page + "_Letters"];
    this.width = window[page + "_Width"];
    for (_i = 0, _len = letters.length; _i < _len; _i++) {
      letter = letters[_i];
      this.letters.push(new Letter(letter[0], letter[1], letter[2], this.width));
    }
    this.init();
  }

  LettersCtrl.prototype.init = function() {
    var _this = this;
    this.delayTimer = null;
    this.inputTimer = null;
    this.inLetter = "";
    return this.circle.bind('change', function(ev) {
      if (ev.target.value >= 100) {
        return _this.inputLetter(_this.preLetter);
      }
    });
  };

  LettersCtrl.prototype.bind = function(x, y) {
    var letter,
      _this = this;
    this.x = x - this.width / 2;
    this.y = y - this.width / 2;
    letter = this.checkInLetter(x, y);
    this.circle[0].style.cssText = "position: absolute; left: " + this.x + "px; top: " + this.y + "px;";
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
    var item, lettersCtrl, list, str, tpl, user, val;
    console.log(letter);
    if (!letter) {
      return;
    }
    SoundBox.play('ding');
    val = $('#username').val();
    if (letter.letter === "BackSpace") {
      return $('#username').val(val.substring(0, val.length - 1));
    } else if (letter.letter === "Enter") {
      user = UserCtrl.addUser($('#username').val() || "GUY");
      UserCtrl.setUser(user);
      return App.start();
    } else if (letter.letter === "Restart") {
      return game.reset(Watcher.inspectBg.bind(void 0, Watcher.inspectPerson));
    } else if (letter.letter === "Rank") {
      list = UserCtrl.listScore();
      list.sort(function(a, b) {
        return a.score - b.score;
      });
      tpl = $('.rank-item').html();
      str = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          item = list[_i];
          _results.push(tpl.replace('{name}', item.name).replace('{score}', item.score));
        }
        return _results;
      })()).join("");
      $('.rank ul').append(str);
      lettersCtrl = new LettersCtrl('Page2', '#J_KeyBoardCircle2');
      return game.nextPhase(function() {
        return Watcher.leaveOrRestart(lettersCtrl.bind.bind(lettersCtrl));
      });
>>>>>>> 07a958911ceea1d4cabbafe634eb83bbe056b917
    } else {
      val = $('#username').val();
      return $('#username').val(val + letter.letter);
    }
  };

  LettersCtrl.prototype.showProgress = function() {
    var value,
      _this = this;
    this.isStart = true;
    this.circleInput.val(6).trigger('change');
    clearInterval(this.progressTimer);
    value = 6;
    this.progressTimer = setInterval(function() {
      if (value >= 100) {
        return;
      }
      value = value + 6;
      return _this.circleInput.val(value).trigger('change');
    }, LETTER_CHECKING_TIME / 17);
  };

  LettersCtrl.prototype.hideProgress = function() {
    this.isStart = false;
    this.circleInput.val(0).trigger('change');
    return clearInterval(this.progressTimer);
  };

  LettersCtrl.prototype.checkInLetter = function(x, y) {
    var letter, _i, _len, _ref;
    _ref = this.letters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      letter = _ref[_i];
      if (letter.checkIsSelf(x, y)) {
        this.x = letter.x + (this.width - 60) / 2;
        this.y = letter.y + (this.width - 60) / 2;
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

  function Letter(letter, x, y, width) {
    this.letter = letter;
    this.x = x;
    this.y = y;
    this.width = this.height = width;
    this.r = x + this.width;
    this.b = y + this.height;
  }

  Letter.prototype.checkIsSelf = function(x, y) {
    return x >= this.x && x <= this.r && y >= this.y && y <= this.b;
  };

  return Letter;

})();
