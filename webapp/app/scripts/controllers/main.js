'use strict';

angular.module('webApp')
.controller('MainCtrl', ['$scope', '$rootScope', '$routeParams', 'Auth', '$location', 'Ajax',
    function($scope, $rootScope, $routeParams, Auth, $location, Ajax) {

    	$scope.msg = 'hello';

    	$scope.username = {
    		val: null,
    		error: false
    	}
    	$scope.password = {
    		val: null,
    		error: false
    	}

    	var storeUsername = localStorage.getItem("username");
    	var token = Auth.getToken('token');
    	if (storeUsername != undefined && storeUsername != null && token != undefined && token != null ) {
    		$location.path( "/chat" ).search({username: storeUsername});
    	}else{
    		localStorage.setItem("username", null);
    		Auth.removeToken("username");
    	}

    	$scope.message = 'Sign Up';

	 	$scope.signUpToogleStatus = true;
	  	$scope.signUpToogle = function(val){
	  		$scope.username.val = null;
	  		$scope.password.val = null;
	  		$scope.username.error = false;
	  		$scope.password.error = false;
	  		$scope.signUpToogleStatus = val;
	  		if ($scope.signUpToogleStatus) {
	  			$scope.message = 'Sign Up';
	  		}else{
	  			$scope.message = 'Welcome Back';
	  		}
	  	}

	  	$scope.registerLogin = function(username,password,type){

	  		if (type == 'register') {
		  		var result = Ajax.register(username,password);

		  		result.success(function(data, status, headers, config) {
		  			Auth.removeToken('token');
		  			var res = Auth.setToken('token', data.token);
			  		if (res) {
			  			localStorage.setItem("username", username);
			  			$location.path( "/chat" ).search({username: username});
			  		};
		  		})

		  		result.error(function(data, status, headers, config) {
	          		$scope.username.error = true;
		  			$scope.password.error = true;
	      		});	  	
	      	}else if (type == 'login') {
	      		var result = Ajax.login(username,password)
	      		result.success(function(data, status, headers, config) {
		  			var res = Auth.setToken('token', data.token);
			  		if (res) {
			  			localStorage.setItem("username", username);
			  			$location.path( "/chat" ).search({username: username});
			  		};
		  		});
		  		result.error(function(data, status, headers, config) {
	          		$scope.username.error = true;
		  			$scope.password.error = true;
	      		});	 
	      	};		
	  	}

	  	var par = $location.search();
      	if (par.status == 'login') {
      		$scope.signUpToogle(false);
      	};

}]);
