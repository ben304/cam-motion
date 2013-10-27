(function() {
    window.URL = window.URL || window.webkitURL;
    navigator.getUerMedia = navigator.getUerMedia
        || navigator.webkitGetUserMedia
        || navigator.mozGetUserMedia
        || navigator.msGetUserMedia;

    var video = document.querySelector("video"),
        c1 = document.querySelector("#c1"),
        c2 = document.querySelector("#c2"),
        c3 = document.querySelector("#c3"),
        c4 = document.querySelector("#c4"),
        ctx1 = c1.getContext("2d"),
        ctx2 = c2.getContext("2d"),
        ctx3 = c3.getContext("2d"),
        ctx4 = c4.getContext("2d"),
        localMediaStream,
        cols = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        WIDTH = 160,
        HEIGHT = 120,
        first = true,
        timer,
        last,
        bg;

    if (navigator.getUerMedia) {
        navigator.getUerMedia({video: true}, function(stream) {

            video.src = window.URL.createObjectURL(stream);
            localMediaStream = stream;

            timer = setInterval(function() {
                ctx1.drawImage(video, 0, 0, 160, 120);
                var cur = ctx1.getImageData(0, 0, 160, 120);
                var newCanvas1 = ctx2.createImageData(160, 120),
                    newCanvas2 = ctx2.createImageData(160, 120);
                if (first) {
                    last = bg = cur;
                    ctx2.putImageData(cur, 0, 0);
                    first = false;
                } else {
                    Filters.differenceAccuracy(newCanvas1.data, cur.data, bg.data);
                    ctx3.putImageData(newCanvas1, 0, 0);

                    Filters.differenceAccuracy(newCanvas2.data, cur.data, last.data);
                    ctx4.putImageData(newCanvas2, 0, 0);

                    console.log(handler.changeRate(newCanvas2.data));

                    last = cur;
                    //clearInterval(timer);
                }
            }, 150);
        }, function() { console.log("fail"); });
    }

    var handler = {
        state: [],
        status: null,
        max: function(cols) {
            var max = 0, maxIndex = 0;
            for (var i = 0, l = cols.length; i < l; i++) {
                if (cols[i] > max) {
                    max = cols[i];
                    maxIndex = i;
                }
            }
            return {index: maxIndex, max: max};
        },
        changeRate: function(data) {
            var count = 0, index, pos = {}, l = WIDTH*HEIGHT*4;
            for (var i = 0; i < l; i+=4) {
                if (data[i] == 255 && data[i+1] == 255 && data[i+2] == 255) {
                    count++;
                }
            }
            console.log(count, WIDTH*HEIGHT*4);
            return count / l;
        },
        handleImage: function(data) {
            var count = 0, index, pos = {};
            for (var i = 0, l = WIDTH*HEIGHT*4; i < l; i+=4) {
                if (data[i] == 255 && data[i+1] == 255 && data[i+2] == 255) {
                    var x = Math.floor((i/4)%160/16);
                    cols[x]++;
                    count++;
                }
            }
            //console.log(count);
            //console.log(cols);
            pos = this.max(cols);
            if (pos.max > 100) {
                this.pushState(pos.index);
            }
            //console.log(index);
            cols = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        },
        pushState: function(index) {
            if (this.status == null) {
                if (this.state.length != 0) {
                    if (this.state[0] < index) {
                        this.status = "<";
                        this.state.push(index);
                    } else if (this.state[0] > index){
                        this.status = ">";
                        this.state.push(index);
                    }
                } else {
                    this.state.push(index);
                }
            } else {
                var last = this.state[this.state.length-1];
                if (this.status == "<") {
                    if (last < index) {
                        this.state.push(index);
                    } else if (last > index) {
                        this.state = [];
                        this.status = null;
                    }
                    if (this.state.length == 3) {
                        console.log("<-");
                        //clearInterval(timer);
                    }
                } else if (this.status == ">") {
                    if (last > index) {
                        this.state.push(index);
                    } else if (last < index) {
                        this.state = [];
                        this.status = null;
                    }
                    if (this.state.length == 3) {
                        console.log("->");
                        //clearInterval(timer);
                    }
                }
            }
        }
    }

    var pause = document.querySelectorAll(".pause")[0];
    pause.addEventListener("click", function() {
        clearInterval(timer);
    });
})();