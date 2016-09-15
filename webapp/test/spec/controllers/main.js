

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('webApp'));


  var scope, httpBackend, createController,location,cookies;

  beforeEach(inject(function($rootScope, $httpBackend, $controller, _Ajax_, $location,$cookies) {
      httpBackend = $httpBackend;
      Ajax = _Ajax_;
      location = $location;
      cookies = $cookies;
      scope = $rootScope.$new();

      createController = function() {
          return $controller('MainCtrl', {
              $scope: scope
              //_Ajax: Ajax
          });
      };
  }));
  it('after user registration the user should be redirect to /chat view', function() {
    var controller = createController();

    spyOn(Ajax, 'register').and.callFake(function() {
      return {
        success: function(callback) { return callback( {token: "7npsw88ygvd0lik9"},'200', '', '' ); },
        error: function(callback) { return '' }
      };
    });
    scope.registerLogin('simone','abc','register');

    expect(Ajax.register).toHaveBeenCalledWith('simone', 'abc');
    expect(location.path()).toMatch("/chat");
  });
  it('after user registration the application has to set a valid token in the browser cookies section', function() {
    var controller = createController();

    spyOn(Ajax, 'register').and.callFake(function() {
      return {
        success: function(callback) { return callback( {token: "7npsw88ygvd0lik9"},'200', '', '' ); },
        error: function(callback) { return '' }
      };
    });
    scope.registerLogin('simone','abc','register');

    expect(Ajax.register).toHaveBeenCalledWith('simone', 'abc');
    expect(cookies.get('token')).toBeDefined();
    expect(cookies.get('token')).not.toBeNull();
  });
  it('after user login the user should be redirect to /chat view', function() {
    var controller = createController();

    spyOn(Ajax, 'register').and.callFake(function() {
      return {
        success: function(callback) { return callback( {token: "7npsw88ygvd0lik9"},'200', '', '' ); },
        error: function(callback) { return '' }
      };
    });
    scope.registerLogin('simone','abc','register');

    expect(Ajax.register).toHaveBeenCalledWith('simone', 'abc');
    expect(location.path()).toMatch("/chat");
  });
  it('after user login the application has to set a valid token in the browser cookies section', function() {
    var controller = createController();

    spyOn(Ajax, 'register').and.callFake(function() {
      return {
        success: function(callback) { return callback( {token: "7npsw88ygvd0lik9"},'200', '', '' ); },
        error: function(callback) { return '' }
      };
    });
    scope.registerLogin('simone','abc','register');

    expect(Ajax.register).toHaveBeenCalledWith('simone', 'abc');
    expect(cookies.get('token')).toBeDefined();
    expect(cookies.get('token')).not.toBeNull();
  });
  it('after a not valid user registration the "error variables" should be false', function() {
    var controller = createController();

    spyOn(Ajax, 'register').and.callFake(function() {
      return {
        success: function(callback) { return '' },
        error: function(callback) { return callback( '','400', '', '' ) }
      };
    });
    scope.registerLogin('simone','abc','register');

    expect( scope.username.error ).toBe(true);
    expect( scope.password.error ).toBe(true);
  });
  it('after a valid user registration the "error variables" should be false', function() {
    var controller = createController();

    spyOn(Ajax, 'register').and.callFake(function() {
      return {
        success: function(callback) { return callback( {token: "7npsw88ygvd0lik9"},'200', '', '' ); },
        error: function(callback) { return '' }
      };
    });
    scope.registerLogin('simone','abc','register');

    expect( scope.username.error ).toBe(false);
    expect( scope.password.error ).toBe(false);
  });
 
});
