express = require('express')
app = express()
ejs = require('ejs')
server = require('http').createServer(app)
io = require('socket.io').listen(server)
colors = require('colors')
config = require('./config')

server.listen(8081)

# express 配置
app.use express.static(config.root_path)
app.engine 'ejs', ejs.__express
app.set 'view engine', 'ejs'
app.set 'views', __dirname

# 全局变量
manager = ""
ranking = ""
players = { a: "", b: "" }
playing = false


# 路由
app.get '/', (req, res)->
 	res.sendfile config.root_path + '/game.html'

app.get '/manage', (req, res)->
	res.render 'manage'

app.get '/rank', (req, res)->
	res.render 'rank'

# io.sockets.socket(to).emit(data.msg);

io.sockets.on 'connection', (socket)->
	# 保存管理者 ID
	socket.on 'manager', ->
		manager = socket.id

	# 排行榜幽灵加入
	socket.on 'ranking_list', (data)->
		ranking = socket.id


	# 新用户加入, data.player: a|b
	socket.on 'new_player', (data)->
 		if playing
 			console.log ("Game is running. No participator any more").red
 			return
 		console.log ("User " + data.player + " jion!").green
 		players[data.player] = {
 			id: socket.id
 			name: ""
 			isend: false
 			score: 0
 		}
 		io.sockets[manager].emit 'player_update', players

 	# 广播准备事件
 	socket.on 'ready', (data)->
 		console.log "Name a:", data.namea.green, 'Name b:', data.nameb.green
 		players['a']['name'] = data.namea
 		players['b']['name'] = data.nameb
 		players['a']['isend'] = players['b']['isend'] = false
 		players['a']['sum'] = players['b']['sum'] = 0
 		socket.broadcast.emit 'ready', data

 	# 广播开始事件
 	socket.on 'begin', (data)->
 		playing = true
 		socket.broadcast.emit 'start'

 	# 实时分数 data = {player: "a", add: 4, sum: 20}
 	socket.on 'score_update', (data)->
 		# players[data.player].score = data.sum
 		console.log 'score'.green, ranking, data 
 		if ranking
 			io.sockets[ranking].emit 'score_update', data

 	# 接收结束事件 data = {player: "a", sum: 20}
 	socket.on 'end', (data)->
 		console.log "end".green, data
 		player = players[data.player]
 		playera = players['a']
 		playerb = players['b']
 		player.isend = true
 		player.score = data.sum
 		config.records.push player
 		config.save_records()
 		if playera.isend and playerb.isend
 			playing = false
 			io.sockets[ranking].emit 'end', players








    	