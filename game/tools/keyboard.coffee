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
      ["E", 175, 249]
      ["R", 252, 249]
      ["T", 330, 249]
      ["Y", 407, 249]
      ["U", 484, 249]
      ["I", 561, 249]
      ["O", 637, 249]
      ["P", 713, 249]
      ["A", 60, 328]
      ["S", 136, 328]
      ["D", 213, 328]
      ["F", 289, 328]
      ["G", 367, 328]
      ["H", 445, 328]
      ["J", 521, 328]
      ["K", 598, 328]
      ["L", 675, 328]
      ["Z", 97, 410]
      ["X", 173, 410]
      ["C", 250, 410]
      ["V", 326, 410]
      ["B", 404, 410]
      ["N", 481, 410]
      ["M", 558, 410]
      ["BackSpace", 531, 110]
      ["Enter", 655, 110]
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
    @x = x + 35
    @y = y + 35
    letter = @checkInLetter x, y
    Circle[0].style.cssText = """
      position: absolute; left: #{@x - 30}px; top: #{@y - 30}px;
    """
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
    return if !letter
    val = $('#username').val()
    if letter.letter is "BackSpace"
      $('#username').val val.substring(0, val.length - 2)
    else if letter.letter is "Enter"
      Watcher.clearTimer()
      game.nextPhase ->
        game.on 'start', (mapArea)->
          App.init(mapArea)
        Watcher.gameStart.bind(undefined, App.hit.bind(App))()

      #game.nextPhase(Watcher.gameStart.bind(undefined, App.hit.bind(App)))
    else
      val = $('#username').val()
      $('#username').val val + letter.letter


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
        @x = letter.x
        @y = letter.y
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



