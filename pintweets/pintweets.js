/**
 * Creates an instance of PinTweets
 *
 * @constructor
 * @this {PinTweets}
 * @param {String} mapId The ID of the element to contain the PinTweets map
 */
function PinTweets(mapId, options) {
	this.mapId = mapId;
	this.DEBUG = false;
	this.map = null;
	this.interval = null
	this.intervalId = null;
	this.mapTypeId = null;
	this.center = null;
	this.max_results = null;
	this.query = null;
	this.zoom = null;
	this.include_entities = null;
	this.tweetHandler = null;
	this.searches_max = null;
	this.searches_performed = null;
	this.content = [];
	this.markers = [];

	this.initialize = function() {
		var lat = typeof (options['lat']) != 'undefined' ? options['lat'] : 39.031046;
		var lng = typeof (options['lng']) != 'undefined' ? options['lng'] : -94.48190670000002;
		this.center = new google.maps.LatLng(lat, lng);
		this.mapTypeId = typeof (options['mapTypeId']) != 'undefined' ? options['mapTypeId'] : google.maps.MapTypeId.ROADMAP;
		this.tweetHandler = typeof (options['tweetHandler']) != 'undefined' ? options['tweetHandler'] : null;
		this.interval = typeof (options['interval']) != 'undefined' ? options['interval'] : 2000;
		this.include_entites = typeof (options['include_entities']) != 'undefined' ? options['include_entities'] : false;
		this.query = typeof (options['query']) != 'undefined' ? options['query'] : null;
		this.max_results = typeof (options['max_results']) != 'undefined' ? options['max_results'] : 6;
		this.searches_max = typeof (options['searches_max']) != 'undefined' ? options['searches_max'] : 5;
		this.searches_performed = 0;

		/*
		 * Build map object
		 */
		mapOptions = {
			center : this.center,
			zoom : 3,
			mapTypeId : this.mapTypeId,
			disableDefaultUI : true
		};
		this.map = new google.maps.Map(document.getElementById(this.mapId), mapOptions);
	}
	/**
	 * Appends a tweet to the content array
	 * @method appendContent
	 */
	this.appendContent = function(content) {
		this.content.push(content);
		return this.content;
	}
	/**
	 * Adds a marker to the map.
	 * @Method addMarker
	 * @param {number} lat Latitude
	 * @param {number} lng Longitude
	 * @param {String} text Text for rollover
	 * @return {Marker} marker New marker
	 */
	this.addMarker = function(lat, lng, text) {
		position = new google.maps.LatLng(lat, lng);
		marker = new google.maps.Marker({
			'position' : position,
			'map' : this.map,
			'flat' : false,
			'title' : typeof (text) != 'undefined' ? text : '<no title>'
		});
		this.markers.push(marker);
		return marker;
	}
	/**
	 * Sets zoom
	 * @param Tweets found and geocoded
	 * @param expansionFunction function used to set latlngbounds
	 */
	this.zoom = function() {
		/**
		 * Zooms to show all markers,
		 * @param markers markers to be shown
		 * @return latlngbounds for Google Maps API
		 */
		this.zoomExtents = function() {
			var bounds = new google.maps.LatLngBounds();

			for ( i = 0; i < this.markers.length; i++) {
				bounds.extend(this.markers[i].position);
			}
			return bounds;
		}
		if (this.markers.length > 0) {
			this.map.fitBounds(this.zoomExtents());
			var map = this.map;
			new google.maps.MaxZoomService().getMaxZoomAtLatLng(this.map.getCenter(), function(MaxZoomResult) {
				//asynchronous callback
				map.setZoom(Math.min(map.getZoom(), Math.min(18, MaxZoomResult.zoom)));
			});
		}
	}//ZOOM
	/**
	 * Adds a marker and sets listener for click on the marker.
	 * @method
	 * @param {number} lat Latitude
	 * @param {number} lng Longitude
	 * @param {String} text Text for rollover
	 */
	this.dropPin = function(lat, lng, text, callback) {
		var context = this;
		var marker = this.addMarker(lat, lng, text);
    var tweet = context.content[context.content.length - 1];
		this.zoom();
		google.maps.event.addListener(marker, 'click', function() {
			if ( typeof (callback) == 'function') {
				callback(tweet, context.map, marker);
			}
		});

	};

	/**
	 * Passes options to the Twitter search API and sends results
	 * to tweetHandler() via tweetGeocoder.geocode()
	 * @this {searchTwitter}
	 * @param {hash} data Associative array of data necessary for Twitter search
	 * @param {function} tweetHandler Function to to handle the geocoded tweet data
	 */
	this.searchTwitter = function() {
		if (this.query == '') {
			alert('Please enter a query.');
			return;
		}
		var tweetHandler = this.tweetHandler;
		var url = 'http://search.twitter.com/search.json?q=' + this.query;
		url += '&rpp=' + this.max_results;
		url += '&include_entites=' + this.include_entites;
		// var url = '/pintweets/data/';
		$.ajax(url, {
			dataType : 'jsonp',
			success : function(data) {
				tweetGeocoder.geocode(data, tweetHandler, function() {
					// failure
				}, function() {
					// finish;
				}, null);
			},
			timeout : 15000,
		});
	}

	this.initialize();
}
