LETTER_CHECKING_TIME = 3000
LETTER_CHECKING_DELAY = 300
Circle = $('#J_KeyBoardCircle').knob
  thickness : 0.3
  width     : 60

class LettersCtrl
  constructor: ->
    letters = [
      ["Q", 0, 0]
      ["W", 0, 0]
      ["E", 0, 0]
      ["R", 0, 0]
      ["T", 0, 0]
      ["Y", 0, 0]
      ["U", 0, 0]
      ["I", 0, 0]
      ["O", 0, 0]
      ["P", 0, 0]
      ["A", 0, 0]
      ["S", 0, 0]
      ["D", 0, 0]
      ["F", 0, 0]
      ["G", 0, 0]
      ["H", 0, 0]
      ["J", 0 ,0]
      ["K", 0, 0]
      ["L", 0, 0]
      ["Z", 0, 0]
      ["X", 0, 0]
      ["C", 0, 0]
      ["V", 0, 0]
      ["B", 0, 0]
      ["N", 0, 0]
      ["M", 0, 0]
    ]
    for letter in letters
      @letters.push new Letter letter[0], letter[1], letter[2]
    @init()

  init: ->
    @delayTimer = null
    @inputTimer = null
    @inLetter = ""
    @bind()

  bind: (x, y)->
    @x = x
    @y = y
    letter = @checkInLetter x, y
    return if letter is @preLetter
    @preLetter = letter
    clearTimeout @delayTimer
    clearTimeout @inputTimer
    @hideProgress()
    @delayTimer = setTimeout => 
      @checkAfterDelay.call @
    , LETTER_CHECKING_DELAY

  checkAfterDelay: ->
    @showProgress()
    @inputTimer = setTimeout =>
      @inputLetter @preLetter
    , LETTER_CHECKING_TIME


  @inputLetter: (letter)->


  showProgress: ->
    Circle.show().val(0)
    value = 0
    @progressTimer = setInterval ->
      val = Circle.
      Circle.val value++
    , LETTER_CHECKING_TIME / 100


  hideProgress: ->
    Circle.hide()
    clearInterval @progressTimer
    

  checkInLetter: (x, y)->
    for letter in @letters
      if letter.checkIsSelf(x, y)
        return letter
        break


class Letter
  width: 66
  height: 66

  constructor: (letter, x, y)->
    @letter = letter
    @x = x
    @y = y
    @r = x + @width
    @b = y + @height

  checkIsSelf: (x, y)->
    return x >= @x and x<= @r and y >= @y and y <= @b



