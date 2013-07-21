KISSY.add(function() {
	var DING, HIT, SoundBox;

	DING = new Audio;

	DING.src = "./sound/013kt096.mp3";

	HIT = new Audio;

	HIT.src = "./sound/013kt008.mp3";

	var sounds = {
		HIT: HIT,
		DING: DING
	};

	function SoundBox() {}

	SoundBox.play = function(type) {
	    var audio;
	    audio = sounds[type.toUpperCase()];
	    audio.currentTime = 0;
	    audio.pause();
	    return audio.play();
	};
	return SoundBox;
});



