KISSY.add('leapmotion',function(S){

    var D = S.DOM,
      handScreenTaps = [],
      //生命周期
      HANDSCREENTAP_LIFE = 0.5,
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
          handPos = self.leapToScene(frame , hand.palmPosition),
          result = S.merge(handPos,{'isHit':false});

        if(!fingers.length){

          if((palmVelocityY < HANDSCREENTAP_RAT_Y) && (palmVelocityX < HANDSCREENTAP_RAT_XZ_ABS) && (palmVelocityZ < HANDSCREENTAP_RAT_XZ_ABS)){

            console.log(palmVelocityY);
            handScreenTaps.push(frame.timestamp);
          }

          var len = handScreenTaps.length;

          if(len > 1){

            if((palmVelocityY < 0) && (palmVelocityY > -450)){

              var age =  (frame.timestamp - handScreenTaps[0]) / 1000000;

              if(age < HANDSCREENTAP_LIFE){

                console.log(palmVelocityY);
                console.log('is hit');
                result.isHit = true;
                console.log(result);
              }

              handScreenTaps = [];
            }
          }
        }

        return result;
      }

    }


    return leapmotion;

});

