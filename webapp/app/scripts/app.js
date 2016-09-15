'use strict';

var defaultServerPort = '43300';

var app = angular
  .module('webApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap'
]);

app.factory('Auth', ['$http','$cookieStore',function($http,$cookieStore) {

  var _setToken = function(name,token){
    $cookieStore.put(name, token);
    return true;
  }

  var _removeToken = function(name){
    $cookieStore.remove('token');
    return true;
  }

  var _getToken = function(name){
    return $cookieStore.get(name);
  }

  return {    
    setToken: function(name,token) { return _setToken(name,token) },
    removeToken: function(name) { return _removeToken(name) },
    getToken: function(name) { return _getToken(name) },
  };

}]);


app.factory('Ajax', ['$http','Auth',function($http,Auth) {

  var _endpoint = 'http://localhost:'+defaultServerPort+'/';

  var _setToken = function(token){
    $http.defaults.headers.common['X-Auth-Token'] = token;
    return true;
  }

  var _register = function(username,password){
    var url = _endpoint+'register';
    var body = {username: username, password: password}
    return $http.post(url, body);
  }

  var _login = function(username,password){
    var url = _endpoint+'login';
    var body = {username: username, password: password}
    return $http.post(url, body);
  }

  var _logout = function(){
    var url = _endpoint+'logout';
    return $http.post(url);
  }

  var _message = function(to,content){
    var url = _endpoint+'message';
    var body = {to: to, content: content}
    return $http.post(url, body);
  }

  var _like = function(mid,cid){
    var url = _endpoint+'like';
    var body = {mid: mid, cid: cid}
    return $http.post(url, body);
  }

  var _unlike = function(mid,cid){
    var url = _endpoint+'unlike';
    var body = {mid: mid, cid: cid}
    return $http.post(url, body);
  }

  var _see = function(mid,cid){
    var url = _endpoint+'see';
    var body = {mid: mid, cid: cid}
    return $http.post(url, body);
  }

  var _conversations = function(){
    var url = _endpoint+'conversations';
    return $http.get(url);
  }

  var _users = function(){
    var url = _endpoint+'users';
    return $http.get(url);
  }

  return {    
    setToken: function(token) { return _setToken(token) },
    register: function(username,password) { return _register(username,password) },
    login: function(username,password) { return _login(username,password) },
    logout: function() { return _logout() },
    message: function(to,content) { return _message(to,content) },
    like: function(mid,cid) { return _like(mid,cid) },
    unlike: function(mid,cid) { return _unlike(mid,cid) },
    see: function(mid,cid) { return _see(mid,cid) },
    conversations: function() { return _conversations() },
    users: function() { return _users() }
  };

}]);





app.factory('PubSub', ['$rootScope', function($rootScope) {
    // Keep all callbacks in one obj array ( callbacks[topic] = [callback1, callback2, callback3]  )
    var callbacks = {};
    // Create our websocket object with the address to the websocket
    var ws;

    var _getWebSocketConnection = function(){
      if (ws.close != undefined && ws.close != null) {
        return ws;
      }
    }

    var _setWebSocketToken = function(token){
      var endPoint = "ws://localhost:"+defaultServerPort+"?token="+token;
      ws = new WebSocket(endPoint);

      ws.onopen = function(){  
        console.log("Socket has been opened!");  
      };
      
      ws.onmessage = function(message) {
        _publish(JSON.parse(message.data));
      };
    }

    var _publish = function(data){
      var messageObj = data;

      if(callbacks.hasOwnProperty(messageObj.topic)) {
        callbacks[messageObj.topic].forEach(function(obj,i){
          obj.cb(messageObj.data);
        });
      }
    }

    var _unSubscribe = function(topic,index){
      if(callbacks.hasOwnProperty(topic)) {
        if ( callbacks.topic[index] ) {
          callbacks.topic.splice( array.indexOf(5) , 1);
          return true;
        }else{return false}
      }else{return false}
    }


    var _subscribe = function(topic,cb){
      if (!callbacks.hasOwnProperty(topic)){
        callbacks[topic] = [];
      };
      return callbacks[topic].push({
        time: new Date(),
        cb:cb
      });
      
    }

    return {    
      setWebSocketToken: function(token) { return _setWebSocketToken(token) },
      subscribe: function(topic,cb) { return _subscribe(topic,cb) },
      unSubscribe: function(topic,index) { return _unSubscribe(topic,index) },
      getWebSocketConnection: function() { return _getWebSocketConnection() },
    };


}])


app.config(function ($routeProvider) {
  $routeProvider
    .when('/login', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/chat', {
      controller: 'chatCtrl',
      templateUrl: 'views/chat.html'
    })
    .otherwise({
      redirectTo: '/login'
    });
});
