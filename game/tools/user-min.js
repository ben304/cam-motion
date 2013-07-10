// if(localStorage['userlist']) {
//   UserList = JSON.parse(localStorage['userlist']);
// }
// else {
//   UserList = [];
// }
var UserList={list:function(){return localStorage.userlist?JSON.parse(localStorage.userlist):[]},get:function(e){return this.list().some(function(t){return t.name==e})},add:function(e){var t;this.get(e)?t=e.match(/[A-Z]+/i)+(parseInt(0+e.match(/\d+/))+1):t=e;var n=this.list();n.push({name:t,score:0});localStorage.userlist=JSON.stringify(n);return t},set:function(e,t){var n=this.list();for(var r=0;r<n.length;r++)if(n[r]==e){n[r].score=t;break}}},UserCtrl={setUser:function(e){localStorage.currentUser=e},addUser:function(e){return UserList.add(e)},getUser:function(){return localStorage.currentUser},setScore:function(e,t){UserList.set(e,t)},listScore:function(){return UserList.list()}};