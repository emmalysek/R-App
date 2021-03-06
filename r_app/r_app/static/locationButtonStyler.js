
// Name Space
this.name = "LocationButtonStyler";
var RAPP = RAPP || {};

// Initialize
RAPP.LocationButtonStyler = ( function() {
    var OPEN = "Open";
    var CLOSE = "Close";
    var OPEN_24_HOUR = "-open24Hour";
    var THRESHOLD = 60;
    var CLOSING_SOON_STYLE = "btn-warning ";
    var OPEN_STYLE = "btn-success";
    var CLOSED_STYLE = "btn-danger";
    var STUDENT_24HOUR_STYLE = "btn-primary";
    var TIME_FORMAT = 'h:mm a';

    
    /**** Private Methods ****/
    
    /*
     * param: location_id
     * sets given location_id to have CLOSING_SOON_STYLE class
     */
    var setClosingSoonStyling = function( location_id ) {
        $( location_id ).addClass( CLOSING_SOON_STYLE );
    };
    
    /*
     * param: location_id
     * sets given location_id to have OPEN_STYLE class
     */
    var addOpenStyling = function( location_id ) {
        $( location_id ).addClass( OPEN_STYLE );
    };
    
    /*
     * param: location_id
     * sets given location_id to have STUDENT_24HOUR_STYLE class
     */
    var addOpen24HoursForStudentsStyling = function( location_id ) {
        $( location_id ).addClass( STUDENT_24HOUR_STYLE );
    };
    
    
    /*
     * param: location_id
     * sets given location_id to have CLOSE_STYLE class
     */
    var addClosedSyling = function( location_id ) {
        $( location_id ).addClass( CLOSED_STYLE );
    };
    
    /*
     * Gathers all location button id's
     * and today's opening and closeing
     * time Id's found in index.hmtl 
     *
     * return: object
     * object's key is location button id
     * object's key-value is array of time Ids for today
     */
    var getTodaysTimeIds = function() {
        var weekDay = RAPP.TimeManager.dayOfWeek();
        var locationAndTimes = RAPP.LocationManager.getLocationIdsToTimeIdsObject();
        var today= {};

        for ( locationId in locationAndTimes ) {
            today[ locationId ] = [];
            var timeIds = locationAndTimes[ locationId ];
            for ( var i = 0; i < timeIds.length; i++ ) {
                if ( timeIds[ i ].includes( weekDay )){
                    today[ locationId ].push( timeIds[ i ]);
                }
            }
        }
        return today;
    }
    
    /*
     * return: object
     * object's key is location button id
     * object's key-value is an Open or Close value
     * Open and Close value are numerical time values
     * for location opening and closing times
     */
    var currentLocationTimes = function() {
        var _today = getTodaysTimeIds();
        var currentLocationTimes = {}
        var timeIdAndValue = RAPP.LocationManager.getTimeIdtoTimeValueObject_Location();

        for ( loc in _today ) {
            if ( hasExceptionsToday( loc )) {
                var exceptionOpenArray;
                var exceptionCloseArray;
                var exceptionObj = getExceptionsToday( loc );
                
                for ( var exceptionId in exceptionObj ) {
                    if ( exceptionId.includes( OPEN )){
                        exceptionOpenArray = exceptionObj[ exceptionId ];
                    }
                    if ( exceptionId.includes( CLOSE )){
                        exceptionCloseArray = exceptionObj[ exceptionId ];
                    }
                }
                currentLocationTimes[ loc ] = {
                    OPEN: exceptionOpenArray,
                    CLOSE: exceptionCloseArray
                };

            } else {
                var currentTimeArray = _today[loc];
                for ( var j = 0; j < currentTimeArray.length; j++ ) {
                    if ( currentTimeArray[ j ].includes( OPEN )){
                        var openId = currentTimeArray[ j ];
                        openTimeArray = timeIdAndValue[ openId ];
                    }
                    if ( currentTimeArray[ j ].includes( CLOSE )){
                        var closeId = currentTimeArray[ j ];
                        closeTimeArray = timeIdAndValue[ closeId ];
                    }
                }
                currentLocationTimes[ loc ] = {
                    OPEN: openTimeArray,
                    CLOSE: closeTimeArray
                };
            }
        }
         return currentLocationTimes;
    };   
    
    // TO DO: when times include minutes as well
    // we must add that to time objects
    
    /*
     * Sets css styling classes to all location buttons
     * Uses location Id's and current time data 
     * found in currentLocationTimes() return value
     * 
     */ 
    var setLocationButtonStyles = function() {  
        var locAlwaysOpenToStudents = RAPP.LocationManager.getLocationsAlwaysOpenToStudents();
        var currentTime = RAPP.TimeManager.getMoment();
        var openTime;
        var closeTime;
        var locationTimesToday = currentLocationTimes();
        for ( location_id in locationTimesToday ) {
            var o_time = locationTimesToday[ location_id ].OPEN;
            openTime = makeMoment( o_time[0], o_time[1] );
            var c_time = locationTimesToday[ location_id ].CLOSE;
            closeTime = makeMoment( c_time[0], c_time[1] );
            
            if ( isClosingSoon( currentTime, openTime, closeTime )) {
                setClosingSoonStyling( location_id );
                
            } else if ( isOpen( currentTime, openTime, closeTime )) {
                addOpenStyling( location_id );
            
            } else if ( isOpen24HoursForStudentsOnly( location_id, locAlwaysOpenToStudents )) {
                addOpen24HoursForStudentsStyling( location_id );
                
            } else {
                addClosedSyling( location_id );
            }
        }
    };
    
    /*
     * params: {moment()} currentTime, openTime, closeTime
     * returns: {boolean} If location is currently open
     */ 
    var isOpen = function( currentTime, openTime, closeTime ) {
        if ( currentTime < openTime ) {
            return false; 
            
        } else if ( currentTime > closeTime ) {
            return false;
            
        } else {
            return true;
        }
    }
    
    /*
     * params: {moment()} currentTime, openTime, closeTime 
     * returns: {boolean} If location is closing within time THRESHOLD
     */ 
    var isClosingSoon = function( currentTime, openTime, closeTime ) {
        var thresholdTime = RAPP.TimeManager.getMomentWithOffset( THRESHOLD, 'minute' );
        if ( isOpen( currentTime, openTime, closeTime )) {
            if ( thresholdTime > closeTime ) {
                return true;
                
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    
    /*
     * params: location_id , locAlwaysOpenToStudents- array of locations open 24 hours for students
     * returns: {boolean} If location is open 24 Hours a day to students
     */ 
    var isOpen24HoursForStudentsOnly = function( location_id, locAlwaysOpenToStudents ) {
        var locId = location_id + OPEN_24_HOUR;
        var found = $.inArray( locId, locAlwaysOpenToStudents ) > -1;
        return found;
    };
    
    /*
     * params: location_id location if (example #Library)
     * returns: {boolean} If location has a calendar exception from regualr hours today 
     */
    var hasExceptionsToday = function( location_id ) {
        var hasExceptions = false;
        var object = RAPP.LocationManager.getExceptionTimeIdtoExceptionTimeValueObject();
        for ( var loc_id in object ){
            if ( loc_id.includes( location_id )){
                hasExceptions = true;
            }
        }
        return hasExceptions; 
    };
    
    /*
     * params: location_id location if (example #Library)
     * returns: {object} key is ids (ex: #Library-exceptionsClose) value is array of times 
     */
    var getExceptionsToday = function( location_id ) {
        var exceptionTimesForThisLocation = {};
        var object = RAPP.LocationManager.getExceptionTimeIdtoExceptionTimeValueObject();
        for ( var loc_id in object ){
            if ( loc_id.includes( location_id )){
                exceptionTimesForThisLocation[loc_id] = object[loc_id];
            }
        }
        return exceptionTimesForThisLocation; 
    };
    
    /*
     * Appends today's open and close time to location button
     * on index.html page
     */
    var setTodaysTimesToButton = function() {
        var locationTimes = currentLocationTimes();
        for ( loc_id in locationTimes ){
            var openTime = locationTimes[ loc_id ].OPEN;
            var closeTime = locationTimes[ loc_id ].CLOSE;
            var openMoment = makeMoment( openTime[0], openTime[1] );
            var closeMoment = makeMoment( closeTime[0], closeTime[1]) ;
            var open = openMoment.format( TIME_FORMAT ); 
            var close = closeMoment.format( TIME_FORMAT ); 
            // When open and close are the same, it means the location is closed for the day
            if ( open === close ) {
                $( loc_id ).append('<p>Closed All Day</p>');
            }
            else {
                $( loc_id ).append('<p>' + open + ' - ' + close +'</p>');
            }
        }
    };   
    
    /*
     * params: {int} hour, minute
     * returns: {moment()} moment
     *
     * Calls on RAPP.TimeManager.makeMoment function to create
     * custom moment
     */
    var makeMoment = function( hour, minute ) {
        return RAPP.TimeManager.makeMoment( hour, minute );
    }   
    
    /* 
     * Sets time specfic styles to Location Buttons
     * Displays current day's hours for location button
     */ 
    var init = function() {
        setLocationButtonStyles();
        setTodaysTimesToButton();
    };
         
    /**** Public Methods ****/ 
    return {
        
        init: function() {
            init();
        }
    }
})();