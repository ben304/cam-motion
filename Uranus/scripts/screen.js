KISSY.add('screen',function(S, $, playerUI, rankUI, winUI){
  $ = S.all, data = localStorage, cache = {};
  console.log(data);
  function Screen(){
    playerUI = {
      a: $('#client-a'),
      b: $('#client-b')
    };
    rankUI = $('#rank');
    winUI = $('.vs-bar').all('strong');
    addEvents();
    this.updateRank();
  }
  function addEvents(){
    winUI.on('webkitAnimationEnd',function(e){
      $(e.target).removeClass('bounceIn');
    });
  }
  function addAnimationInto(ui, cls, score){
    var el = $('<a class="child '+cls+'">'+score+'</a>');
    el.on('webkitAnimationEnd',function(e){
      el.remove();
      el = null;
    });
    ui.append(el);
  }
  function createRankItem(name,score,bool){
    return $('<li class="fadeInDown'+(bool?' hot':'')+'">'+
            '  <strong>'+name+'</strong>'+
            '  <span>最高分：</span>'+
            '  <em>'+score+'</em>'+
            '</li>');
  }
  S.extend(Screen, S.Base, {
    ready: function(name){
      winUI.each(function(v){
        v[0].className = "";
      });
    },
    updatePlayer: function(id, name, score){
      if(data[name] && data[name] == score) return;
      if(!cache[id]) cache[id] = {
        name: playerUI[id].all('.name'), 
        score: playerUI[id].all('.score')
      };
      cache[id].name.html(name);
      addAnimationInto(cache[id].score.parent(), 'fadeOutUp', cache[id].score.html())
      cache[id].score.html(score);
      //data[name] = score;
    },
    updateWinner: function(){
      var tmp = [cache.a, cache.b],
          result = ['win', 'lose'];
      tmp.sort(function(a, b){
        return b.score.text() - a.score.text();
      }).forEach(function(v, i, n, s, u){
        n = v.name, s = v.score, u = n.html();
        
        if(!data[u] || +s.html() > +data[u]){
          data[u] = s.html();
        }
        setTimeout(function(w){
          w = n.parent().all('strong');
          w[0].className = result[i]+' bounceIn';
        }, i*500);
      });
    },
    updateRank: function(){
      var tmp = [], k;
      for(k in data){
        tmp.push([k,data[k]]);
      }
      rankUI.html('');
      tmp.sort(function(a,b){
        return b[1] - a[1]; 
      }).forEach(function(v,i,item){
        item = createRankItem(v[0],v[1],i<3);
        setTimeout(function(){
          rankUI.append(item);
        }, i*300);
      });
    }
  });
  return new Screen;
});
