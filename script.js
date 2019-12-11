//ENDPOINTS:

var airportsEndpoint = "https://script.google.com/macros/s/AKfycbyqZu5iwgp2C0Sk35PbTkJ1U3-lAfJej1TncdLxMAxaRmWdTg/exec";
var weatherEndpoint1 = "https://api.openweathermap.org/data/2.5/weather?q="; //part 1
var weatherEndpoint2 = "&APPID=6ca9f07af4e6201093a5d4f1dfd864f1"             //part 2
var markerArray = [];


//CREATE AN INDEXED DB:

const db = new Dexie('HistoryDatabase');    

// Declare tables, IDs and indexes
db.version(1).stores({
    items: '++id, heading, subheading'
});

//Populate db on run
$("#historyItems").empty();
db.items.each(item => buildHistoryItem(item.heading, item.subheading));


function buildHistoryItem(search_query, date){
    var historyItem = [
        '<li class="mdc-list-item history-item" href="#" tabindex="0">',
          '<span class="mdc-list-item__text">',
            '<span class="mdc-list-item__primary-text">' + search_query + '</span>',
            '<span class="mdc-list-item__secondary-text">' + date + '</span>',
          '</span>',
        '</li>',
        ].join("\n"); //join on newline

    $("#historyItems").append(historyItem);             
}



//DOCUMENT READY:

$(document).ready(function() {
    
    //GOOGLE MATERIAL:

    window.mdc.autoInit(); //google material init
     
    // creating a var reference just to save code later
    var drawer = $("aside")[0].MDCDrawer;


    //NAVIGATE THROUGH SCREENS:
    
    // when menu icon is clicked, toggle drawer open property
    $(".mdc-top-app-bar__navigation-icon").on("click", function(){
        drawer.open = !drawer.open;
    });

    //navigate through screens
    $(".mdc-list-item").on("click", function() {
        hideScreens();
        drawer.open = !drawer.open; //close
        var target = $(this).attr("href");
        $(target).show();
    });
    
    function hideScreens() {
        $(".content").hide();
    }
    
    //show starting page:
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    $("#search").show();
    
    
    
    
    //CLICK THE GO BUTTON:
    
    $("#airportButton").on("click", function(e) {
        
        
        //CLEAR PREVIOUS RESULTS:
        
        function deleteMarkers(){
          markerArray.forEach(function(m){ //remove each marker from map and delete it.
               m.setMap(null);    //remove
               m=null;            //delete
          });
          markerArray = []; //reset
        }
        
        deleteMarkers();       //remove previous markers from map
        $(".contentMessage").hide();               //hide message
        $(".mdc-list-item.airport-item").remove(); //clear any previous list entries                
        $(".mdc-card.demo-card").remove();         //clear any previous cards
        
        
        //GET AND USE DATA:
        $.get(airportsEndpoint, function(responses) { //get url

            //filter function:
            var input = $("#input").val();
            function checkAirportName(response) { //filter results:
                return ((input.toLowerCase() === response[0].toLowerCase()  //ident
                    ||   input.toLowerCase() === response[2].toLowerCase()  //airport name
                    ||   input.toLowerCase() === response[7].toLowerCase()  //municipality
                    ||   input.toLowerCase() === response[8].toLowerCase()  //gps code
                    ||   input.toLowerCase() === response[9].toLowerCase()  //iata code
                    ||   input.toLowerCase() === response[10].toLowerCase()) //local code
                    &&   input != '');
            }
            
            //FILTER OUT ONLY THE AIRPORTS THAT MATCH THE NAME IN INPUT FIELD:
            responses = responses.filter(checkAirportName);
            var storedResponses = responses; //store
            
            
            //DISPLAY RESULTS MESSAGE:
            var length = responses.length;
            if (length === 0)       $(".contentMessage").text("No airports found"); //if no results: show "no results" message
            else if (length === 1)  $(".contentMessage").text("Found 1 result");
            else                   $(".contentMessage").text("Found " + length + " results");
            
            $(".contentMessage").show();             //reshow message
            

            //FOR EACH RESPONSE:
            $.each(responses, function(i, v) {
                

                //(1) PUT MARKER ON MAP:
                
                var coordinates = v[11].split(', ');
                var pinLocation = {lat: parseFloat(coordinates[1]), lng: parseFloat(coordinates[0])};
                
                //create marker:
                var marker = new google.maps.Marker({
                    position: pinLocation, 
                    map: map
                 // title: aa
                });

                //adjust marker:
                map.setCenter(pinLocation);
                map.setZoom(10);
                markerArray.push(marker); //push to marker array

                
                //(2) CREATE AN INFO WINDOW:
                
                var contentString =    //info window text
                  '<div id="contentString">'+
                  '<p>' + v[2] + '</p>' +                            
                  '</div>';

                //create info window:
                var infowindow = new google.maps.InfoWindow({
                  content: contentString
                });

                //open info window on marker click:
                marker.addListener('click', function() {
                  infowindow.open(map, marker);
                });
    
                
                //(3) BUILD AIRPORT RESULTS ITEMS:
                
                var listItem = [                                                      //create your own attribute and prefix it with data.
                    '<li class="mdc-list-item airport-item" href="#list" tabindex="0" data-code=' + v[0] + '>',  //v[0] -> airport code

                      '<span class="mdc-list-item__text">',
                        '<span class="mdc-list-item__primary-text">' + v[2] + ' (' + v[9] + ')' + '</span>',
                        '<span class="mdc-list-item__secondary-text">' + v[7] + ', ' + v[5] + '</span>',
                      '</span>',
                    '</li>',
                ].join("\n"); //join on newline
                
                $("#listItems").append(listItem); //append
                
            }); //end for-each
           
            
            
            //CLICK AN AIRPORT RESULT ITEM:
            
            $(".mdc-list-item.airport-item").on("click", function() {
                
                //clear any previous cards:
                $(".mdc-card.demo-card").remove();    
                
                //build card; pass in the airport code to maintain item's identity:
                buildCard($(this).attr("data-code")); 

                //switch to list tab:
                hideScreens();
                var target = $(this).attr("href");
                $(target).show();
                
                
                //CLICK MAP BUTTON ON CARD:
                $("#goToMapButton").on("click", function() {
                    hideScreens();
                    $("#map").show(); //switch to map
                });
            });  
            
            
            //BUILD-CARD FUNCTION:
            function buildCard(code){ //build a card using airport code "code"
                
                //loop through filtered results to target this code and locate this airport
                var target;
                for (const storedResponse of storedResponses) {
                    if(storedResponse[0] === code) target = storedResponse;
                }
                
                //get weather data:
                weatherEndpoint = weatherEndpoint1 + target[7] + "," + target[5] + weatherEndpoint2; //concat to build url
                var temperature;
                var description;
                $.get(weatherEndpoint, function(weatherResponse){
                    var farenheit = weatherResponse.main.temp * 9 / 5 - 459.67;   //Kelvin to Farenheit
                    temperature = Math.round(farenheit) + "°F";
                    
                    description = weatherResponse.weather[0].description;
                    $("#weatherLine").text(description + " · " + temperature);  //ex: clear sky · 46°F
                });
                
                //capture time:
                var date = new Date;
                var time = date.toString().split(' ')[4].substring(0,5); //get time from date
                
                
                //BUILD THE CARD USING GOTTEN DATA ABOVE:
                console.log("before card");
                var card = [
                '<div class="mdc-card demo-card">',
                    '<div class="mdc-card__primary-action demo-card__primary-action" tabindex="0">',
                        '<div class="mdc-card__media mdc-card__media--16-9 demo-card__media" style="background-image: url(https://cdn.archpaper.com/wp-content/uploads/2019/09/10690_N9959.jpg);"></div>',
                        '<div class="demo-card__primary">',
                            '<h2 class="demo-card__title mdc-typography mdc-typography--headline6">' + target[2] + ' (' + target[9] + ')' + '</h2>',
                            '<h3 class="demo-card__subtitle mdc-typography mdc-typography--subtitle2">' + target[1] + ' in ' + target[7] + ', ' + target[5] + '</h3>',
                        '</div>',
                        '<div class="demo-card__secondary mdc-typography mdc-typography--body2">Elevation: ' + target[3] + ' ft</div>',
                        '<div id="weatherLine" class="demo-card__secondary mdc-typography mdc-typography--body2"></div>',
                        '<div id="weatherLine" class="demo-card__secondary mdc-typography mdc-typography--body2">' + time + ' CT</div>',
                    '</div>',
                    '<div class="mdc-card__actions">',
                        '<div class="mdc-card__action-buttons">',
                            '<button class="mdc-button mdc-card__action mdc-card__action--button" id="goToMapButton"> <span class="mdc-button__ripple"></span> Map</button>',
                            '<button class="mdc-button mdc-card__action mdc-card__action--button"> <span class="mdc-button__ripple"></span> Bookmark</button>',
                        '</div>',
                        '<div class="mdc-card__action-icons">',
                            '<button class="mdc-icon-button mdc-card__action mdc-card__action--icon--unbounded" aria-pressed="false" aria-label="Add to favorites" title="Add to favorites">',
                                '<i class="material-icons mdc-icon-button__icon mdc-icon-button__icon--on">favorite</i>',
                                '<i class="material-icons mdc-icon-button__icon">favorite_border</i>',
                            '</button>',
                            '<button class="mdc-icon-button material-icons mdc-card__action mdc-card__action--icon--unbounded" title="Share" data-mdc-ripple-is-unbounded="true">share</button>',
                            '<button class="mdc-icon-button material-icons mdc-card__action mdc-card__action--icon--unbounded" title="More options" data-mdc-ripple-is-unbounded="true">more_vert</button>',
                        '</div>',
                    '</div>',
                '</div>'
                ].join("\n"); //join on newline

                $("#list").append(card); //append to list

            } 

  
        }); //end get
        
        
        //ADD SEARCH QUERY TO INDEXED DB:  
        var search_query = $("#input").val();
        var date = new Date();
        
        db.items.add({
            heading: search_query,
            subheading: date
        }).then(buildHistoryItem(search_query, date));
        
        
        
    }); //end GO button on-click
    
    
    
}); //end doc-ready





// window.onload = () => {
//   'use strict';

//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker
//              .register('./sw.js');
//   }
// }