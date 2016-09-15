## Installation

- npm install
- npm install -g grunt-cli
- npm install -g bower
- bower install

## Build / Test / Run 

- grunt clean
- grunt build //project building
- grunt test //project testing  
- grunt serve //project running (develop mode)  

- Default port: 
  - the webApp runs on port: 9001 (In the grunt file is possible to change this port)
  - the server needs to run on port 43300 (Is possible to change this port in the file app/scripts/app.js)

## The webApp code is under the "app" folder. This application is based on Angular JS 

- the WebApp is composed of:
  - 2 views (main.html and chat.html). 
    - main.html is the html code for Registration and Login
    - chat.html is the html code for all the chat functionalities
  - 2 controllers (main.js,chat.js)
    - main.js is the JS code for Registration and Login
    - chat.js is the JS code for all the chat functionalities
  - 3 services in app.js file
  	- Auth service provides these functions: setToken (set cookie), removeToken, gettoken
  	- Ajax service provides these functions: setToken (set X-Auth-Token), register, login, logout, message, like, unlike, see, conversations, users
  	- PubSub service (Pub/Sub design patter) provides 4 functions for handle events: subscribe, unSubscribe, setWebSocketToken, getWebSocketConnection
  - 2 styles files: main.css and chat.css
  
## The webApp test structure is under the "test" folder. It's based on Jasmine and Karma (runner). 
  - The test structure is composed of 2 files: main.js and chat.js. The code in these 2 files permits to test the main functionalities of the application (Registration, Login, Redirections, error messages in Register and Login, conversations loading, send new message, events handle ). In order to simulate the BE http responses i created a http mocks responses.
    - main.js runs all the test for Registration and Login
    - chat.js runs all the test for all the rest of the chat functionalities


## NB If you run the application simulating 3 users take care that different instances of Chrome store the cookies in the same db. For my demo i used 1 instance chrome incognito, 1 instance normal chrome, 1 firefox instance