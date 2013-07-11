LETTER_CHECKING_TIME = 300
LETTER_CHECKING_DELAY = 100

Page1_Letters = [
  # ["Q", 23, 249]
  # ["W", 99, 249]
  # ["E", 175, 249]
  # ["R", 252, 249]
  # ["T", 330, 249]
  # ["Y", 407, 249]
  # ["U", 484, 249]
  # ["I", 561, 249]
  # ["O", 637, 249]
  # ["P", 713, 249]
  # ["A", 60, 328]
  # ["S", 136, 328]
  # ["D", 213, 328]
  # ["F", 289, 328]
  # ["G", 367, 328]
  # ["H", 445, 328]
  # ["J", 521, 328]
  # ["K", 598, 328]
  # ["L", 675, 328]
  # ["Z", 97, 410]
  # ["X", 173, 410]
  # ["C", 250, 410]
  # ["V", 326, 410]
  # ["B", 404, 410]
  # ["N", 481, 410]
  # ["M", 558, 410]
  # ["BackSpace", 531, 96, 100]
  ["Enter", 335, 312, 160]
]

Page2_Letters = [
  ["Restart", 238, 295]
  ["Rank", 447, 295]
]

Page3_Letters = [
  ["Restart", 362, 445]
]

Page1_Width = 66
Page2_Width = 120
Page3_Width = 80


# CircleInput = $('#J_KeyBoardCircle')
# Circle = CircleInput.knob
#   thickness : 0.3
#   width     : 60

class LettersCtrl
  disabled : false

  constructor: (page, circleSelector)->
    @letters = []
    @circleInput = $(circleSelector)
    @circle = @circleInput.knob
      thickness : 0.3
      width     : 60
    letters = window[page + "_Letters"]
    @width = window[page + "_Width"]
    for letter in letters
      @letters.push new Letter letter[0], letter[1], letter[2], letter[3] || @width
    @init()

  init: ->
    @delayTimer = null
    @inputTimer = null
    @inLetter = ""

    @circle.bind 'change', (ev)=>
      if ev.target.value >= 100
        @inputLetter @preLetter

    # @bind()

  bind: (x, y)->
    return if @disabled
    @x = x - @width/2
    @y = y - @width/2
    letter = @checkInLetter x, y
    rx = if letter then letter.x + (letter.width - 60)/2 else x
    ry = if letter then letter.y + (letter.height - 60)/2 else y
    @circle[0].style.cssText = """
      position: absolute; left: #{rx}px; top: #{ry}px;
    """
    return if (letter is @preLetter) # and @isStart
    clearTimeout @delayTimer
    clearTimeout @inputTimer
    @hideProgress()
    @preLetter = letter
    return if !letter
    @delayTimer = setTimeout => 
      @checkAfterDelay.call @
    , LETTER_CHECKING_DELAY

  checkAfterDelay: ->
    @showProgress()
    # @inputTimer = setTimeout =>
    #   @inputLetter @preLetter
    # , LETTER_CHECKING_TIME


  inputLetter: (letter)->
    console.log letter
    return if !letter or @disabled
    SoundBox.play('ding')
    val = $('#username').val()
    if letter.letter is "BackSpace"
      $('#username').val val.substring(0, val.length - 1)
    else if letter.letter is "Enter"
      @disabled = true
      App.start()
    else if letter.letter is "Restart" 
      @disabled = true
      game.restart App.restart
    else if letter.letter is "Rank"
      @disabled = true
      App.showScoreList()
    else
      val = $('#username').val()
      $('#username').val val + letter.letter


  showProgress: ->
    @isStart = true
    #Circle.show()
    @circleInput.val(6).trigger('change')
    clearInterval @progressTimer
    value = 6
    @progressTimer = setInterval =>
      return if value >= 100
      value = value + 6
      @circleInput.val(value).trigger('change')
    , LETTER_CHECKING_TIME / 17
    return


  hideProgress: ->
    # Circle.hide()
    @isStart = false
    @circleInput.val(0).trigger('change')
    clearInterval @progressTimer
    
  checkInLetter: (x, y)->
    for letter in @letters
      if letter.checkIsSelf(x, y)
        #console.log letter
        return letter
        break
    return false


class Letter
  constructor: (letter, x, y, width)->
    @letter = letter
    @x = x
    @y = y
    @width = @height = width
    @r = x + @width
    @b = y + @height

  checkIsSelf: (x, y)->
    return x >= @x and x<= @r and y >= @y and y <= @b



