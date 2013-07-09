// if(localStorage['userlist']) {
//   UserList = JSON.parse(localStorage['userlist']);
// }
// else {
//   UserList = [];
// }


var UserList = {
  list: function(){
    if(localStorage['userlist']) {
      return JSON.parse(localStorage['userlist']);
    }
    else {
      return [];
    }
  },

  get: function(name){
    return this.list().some(function(item){ return item.name == name; });
  },

  add: function(name){
    var new_name;
    if(this.get(name)) {
      new_name = name.match(/\w+?/i) + (parseInt(name.match(/\d+?/i)) + 1);
    }
    else {
      new_name = name;
    }
    var list = this.list();
    list.push({ name: new_name, score: 0 });
    localStorage['userlist'] = JSON.stringify(list);
    return new_name;
  },
  set: function(name, score) {
    var list = this.list();
    for(var i=0; i<list.length; i++){
      if(list[i] == name) {
        list[i]['score'] = score;
        break;
      }
    }
  }
};


var UserCtrl = {
	setUser: function(name) {
    localStorage['currentUser'] = name;
	},

  addUser: function(name) {
    return UserList.add(name);
  },

  getUser: function() {
    return localStorage['currentUser'];
  },

  setScore: function(name, score) {
    UserList.set(name, score);
  },

  listScore: function() {
    return UserList.list();
  }


};