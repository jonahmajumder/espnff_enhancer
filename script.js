// script.js

// globals
var l, tab, jsondata;
var date = new Date();

function loadfcn() {
	document.getElementById("leagueinput").onchange = getLeague;
}

function getLeague() {
	var lID = document.getElementById("leagueinput").value;

	if (lID.length > 0) {
		l = new League(lID);

		d3.select("table").remove();

		l.verify_league(function(s) {
			document.getElementById("leaguename").innerHTML = s;
		});


	}
}