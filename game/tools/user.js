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
      name = name.match(/[A-Z]+/i) + (parseInt(0 + name.match(/\d+/)) + 1);
      return this.add(name);
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
      if(list[i].name == name) {
        list[i]['score'] = score;
        break;
      }
    }
    localStorage['userlist'] = JSON.stringify(list);
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