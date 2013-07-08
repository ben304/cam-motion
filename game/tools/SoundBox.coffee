DING = new Audio
DING.src = "./sound/013kt096.mp3"
HIT = new Audio
HIT.src = "./sound/013kt008.mp3"

class SoundBox
  @play: (type)->
    audio = window[type.toUpperCase()]
    audio.currentTime = 0
    audio.pause()
    audio.play()
