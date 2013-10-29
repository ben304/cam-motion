KISSY.add(function (S) {

    var $ = S.Node.all,
        self = this,
        host = location.host,
        socket = io.connect('http://' + host),
        player = location.search.replace(/\?|&/ig, '');

    // 分数更新， add 是本次增加的分数，sum 是总分
    function sendScore(add, sum) {
        socket.emit('score_update', {
            player: player,
            add: add,
            sum: sum
        });
    }

    function sendEnd(sum) {
        socket.emit('end', {
            player: player,
            sum: sum
        });
    }

    return {
        init: function(game, core) {
            this.game = game;
            this.core = core;

            var self = this;
            socket.on('ready', function(data){
                // 准备事件，显示登录页面，其中名字是 data['name' + player]
                $("#player").html(data["name"+player]);
                self.game.restart();
            });

            socket.on('start', function(data){
                // 开始
                self.game.nextPhase(function() {
                    $('#CountDown').addClass('show');
                });
            });
        },
        sendScore: sendScore,
        sendEnd: sendEnd
    }
}, {
    require: []
});