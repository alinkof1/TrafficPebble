var lat;
var longi;
var intLat;
var intLong;
var loc1=1, loc2=2;
var check;
var RouteT, Route, RouteF, RouteR, RouteL;
var latA, longA, latB, longB;
var latdiff;
var longdiff;
var approachangle;
var forward1lat;
var forward2lat;
var right1lat;
var right2lat;
var left1lat;
var left2lat;
var forward1long;
var forward2long;
var right1long;
var right2long;
var left1long;
var left2long;
var data;
var data1;
// Function to send a message to the Pebble using AppMessage API

function ackhandler(){
			console.log("ackhandler");
}

function nackhandler(){
			console.log("nackhandler");
      sendMessage();
}


function findRoute(location) {
	lat = location.coords.latitude;
	longi = location.coords.longitude;
	var xmlHttp = null;
	
	xmlHttp = new XMLHttpRequest();
	
  xmlHttp.open( "GET", "http://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0="+latA+","+longA+"&wp.1="+latB+","+longB+"&key=ApQ8n2DzTKxA0F4fnEtvfkaotjnCyx9nZ6xdB0ez43NrtSa2iJXBFM4mbIz6r3pa", false);
	xmlHttp.onload = function(e) {
		if(xmlHttp.readyState == 4 && xmlHttp.status == 200) 
			{
			data = JSON.parse(xmlHttp.responseText);
			}
		};
  Route = data.response.travelDuration;
	xmlHttp.send(null);
	}

function sendMessage() {
    Pebble.sendAppMessage({"forward": 3, "right": 4, "left": 5}, ackhandler, nackhandler);
  console.log("entered JS sendMessage");
}

function intersectCheck() {
	check = 1;
  console.log("entered intersectCheck");
/*	getIntersect();
  getTimes();
	if(loc1 != intLat || loc2 != intLong) {
		loc1 = intLat;
		loc2 = intLong;
		getTimes();
		check = 0;
		}
    */
}

function getAngle(){
  getLocation();
  latdiff = intLat - lat;
  longdiff = intLong - longi;
  approachangle = Math.atan(longdiff/latdiff);
}

function getIntLocations(){
  forward1long = intLong+(0.0005*Math.sin(approachangle));
  forward1lat = intLat+(0.0005*Math.cos(approachangle));
  forward2long = intLong+(0.05*Math.sin(approachangle));
  forward2lat = intLat+(0.05*Math.cos(approachangle));
  
  right1long = intLong+(0.0005*Math.sin(approachangle-(3.141259/3)));
  right1lat = intLat+(0.0005*Math.cos(approachangle-(3.141259/3)));
  right2long = intLong+(0.05*Math.sin(approachangle-(3.141259/3)));
  right2lat = intLat+(0.05*Math.cos(approachangle-(3.141259/3)));
  
  left1long = intLong+(0.0005*Math.sin(approachangle-(3.141259/3)));
  left1lat = intLat+(0.0005*Math.cos(approachangle-(3.141259/3)));
  left2long = intLong+(0.05*Math.sin(approachangle-(3.141259/3)));
  left2lat = intLat+(0.05*Math.cos(approachangle-(3.141259/3)));
}
	
function getTimes() {
  
  console.log("entered gettimes");
  getAngle();
  getIntLocations();
  
	latA = forward1lat;
	longA = forward1long;
	latB = forward2lat;
	longB = forward2long;
	findTrafficRoute();
	findRoute();
  RouteF = Route - RouteT;
	
	latA = right1lat;
	longA = right1long;
	latB = right2lat;
	longB = right2long;
	findTrafficRoute();
	findRoute();
  RouteR = Route- RouteT;
	
	latA = left1lat;
	longA = left1long;
	latB = left2lat;
	longB = left2long;
	findTrafficRoute();
	findRoute();
  RouteL = Route - RouteT;
  
  sendMessage();
}
	
navigator.geolocation.getCurrentPosition(getLocation);
function getLocation(location) {
lat = location.coords.latitude;
longi = location.coords.longitude;

  var xmlHttp = null;
  xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET","http://www.j0sh.us:8888?latitude="+lat+"&longitude="+longi,false);
  xmlHttp.send();
}

//get location of intersection
navigator.geolocation.getCurrentPosition(getIntersect);

function getIntersect(location) {
  intLat= location.coords.latitude;
  intLong = location.coords.longitude;

     var xmlHttp = null;
  xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", "http://api.geonames.org/findNearestIntersection?latitude="+intLat+"&longitude="+intLong,false);
  xmlHttp.send( null );
}

function findTrafficRoute(location) {
    lat = location.coords.latitude;
    longi = location.coords.longitude;
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
	
    xmlHttp.open( "GET", "http://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0="+latA+","+longA+"&wp.1="+latB+","+longB+"&key=ApQ8n2DzTKxA0F4fnEtvfkaotjnCyx9nZ6xdB0ez43NrtSa2iJXBFM4mbIz6r3pa", false);
	xmlHttp.onload = function(e) {
		if(xmlHttp.readyState == 4 && xmlHttp.status == 200) 
     data1 = JSON.parse(xmlHttp.responseText);
		if(xmlHttp && xmlHttp.length > 0) 
    RouteT = data.response.travelDurationTraffic;	
	xmlHttp.send(null);

  };
}


	//end additions



// Called when JS is ready
Pebble.addEventListener("ready",
							function(e) {
            console.log("Ready: ");
							});
												
// Called when incoming message from the Pebble is received
Pebble.addEventListener("appmessage",
							function(e) {
								console.log("Received Status: " );
								console.log("Received Message: " );
                intersectCheck();
                console.log("entering JSsendMessage");
                sendMessage();
                console.log("exited JSsendMessage");
							});



