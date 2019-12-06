var airportsEndpoint = "https://script.google.com/macros/s/AKfycbyqZu5iwgp2C0Sk35PbTkJ1U3-lAfJej1TncdLxMAxaRmWdTg/exec";
var weatherEndpoint1 = "https://api.openweathermap.org/data/2.5/weather?q="; //part 1
var weatherEndpoint2 = "&APPID=6ca9f07af4e6201093a5d4f1dfd864f1"             //part 2
var markerArray = [];


$(document).ready(function() {
    
    window.mdc.autoInit(); //google material
     
    // creating a var reference just to save code later
    var drawer = $("aside")[0].MDCDrawer;


    // when menu icon is clicked, toggle drawer open property
    $(".mdc-top-app-bar__navigation-icon").on("click", function(){
        drawer.open = !drawer.open;
    });
    
    //NAVIGATE THROUGH SCREENS:
    function hideScreens() {
        $(".content").hide();
    }
    $(".mdc-list-item").on("click", function() {
        
        hideScreens();
        drawer.open = !drawer.open; //close
        var target = $(this).attr("href");
        $(target).show();
    });
    
 
    
    //show home page:
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    $("#search").show();
    
    
    
    
    
    
    //CLICK THE GO BUTTON:
    $("#airportButton").on("click", function(e) {
        
        console.log("clicked airport button");
        
        //CLEAR PREVIOUS RESULTS
        
        function deleteMarkers(){
          markerArray.forEach(function(m){ //remove each marker from map and delete it.
               m.setMap(null);    //remove
               m=null;            //delete
          });
          markerArray = []; //reset
        }
        
        deleteMarkers();       //remove previous markers from map
        $(".contentMessage").hide();             //hide message
        $(".mdc-list-item.airport-item").remove(); //clear any previous list entries                
        $(".mdc-card.demo-card").remove();         //clear any previous cards
        
        

        
        
        //GET AND USE DATA:
        $.get(airportsEndpoint, function(responses) { //get url

            var input = $("#input").val();
            function checkAirportName(response) { //filter results:
                return ((input.toLowerCase() === response[0].toLowerCase()  //ident
                    || input.toLowerCase() === response[2].toLowerCase()  //airport name
                    || input.toLowerCase() === response[7].toLowerCase()  //municipality
                    || input.toLowerCase() === response[8].toLowerCase()  //gps code
                    || input.toLowerCase() === response[9].toLowerCase()  //iata code
                    || input.toLowerCase() === response[10].toLowerCase()) //local code
                    && input != '');
            }
            
            //filter out only the airports that match the name in input field:
            responses = responses.filter(checkAirportName);
            var storedResponses = responses; //store
            
            
            //display results message:
            var length = responses.length;
            if (length == 0)       $(".contentMessage").text("No airports found"); //if no results: show "no results" message
            else if (length == 1)  $(".contentMessage").text("Found 1 result");
            else                   $(".contentMessage").text("Found " + length + " results");
            
            $(".contentMessage").show();             //reshow message
            
            //FOR EACH JSON ELEMENT, (1) HIGHLIGH MARKER ON MAP (2) GET DATA ONTO INFO WINDOW (3):DISPLAY DETAILS ON DETAILS SCREEN (inner button clicked?)
            
            //FOR EACH RESPONSE:
            $.each(responses, function(i, v) {
                
                

                
                
                

                //PUT MARKER ON MAP:
                
                var coordinates = v[11].split(', ');
                var pinLocation = {lat: parseFloat(coordinates[1]), lng: parseFloat(coordinates[0])};

                

                
                //create marker
                var marker = new google.maps.Marker({
                    position: pinLocation, 
                    map: map
                });

                map.setCenter(pinLocation);
//                 map.setZoom(2);
                markerArray.push(marker);

                var contentString = 
                  '<div id="contentString">'+
                  '<p>' + v[2] + '</p>' +                            
                  '</div>';    //end contentString

                //create info window
                var infowindow = new google.maps.InfoWindow({
                  content: contentString
                });

                //open info window on marker click
                marker.addListener('click', function() {
                  infowindow.open(map, marker);
                });
                
    
                
                //BUILD CARD COMPONENTS:
                
                var listItem = [                                                      //create your own attribute and prefix it with data.
                    '<li class="mdc-list-item airport-item" href="#list" tabindex="0" data-code=' + v[0] + '>',  //v[0] -> airport code

                      '<span class="mdc-list-item__text">',
                        '<span class="mdc-list-item__primary-text">' + v[2] + ' (' + v[9] + ')' + '</span>',
                        '<span class="mdc-list-item__secondary-text">' + v[7] + ', ' + v[5] + '</span>',
                      '</span>',
                    '</li>',
                ].join("\n"); //join on newline
                
                $("#listItems").append(listItem); //apend
                
            }); //end each
            

            
           
            //build card html:
            
            function buildCard(code){
                
                //loop through filtered results to target this code, now you have resulting airport
                var target;
                for (const storedResponse of storedResponses) {
                    if(storedResponse[0] === code) target = storedResponse;
                }
                
                
                //trying weather data:
                weatherEndpoint = weatherEndpoint1 + target[7] + "," + target[5] + weatherEndpoint2;
                var temperature;
                var description;
                $.get(weatherEndpoint, function(weatherResponse){
                    var farenheit = weatherResponse.main.temp * 9 / 5 - 459.67;   //Kelvin to Farenheit
                    temperature = Math.round(farenheit) + " °F";
                    
                    description = weatherResponse.weather[0].description;
                    $("#weatherLine").text(temperature + '     ' + description);
                });
                
                console.log("before card");
                var card = [
                '<div class="mdc-card demo-card">',
                    '<div class="mdc-card__primary-action demo-card__primary-action" tabindex="0">',
                        '<div class="mdc-card__media mdc-card__media--16-9 demo-card__media" style="background-image: url(&quot;https://material-components.github.io/material-components-web-catalog/static/media/photos/3x2/2.jpg&quot;);"></div>',
                        '<div class="demo-card__primary">',
                            '<h2 class="demo-card__title mdc-typography mdc-typography--headline6">' + target[2] + ' (' + target[9] + ')' + '</h2>',
                            '<h3 class="demo-card__subtitle mdc-typography mdc-typography--subtitle2">' + target[1] + ' in ' + target[7] + ', ' + target[5] + '</h3>',
                        '</div>',
                        '<div id="weatherLine" class="demo-card__secondary mdc-typography mdc-typography--body2"></div>',
                        '<div class="demo-card__secondary mdc-typography mdc-typography--body2">Elevation: ' + target[3] + ' ft</div>',
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

            
            //CLICK EVENT ON AIRPORT ITEM:
            
            $(".mdc-list-item.airport-item").on("click", function() {
                
                $(".mdc-card.demo-card").remove(); //clear any previous cards
                
                buildCard($(this).attr("data-code")); //build card. pass in the airport code.

                hideScreens();
                var target = $(this).attr("href");
                $(target).show();
                
                
                //map button event:
                $("#goToMapButton").on("click", function() {
                    map.setZoom(10);
                    hideScreens();
                    $("#map").show();
                });
            });   
            
        }); //end get
        
        

        
        
        
    }); //end go button on-click
    
}); //end doc-ready





// window.onload = () => {
//   'use strict';

//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker
//              .register('./sw.js');
//   }
// }