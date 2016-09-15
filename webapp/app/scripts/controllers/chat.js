'use strict';

angular.module('webApp')
  .controller('chatCtrl', ['$scope', '$rootScope','$location', 'Auth', 'Ajax', 'PubSub',
    function($scope,$rootScope, $location, Auth, Ajax, PubSub) {
      
      $scope.myUserName = $location.search().username;
      var token = Auth.getToken('token');
      if (token == undefined || token == null) {
        $location.path( "/login" ).search({status: 'login'});
      }else{
        PubSub.setWebSocketToken(token);
        Ajax.setToken(token);
      }

      $scope.toggleObject = {item: -1};
      $scope.conversations = [];
      $scope.messagesList = [];

      //////////////////-----------------------------load first conversation------------------------/////////////
      Ajax.conversations().success(function(data, status, headers, config) { 
        if (data.conversations.length > 0) { 
          $scope.conversations = data.conversations;
          $scope.messagesList = $scope.conversations[0].messages;  
          var conversationPeerArr = $scope.conversations[0].peers; 
          if (conversationPeerArr[0] != $scope.myUserName) {
            $scope.conversationPeer = conversationPeerArr[0];
          }else{
            $scope.conversationPeer = conversationPeerArr[1];
          }
        }
      });
      //////////////////-----------------------------load first conversation------------------------/////////////
      

      //////////////////-----------------------------load contacts list-----------------------------/////////////
      $scope.contactsList = [];
      Ajax.users().success(function(data, status, headers, config) {  
        if (data != undefined && data != null) {  
          $scope.users = data.users;
          $scope.users.forEach(function(val,i){
            $scope.contactsList.push({username:val,status:'unknown',newMessages:0})
          });  
        } 
      });
      //////////////////-----------------------------load contacts list-----------------------------/////////////

      //////////////////-----------------------------load conversation------------------------------/////////////
      $scope.conversationId = undefined;
      $scope.loadConversation = function(index,username){
        $scope.toggleObject.item = index;
        $scope.contactsList[index].newMessages = 0;
        $scope.conversationPeer = username;
        var count=0;
        if ($scope.conversations != undefined && $scope.conversations.length > 0) {
          $scope.conversations.forEach(function(conversation,i){
            if ( conversation.peers.indexOf(username) > -1 ) {
              count++;
              $scope.messagesList = conversation.messages;
              $scope.conversationId = conversation.id;
              conversation.messages.forEach(function(message,pos){
                if (!message.seen && message.from != $scope.myUserName) {
                  Ajax.see(message.id,conversation.id).success(function(data, status, headers, config) {
                    $scope.messagesList.forEach(function(message,pos){
                      if (message.id == config.params.mid) {
                        $scope.messagesList[pos].seen = true;
                      };
                    });
                    $scope.conversations[i].messages = $scope.messagesList;
                    $scope.$digest();
                  }); 
                }
              });
            }
          });
          if (count==0) {
            $scope.messagesList = [];
            $scope.conversationId = 'noID';
          };

        }else{
          $scope.messagesList = [];
          $scope.conversationId = 'noID';
        }
        $scope.$$postDigest(function(){
          var objDiv = document.getElementById("historyContainer");
          objDiv.scrollTop = objDiv.scrollHeight;
        });
      }
      //////////////////-----------------------------load conversation------------------------------/////////////

      //////////////////-----------------------------send new message-------------------------------/////////////
      $scope.sendMyNewMessage = function(content){
        if (content != null && content != undefined) {
          Ajax.message($scope.conversationPeer,content).success(function(data, status, headers, config) { 
            if (data != undefined && data != null) {
              if ($scope.conversationId == data.cid || $scope.conversationId == 'noID') {
                $scope.messagesList.push(
                  {
                    "from": $scope.myUserName,
                    "to": $scope.conversationPeer,
                    "content": content,
                    "id": data.mid,
                    "seen": false,
                    "likedBy": []
                  });
                $scope.conversationId = data.cid;
              }else{
                $scope.contactsList.forEach(function(val,index){
                  if ( val.username == $scope.myUserName) {
                    $scope.contactsList[index].newMessages++;
                  };
                });
              }

              var count = 0;
              $scope.conversations.forEach(function(val,index){
                if (val.id == data.cid) {
                  $scope.conversations[index].messages = $scope.messagesList;
                  count++;
                };
              });
              if (count == 0) {
                $scope.conversations.push(
                  {
                    "peers": [$scope.myUserName, $scope.conversationPeer],
                    "id": data.cid,
                    "messages": [{
                      "from": $scope.myUserName,
                      "to": $scope.conversationPeer,
                      "content": content,
                      "id": data.mid,
                      "seen": false,
                      "likedBy": []
                    }]
                  });
              };

              $scope.myNewMessage = null;
            };
          });
        };
        $scope.$$postDigest(function(){
          var objDiv = document.getElementById("historyContainer");
          objDiv.scrollTop = objDiv.scrollHeight;
        });
      }
      //////////////////-----------------------------send new message-------------------------------/////////////

      //////////////////-----------------------------send like--------------------------------------/////////////
      $scope.setLike = function(index,val){
        var mid = $scope.messagesList[index].id;
        Ajax.like(mid,$scope.conversationId).success(function(data, status, headers, config) { 
          $scope.messagesList[index].likeBy.push($scope.myUserName);
        });
      }
      //////////////////-----------------------------send like--------------------------------------/////////////


      //////////////////-----------------------------send unlike------------------------------------/////////////
      $scope.setUnLike = function(index,val){
        var mid = $scope.messagesList[index].id;
        Ajax.unlike(mid,$scope.conversationId).success(function(data, status, headers, config) { 
          var pos = $scope.messagesList[index].likeBy.indexOf($scope.myUserName);
          $scope.messagesList[index].likeBy.splice( pos , 1);
        });
      }
      //////////////////-----------------------------send unlike------------------------------------/////////////

      //////////////////-----------------------------logout-----------------------------------------/////////////
      $scope.logout = function(){
        var wr = PubSub.getWebSocketConnection();
        wr.onclose = function(){
          Ajax.logout().success(function(data, status, headers, config) { 
            Auth.removeToken('token');
            // ToDo implementing unSubscribe features.
            $location.path( "/login" ).search({status: 'login'});
          });
        };
        wr.close();
      };
      //////////////////-----------------------------logout-----------------------------------------/////////////



      



      //////////////////-----------------------------received new message---------------------------/////////////
      PubSub.subscribe('message',function(data){

        if (data.to == $scope.myUserName) {

          var count = 0;
          var conversationPos = null;
          var messagePos = null;
          $scope.conversations.forEach(function(val,index){
            if (val.id == data.cid) {
              conversationPos = index;
              messagePos = $scope.conversations[index].messages.push(
                {
                  "from": data.from,
                  "to": data.to,
                  "content": data.content,
                  "id": data.mid,
                  "seen": false,
                  "likedBy": []
                });
              count++;
            };
          });
          if (count == 0) {
            $scope.conversations.push(
              {
                "peers": [data.from, data.to],
                "id": data.cid,
                "messages": [{
                  "from": data.from,
                  "to": data.to,
                  "content": data.content,
                  "id": data.mid,
                  "seen": false,
                  "likedBy": []
                }]
              });
            conversationPos = $scope.conversations.length-1;
            messagePos = 0;
          };


          var pos = null;
          if ( ($scope.conversationId == data.cid || $scope.conversationId == 'noID') && ( data.from == $scope.conversationPeer) ){
            $scope.messagesList = $scope.conversations[conversationPos].messages;
            pos = $scope.messagesList.length-1;
            $scope.conversationId == data.cid;
          }else{
            $scope.contactsList.forEach(function(val,index){
              if ( val.username == data.from) {
                $scope.contactsList[index].newMessages++;
              };
            });
          }

          if ( ($scope.conversationId == data.cid || $scope.conversationId == 'noID') && ( data.from == $scope.conversationPeer) ){
            if (data.to == $scope.myUserName) {
              Ajax.see(data.mid,data.cid).success(function(data, status, headers, config) {
                if (pos != null) {
                  $scope.messagesList[pos].seen = true;
                };
                $scope.conversations[conversationPos].messages[messagePos];
                $scope.$digest();
              });
            }
          }

          $scope.$digest();
          var objDiv = document.getElementById("historyContainer");
          objDiv.scrollTop = objDiv.scrollHeight;
        }
        
      });
      //////////////////-----------------------------received new message---------------------------/////////////

      //////////////////-----------------------------received online event--------------------------/////////////
      PubSub.subscribe('user-online',function(data){
        $scope.updateUsersList('online',data.username); 
      });
      //////////////////-----------------------------received online event--------------------------/////////////

      //////////////////-----------------------------received offline event-------------------------/////////////
      PubSub.subscribe('user-offline',function(data){
        $scope.updateUsersList('offline',data.username) 
      });
      //////////////////-----------------------------received offline event-------------------------/////////////

      //////////////////-----------------------------new user event---------------------------------/////////////
      PubSub.subscribe('user-new',function(data){
        $scope.updateUsersList('new',data.username) 
      });
      //////////////////-----------------------------new user event---------------------------------/////////////

      //////////////////-----------------------------new like event---------------------------------/////////////
      PubSub.subscribe('message-like',function(data){
        $scope.updateConversationAttr(data.cid,data.mid,'like',data.by);
      });
      //////////////////-----------------------------new like event---------------------------------/////////////

      //////////////////-----------------------------new unlike event-------------------------------/////////////
      PubSub.subscribe('message-unlike',function(data){
        $scope.updateConversationAttr(data.cid,data.mid,'unlike',data.by);
      });
      //////////////////-----------------------------new unlike event-------------------------------/////////////

      //////////////////-----------------------------new seen event, my message has been seen-------/////////////
      PubSub.subscribe('message-seen',function(data){
        $scope.updateConversationAttr(data.cid,data.mid,'seen',true);
      });

      //////////////////-----------------------------updating user List (new, offline, online)------/////////////
      $scope.updateUsersList = function(type,username){
        if (type == 'new') {
          $scope.contactsList.push({username:username,status:'unknown',newMessages:0});
        }else if (type == 'offline' || type == 'online') {
          $scope.contactsList.forEach(function(val,index){
            if (val.username == username) {
              $scope.contactsList[index].status = type;
            };
          });
        };
        $scope.$digest();
      }
      //////////////////-----------------------------updating user List (new, offline, online)------/////////////

      //////////////////-----------------------------updating converations (seen, like, unlike)-----/////////////
      $scope.updateConversationAttr = function(cid,mid,prop,value){
        $scope.conversations.forEach(function(val,index){
          if (val.id == cid) {
            $scope.conversations[index].messages.forEach(function(message,i){
              if (message.id == mid) {
                if (prop == 'seen') {
                  $scope.conversations[index].messages[i][prop] = value;  
                }else if (prop == 'unlike') {
                  var pos = $scope.conversations[index].messages[i].likedBy.indexOf(value)
                  $scope.conversations[index].messages[i].likedBy.splice(pos,1);
                }else if (prop == 'like') {
                  $scope.conversations[index].messages[i].likedBy.push(value);
                }; 
              }
            });
          };
        });
        if ($scope.conversationId == cid) {
          $scope.messagesList.forEach(function(message,i){
            if (message.id == mid) {
              if (prop == 'seen') {
                $scope.messagesList[i][prop] = value;  
              }else if (prop == 'unlike') {
                var pos = $scope.messagesList[i].likedBy.indexOf(value);
                $scope.messagesList[i].likedBy.splice(pos,1);
              }else if (prop == 'like') {
                $scope.messagesList[i].likedBy.push(value);
              };
            }
          });
        };
        $scope.$digest();
      }
      //////////////////-----------------------------updating converations (seen, like, unlike)-----/////////////


}]);



