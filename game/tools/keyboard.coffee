LETTER_CHECKING_TIME = 600
LETTER_CHECKING_DELAY = 300
CircleInput = $('#J_KeyBoardCircle')
Circle = CircleInput.knob
  thickness : 0.3
  width     : 60

class LettersCtrl
  constructor: ->
    @letters = []
    letters = [
      ["Q", 23, 249]
      ["W", 99, 249]
      ["E", 0, 0]
      ["R", 0, 0]
      ["T", 0, 0]
      ["Y", 0, 0]
      ["U", 0, 0]
      ["I", 0, 0]
      ["O", 0, 0]
      ["P", 0, 0]
      ["A", 0, 0]
      ["S", 136, 329]
      ["D", 213, 329]
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

    # @bind()

  bind: (x, y)->
    @x = x
    @y = y
    Circle[0].style.cssText = """
      position: absolute; left: #{x - 30}px; top: #{y - 30}px;
    """
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


  inputLetter: (letter)->
    console.log letter
    val = $('#username').val()
    $('#username').val val + letter.letter if letter


  showProgress: ->
    Circle.show()
    CircleInput.val(6).trigger('change')
    clearInterval @progressTimer
    value = 6
    @progressTimer = setInterval ->
      value = value + 6
      CircleInput.val(value).trigger('change')
    , LETTER_CHECKING_TIME / 17
    return


  hideProgress: ->
    # Circle.hide()
    CircleInput.val(0).trigger('change')
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



