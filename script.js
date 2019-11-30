var endpoint = "https://script.google.com/macros/s/AKfycbyqZu5iwgp2C0Sk35PbTkJ1U3-lAfJej1TncdLxMAxaRmWdTg/exec";
var markerArray = [];

// function deleteMarkers(){} // (p2)

// function getUrlQuery() {}  // (p2)



$(document).ready(function() {
    
    window.mdc.autoInit(); //google material
     
    // creating a var reference just to save code later
    var drawer = $("aside")[0].MDCDrawer;


    // when menu icon is click, toggle drawer open property
    $(".mdc-top-app-bar__navigation-icon").on("click", function(){
        drawer.open = !drawer.open;
    });
    
    //NAVIGATE THROUGH SCREENS:
    function hideScreens() {
        $(".content").hide();
        drawer.open = !drawer.open; //close
    }
    $(".mdc-list-item").on("click", function() {
        
        hideScreens();
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
        //1)POSSIBLY CLEAR PREVIOUS RESULTS (p2)
        
        //QUERY AND USE DATA:
        $.get(endpoint, function(responses) { //get url

            
            //console.log(responses);
            var input = $("#input").val();

            //NO MATCHED DATA MESSAGE (p2)
                       
            
            //FOR EACH JSON ELEMENT, (1) HIGHLIGH MARKER ON MAP (2) GET DATA ONTO INFO WINDOW (3):DISPLAY DETAILS ON DETAILS SCREEN (inner button clicked?)
            
            
            function checkAirportName(response) { //filter results:
                return ((input == response[0]  //ident
                     || input == response[2]  //airport name
                     || input == response[7]  //municipality
                     || input == response[8]  //gps code
                     || input == response[9]  //iata code
                     || input == response[10]) //local code
                     && input != '');
            }
            
            responses = responses.filter(checkAirportName); //filter out only the airports that match the name in input field.
            
            //display results message:
            var length = responses.length;
            if (length == 0)       $(".contentMessage").text("No airports found"); //if no results: show "no results" message
            else if (length == 1)  $(".contentMessage").text("Found 1 result");
            else                   $(".contentMessage").text("Found " + length + " results");
            
            
            //FOR EACH RESPONSE:
            $.each(responses, function(i, v) {

                //PUT MARKER ON MAP:
                
                var coordinates = v[11].split(', ');
                var pinLocation = {lat: parseFloat(coordinates[1]), lng: parseFloat(coordinates[0])};

                //create marker
                var marker = new google.maps.Marker({
                    position: pinLocation, map: map
                });
                markerArray.push(marker);

                var contentString = 
                  '<div id="contentString">'+
                  '<p>Airport: ' + v[2] + '</p>' +                            
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
                
                var listItem = [
                    '<li class="mdc-list-item" tabindex="0">',
                    '<span class="mdc-list-item__text">',
                      '<span class="mdc-list-item__primary-text">' + v[2] + ' (' + v[9] + ')' + '</span>',
                      '<span class="mdc-list-item__secondary-text">' + v[7] + ', ' + v[5] + '</span>',
                    '</span>',
                    '</li>',
                ].join("\n"); //join on newline
                
                $("#listItems").append(listItem); //apend
                
                
                
                
                //build card html:
                var card = [
                '<div class="mdc-card demo-card">',
                    '<div class="mdc-card__primary-action demo-card__primary-action" tabindex="0">',
                        '<div class="mdc-card__media mdc-card__media--16-9 demo-card__media" style="background-image: url(&quot;https://material-components.github.io/material-components-web-catalog/static/media/photos/3x2/2.jpg&quot;);"></div>',
                        '<div class="demo-card__primary">',
                            '<h2 class="demo-card__title mdc-typography mdc-typography--headline6">Our Changing Planet</h2>',
                            '<h3 class="demo-card__subtitle mdc-typography mdc-typography--subtitle2">by Kurt Wagner</h3>',
                        '</div>',
                        '<div class="demo-card__secondary mdc-typography mdc-typography--body2">Visit ten places on our planet that are undergoing the biggest changes today.</div>',
                    '</div>',
                    '<div class="mdc-card__actions">',
                        '<div class="mdc-card__action-buttons">',
                            '<button class="mdc-button mdc-card__action mdc-card__action--button"> <span class="mdc-button__ripple"></span> Read</button>',
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
                
                $("#search").append(card); //apend

                
                
                
                
            }); //end each
            
        }); //end get
    }); //end on click
}); //end doc-ready