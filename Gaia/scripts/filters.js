/**
 * 基础图像处理方法
 * @param  {[type]} S [description]
 * @return {[type]}   [description]
 */
KISSY.add(function(S) {

    var SENS = 20;

    var filter = function(pixels, rgb) {
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i+1];
            var b = d[i+2];

            var v = (r >= rgb[0]-SENS && r <= rgb[0]+SENS && g >= rgb[1]-SENS && g <= rgb[1]+SENS && b >= rgb[2]-SENS && b <= rgb[2]+SENS) ? 0 : 255;
            d[i] = d[i+1] = d[i+2] = v
        }
        return pixels;
    };

    var __fastAbs = function(value) {
        return (value ^ (value >> 31) - (value >> 31));
    };

    var __threshold = function(value) {
        return (value > 0x20) ? 0x0FF : 0x0;
    };

    var difference = function(target, data1, data2) {
          if (data1.length != data2.length) return null;
          var i = 0;

          while (i < (data1.length * 0.25)) {
              var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
              var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
              var diff = __threshold(__fastAbs(average1 - average2));
              target[4 * i] = diff;
              target[4 * i + 1] = diff;
              target[4 * i + 2] = diff;
              target[4 * i + 3] = 0xFF;
              ++i;
          }
    }

    return {
        filter: filter,
        difference: difference
    }
});