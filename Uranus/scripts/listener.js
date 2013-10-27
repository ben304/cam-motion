var socket = io.connect('http://localhost:8081'),
	player = location.search.replace(/\?&/ig, '');

socket.on('ready', function(data){
	// 准备事件，显示登录页面，其中名字是 data['name' + player]
});

socket.on('begin', function(data){
	// 开始
});

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