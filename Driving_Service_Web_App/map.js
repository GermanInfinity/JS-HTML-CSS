var myLat = 0;
var myLng = 0;
var dist = 0;
var weiner_dist = 0;
var map;
var marker;
var present = false;
var driver = false;
var start = false;

function init() {
  var me = new google.maps.LatLng(myLat, myLng);

  var myOptions = {
    zoom: 17, 
    center: me,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

   // got map, map takes in arguement for its size and etc.
   // call get my location
  getMyLocation();
}

function getMyLocation() {
  if (navigator.geolocation) { 
    navigator.geolocation.getCurrentPosition(function(position) { 
      myLat = position.coords.latitude;
      myLng = position.coords.longitude;
      renderMap();
    }, function(error) {
                console.error(error);
            });
  }
  else {
    alert("Geolocation is not supported by your web browser.  What a shame!");
  }
}

function renderMap() {
  me = new google.maps.LatLng(myLat, myLng);
  var infowindow = new google.maps.InfoWindow();
  //var check;
  map.panTo(me);
  loadRequest();

  

}

function loadRequest(){
  var request = new XMLHttpRequest();

  var user = {"username": "NgfcWZmS",//"pCH9E2zt", //NgfcWZmS
        lat: myLat,
        lng: myLng } 

  request.open("POST", "https://calm-lowlands-47601.herokuapp.com/rides", true);
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  request.onreadystatechange = function() {
    /*this request responds after one iteration*/
    if (request.readyState == 4 && request.status == 200) {
      theData = request.responseText;
      messages = JSON.parse(theData);
      message_received = document.getElementById("messages");

      /*Shortest distance, marker and info window on map.*/
      if (messages.passengers){ //driver
        var info = new google.maps.InfoWindow();
        var infowindow = new google.maps.InfoWindow();
        var distanceArray = new Array();
        driver = true;
        
        /*Shortest distance, display passengers*/
        for (i = 0; i < messages.passengers.length; i++){
        
          user_lat = messages.passengers[i].lat;
          user_lng = messages.passengers[i].lng;
          
          var userLatLng = {lat: user_lat, lng: user_lng};
          ans = Haversine(user_lat, user_lng, myLat, myLng);

          if (messages.passengers[i].username=="WEINERMOBILE"){ 
            weiner_marker = new google.maps.Marker({
                    position: userLatLng,
                    map: map,
                    username: "Weinermobile",
                    icon: "weinermobile.png"
              });
            present = true; 
            weiner_dist = Haversine(user_lat, user_lng, myLat, myLng);

          }
          else{
                passenger_marker = new google.maps.Marker({
                        position: userLatLng,
                        map: map,
                        username: messages.passengers[i].username + " is " + ans + " miles away from me.",
                        distance_from_me: ans,
                        icon: "pix.jpg"
                  });
                
                google.maps.event.addListener(passenger_marker, 'click', function() {
                info.setPosition(this.position);
                info.setContent(this.username);
                info.open(map, this);
              });
          }
          distanceArray.push(ans);
        }

        dist = Math.min.apply(null, distanceArray); 

        /*Markers*/
        marker = new google.maps.Marker({
          position: me,
          map: map,
          username: user.username, 
          icon: "car.png"
        });

        google.maps.event.addListener(marker, 'click', function() {
        if (!present){
          infowindow.setContent(marker.username + "<br>" +
                    "Distance to closest passenger: " + dist +
                    "<br>The Weinermobile is nowhere to be seen.");
        }
        else{
          infowindow.setContent(marker.username + "<br>" +
                    "Distance to closest passenger: " + dist + "<br>" + 
                    " The Weinermobile is " + weiner_dist + 
                    " miles away from me!");
        }
        infowindow.open(map, marker);
      });

      }


      else if (messages.vehicles){ //passenger - works
        var info = new google.maps.InfoWindow();
        var infowindow = new google.maps.InfoWindow();
        var distanceArray = new Array();

        /*Shortest distance, display vehicles*/
        for (i = 0; i < messages.vehicles.length; i++){
        
          user_lat = messages.vehicles[i].lat;
          user_lng = messages.vehicles[i].lng;
          
          var userLatLng = {lat: user_lat, lng: user_lng};
          ans = Haversine(user_lat, user_lng, myLat, myLng);

          if (messages.vehicles[i].username=="WEINERMOBILE"){ 
                weiner_marker = new google.maps.Marker({
                        position: userLatLng,
                        map: map,
                        username: "Weinermobile",
                        icon: "weinermobile.png"
                  });
                present = true;
                weiner_dist = Haversine(user_lat, user_lng, myLat, myLng);

          }
          else{
                vehicle_marker = new google.maps.Marker({
                        position: userLatLng,
                        map: map,
                        username: messages.vehicles[i].username + " is " + ans + " miles away from me.",
                        distance_from_me: ans,
                        icon: "car.png"
                  });

                  google.maps.event.addListener(vehicle_marker, 'click', function() {
                  info.setPosition(this.position);
                  info.setContent(this.username);
                  info.open(map, this);
                });
                }       
                distanceArray.push(ans);
              }
              dist = Math.min.apply(null, distanceArray); 
      }


      /*Markers*/
      marker = new google.maps.Marker({
          position: me,
          map: map,
          username: user.username, 
          icon: "pix.jpg"
      });
      
      google.maps.event.addListener(marker, 'click', function() {
      if (!present){
        infowindow.setContent(marker.username + "<br>" +
                  "Distance to closest ride: " + dist +
                  "<br>The Weinermobile is nowhere to be seen.");
      }
      else{
        infowindow.setContent(marker.username + "<br>" +
                  "Distance to closest ride: " + dist + "<br>" + 
                  " The Weinermobile is " + weiner_dist + 
                  " miles away from me!");
      }
      infowindow.open(map, marker);
    });
    

    }


    else if (request.readyState == 4 && request.status != 200) {
        //404: Not found! or 500: Internal Server Error
        document.getElementById("location").innerHTML =
                     "<p>Something's not right.</p>";
      }

  };

  data_to_send = "username=" + user.username + "&lat=" + user.lat + "&lng=" 
                              + user.lng;
  request.send(data_to_send);

}

function Haversine(userLat, userLng, my_Lat, my_Lng){ 

    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    }

    var lat2 = userLat; 
    var lon2 = userLng; 
    var lat1 = my_Lat; 
    var lon1 = my_Lng; 

    var R = 3958.755866; 
    var x1 = lat2-lat1;
    var dLat = x1.toRad();  
    var x2 = lon2-lon1;
    var dLon = x2.toRad();  
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);  
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; 
    return d;

}

