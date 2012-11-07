/*
 * Total number of searches performed.  Global.
 */
var TOTAL_SEARCHES = 0;

$(document).ready(function() {
	/*
	 * Attach searchTwitter() function to the 'submit' search button.
	 * Pulls necessary data for search from elements in the #testControsl div.
	 */
	$('#submit').click(function() {
		query = $('#search').val();
		max_results = $('#max_results').val();
		entities = $('#include_entities').attr('checked') ? true : false;
		data = {
			'query' : query,
			'max_results' : max_results,
			'include_entities' : entities
		};
		/*
		 * Loop the function
		 */
		if ($('#set_interval').attr('checked')) {
			setInterval(function() {
				searchTwitter(data, buildResultList);
			}, 5000);
		} else {
			searchTwitter(data, buildResultList);
		}
	});
	/*
	 * Button to clear the display of results.
	 */
	$('#clear_results').click(function() {
		prettyClear($('#resultHolder'));
	});
});

function searchTwitter(data, tweetHandler) {
	/*
	 * Passes options to the Twitter search API and sends results
	 * to tweetHandler() via tweetGeocoder.geocode()
	 *
	 * @method searchTwitter
	 * @param {Object} data Associate array of data necessary for Twitter search
	 * @param {Function} tweetHandler Function to to handle the geocoded tweet data
	 */
	if (data['query'] == '') {
		alert('Please enter a query.');
		return;
	}
	TOTAL_SEARCHES++;
	var url = 'http://search.twitter.com/search.json?q=' + data['query'];
	url += '&rpp=' + data['max_results'];
	url += '&include_entites=' + data['include_entities'] ? data['include_entities'] : false;
	$.ajax(url, {
		dataType : 'jsonp',
		success : function(data) {
			tweetGeocoder.geocode(data, tweetHandler, function(result, googleObj) {
			}, function(didWork) {
				if (didWork) {
					console.log('Did work: ' + didWork);
				} else {
					console.log('Did work: FAILED');
				}
			}, null);
		},
		failure : function() {
			console.log('Failure.');
		},
		timeout : 15000,
	});
}

function prettyClear(jqObj) {
	/*
	 * Fades out an element gracefully.
	 *
	 * @method prettyClear
	 * @param {String} jqObj jQuery object to clear
	 */
	jqObj.fadeOut(400, function() {
		$(this).html('');
		$(this).show();
	});
}

function prettyAppend(jqObjSrc, jqObjTarget) {
	/*
	 * Appends an element inside of another element gracefully.
	 *
	 * @method prettyAppend
	 * @param {Object} jqObjSrc jQuery source object
	 * @param {Object} jqObjTarget jQuery target object
	 */
	jqObjSrc.hide();
	jqObjTarget.append(jqObjSrc);
	jqObjSrc.fadeIn(800);
}

function buildResultList(tweet, geo) {
	/*
	 * Builds the list of results.
	 *
	 * @method buildResultList
	 * @param {Object} tweet Tweet object.
	 * @param {Object} geo Geocode object.
	 */
	function packageObj(str, obj) {
		/*
		 * Packages an object as JSON into a div, along with a header div.
		 *
		 * @method packageObj
		 * @param {String} str String to use for the heady of the JSON output
		 * @param {Object} obj Object to stringify and represent as JSON data
		 */
		var p = $('<div />').attr('class', 'row');
		p.append($('<div />').html(str).attr('class', 'header'));
		p.append($('<div />').html(JSON.stringify(obj)).attr('class', 'json'));
		return p
	}

	/*
	 * Holder for the result.
	 */
	resultHolder = $('#resultHolder');
	result = $('<div />').attr('class', 'result');
	/*
	 * Numerical ID of the most recent result.  Equal to the total number of results fetched + 1.
	 * Displayed as <total searches>.<nth result>
	 */
	resultId = $('<div />').attr('class', 'resultId');
	resultId.html(TOTAL_SEARCHES + '.' + (resultHolder.children().length + 1));
	/*
	 * Build the result from geo, tweet, and resultId.
	 */
	result.append(resultId);
	result.append(packageObj('Geo:', geo));
	result.append(packageObj('Tweet:', tweet));
	/*
	 * Place the result in the resultHolder.
	 */
	prettyAppend(result, resultHolder);
}