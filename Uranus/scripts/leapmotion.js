KISSY.add(function(S){

  var D = S.DOM,
    handScreenTaps = [],
    //拳头的时间数组
    fistTimeArr = [],
    //生命周期
    HANDSCREENTAP_LIFE = 1,
    //y轴方向的运动的最小比率
    HANDSCREENTAP_RAT_Y = -450,
    //x z轴方向的运动的最大比率
    HANDSCREENTAP_RAT_XZ_ABS = 400;

  var leapmotion = {

    init: function(core){

      var self = this,
        controller = new Leap.Controller({enableGestures:true});

      controller.on( 'frame' , function(frame){

        var hand = frame.hands[0];

        if(!hand){
          return;
        }

        var posAndMotion = self.getPosAndMotion(frame,hand);
        core.hit(posAndMotion.left, posAndMotion.top, posAndMotion.isHit);

      });

      controller.connect();

    },

    //转换leap的坐标为绝对定位的left  top
    leapToScene: function(frame,leapPos){

      var iBox = frame.interactionBox,
        left = iBox.center[0] - iBox.size[0]/2,
        top = iBox.center[1] + iBox.size[1]/2,
        x = leapPos[0] - left,
        y = leapPos[1] - top;

      x /= iBox.size[0];
      y /= iBox.size[1];

      x *= D.viewportWidth();
      y *= D.viewportHeight();

      return {
        left: x,
        top: -y
      }

    },

    //获得定位的信息和动作如 {top:123,left:321,isHit:true}
    getPosAndMotion: function (frame,hand){

      var self = this,
        palmVelocity = hand.palmVelocity,
        palmVelocityX = Math.abs(palmVelocity[0]),
        palmVelocityY = palmVelocity[1],
        palmVelocityZ = Math.abs(palmVelocity[2]),
        fingers = frame.fingers,
        //fistTimeInterval = [],
        handPos = self.leapToScene(frame , hand.palmPosition),
        result = S.merge(handPos,{'isHit':false});


      //如果手指数少于2，并且存在手掌
      if((fingers.length < 2) && hand){

        handScreenTaps.push(frame.timestamp);

        var len = handScreenTaps.length;

        if(len > 1){

          var age =  (frame.timestamp - handScreenTaps[0]) / 1000000;

          if(age < HANDSCREENTAP_LIFE){

            // console.log(palmVelocityY);
            // console.log('is hit');
            result.isHit = true;
          }

          handScreenTaps = [];
        }


        //如果是拳头
        if(!fingers.length){

          fistTimeArr.push(frame.timestamp / 1000000);
          var fistTimeLen = fistTimeArr.length;

          if(fistTimeLen > 100 ){

            if(self.isEachIntervalSmallNum(fistTimeArr,0.1)){

              console.log('你在作弊!');
              result.isHit = false;
            }
            else{

              console.log('没有作弊');
              result.isHit = true;
              fistTimeArr = [];
            }

          }
        }

      }


      if(result.isHit){

        console.log('is hit !');
      }

      return result;
    },

    //每相邻两项相减，若每个值都小于num，则返回true
    isEachIntervalSmallNum: function(arr,num){

      // console.log('isEachIntervalSmallNum');
      // console.log(arr);

      var len = arr.length,
        intervalArr = [];

      for(var i = 0; i < (len-1); i++){

        var tempNum = arr[i+1] - arr[i];

        if(tempNum < num){

          intervalArr.push(tempNum);
        }
      }

      if(intervalArr.length == (len -1)){

        // console.log('is true');
        // console.log(intervalArr);
        return true;
      }
      else{

        // console.log('is false');
        // console.log(intervalArr);
        return false;
      }
    }


  }

  return leapmotion;

});

