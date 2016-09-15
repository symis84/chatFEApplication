

describe('Controller: chatCtrl', function () {

  // load the controller's module
  beforeEach(module('webApp'));


  var scope, httpBackend, createController,location,cookies;

  beforeEach(inject(function($rootScope, $httpBackend, $controller, _Ajax_, $location,$cookies,$rootScope) {
      httpBackend = $httpBackend;
      Ajax = _Ajax_;
      rootScope = $rootScope;
      location = $location;
      cookies = $cookies;
      scope = $rootScope.$new();

      createController = function() {
          return $controller('chatCtrl', {
              $scope: scope
              //_Ajax: Ajax
          });
      };

      spyOn(Ajax, 'conversations').and.callFake(function() {
      return {
        success: function(callback) { return callback( 
          {
            "conversations": [
            {
              "peers": ["bar", "foo"],
              "id": "52f9qp9lt72xzuxr",
              "messages": [{
                "from": "foo",
                "to": "bar",
                "content": "hello",
                "id": "t16hup5ju2i6bt9",
                "seen": false,
                "likedBy": ["bar"]
              }, {
                "from": "bar",
                "to": "foo",
                "content": "hi!",
                "id": "gu9okcqu2oxswcdi",
                "seen": true,
                "likedBy": []
              }]
            }, {
              "peers": ["baz", "foo"],
              "id": "rm30albkzlivn29",
              "messages": [{
                "from": "foo",
                "to": "baz",
                "content": "hi there...",
                "id": "lr71haal83nb3xr",
                "seen": true,
                "likedBy": []
              }]
            }]
          }
          ,'200', '', '' ); 
        },
        error: function(callback) { return '' }
      };
    });

    spyOn(Ajax, 'users').and.callFake(function() {
      return {
        success: function(callback) { return callback( 
          {
            "users": ["Simone", "Josh", "Chris"]
          }
          ,'200', '', '' ); 
        },
        error: function(callback) { return '' }
      };
    });

  }));



  it('after the chat view is loaded we expect to receive a list of conversations. Converstaions list should be uqual 2', function() {
    var controller = createController();
    expect( scope.conversations.length ).toEqual(2);
  });

  it('after the chat view is loaded we expect to receive a list of users. Users list should be uqual 3', function() {
    var controller = createController();
    expect( scope.users.length ).toEqual(3);
  });

  it('if the user load one specific conversation, the application has to to show only the specific converstaion selected from the user', function() {
    var controller = createController();

    scope.loadConversation(0,'bar')
    expect( scope.messagesList.length ).toEqual(2);
  });
  it('if the user load one specific conversation, the application has to send a "see" status to the BE for each message was not seen yet ', function() {
    var controller = createController();
    spyOn(Ajax, 'see').and.callFake(function() {
      return {
        success: function(callback) { return callback( {},'200','', {params:{mid:'t16hup5ju2i6bt9'}})  },
        error: function(callback) { return '' }
      };
    });
    scope.loadConversation(0,'bar');
    expect(Ajax.see).toHaveBeenCalledWith('t16hup5ju2i6bt9', '52f9qp9lt72xzuxr');
    expect( scope.messagesList[0].seen ).toBe(true);
  });
  it('if the user send a new message, the conversation list should be updated with the last message', function() {
    var controller = createController();
    spyOn(Ajax, 'message').and.callFake(function() {
      return {
        success: function(callback) { return callback(
          {
            "mid": "111111111111111",
            "cid": "52f9qp9lt72xzuxr"
          },'200','', ''  
        )},
        error: function(callback) { return '' }
      };
    });
    scope.conversationPeer = 'bar';
    scope.conversationId = '52f9qp9lt72xzuxr';
    scope.sendMyNewMessage('how are you');
    expect(Ajax.message).toHaveBeenCalledWith('bar','how are you');
    expect( scope.conversations[0].messages.length ).toEqual(3);
  });
  it('if the user receive one event "message seen" the application has to set this specific message -> seen=true', function() {
    var controller = createController();
    scope.updateConversationAttr('rm30albkzlivn29','lr71haal83nb3xr','seen',false);
    expect( scope.conversations[1].messages[0]['seen'] ).toMatch("false");
  });
  it('if the user receive one event "he likes this message" the application has to set this specific message -> likedBy = user name', function() {
    var controller = createController();
    scope.updateConversationAttr('rm30albkzlivn29','lr71haal83nb3xr','like','baz');
    expect( scope.conversations[1].messages[0]['likedBy'] ).toMatch("baz");
  });
  it('if the user receive one event "he unlikes this message" the application has to set this specific message -> delete "user name" from likedBy list', function() {
    var controller = createController();
    scope.updateConversationAttr('rm30albkzlivn29','lr71haal83nb3xr','like','baz');
    scope.updateConversationAttr('rm30albkzlivn29','lr71haal83nb3xr','unlike','baz');
    expect( scope.conversations[1].messages[0]['likedBy'] ).not.toMatch("baz");
  });


   


});
