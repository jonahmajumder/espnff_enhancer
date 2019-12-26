// script.js

// useful functions


function itemFcn(d,i) {
	return d;
}

function indexFcn(d,i) {
	return i;
}

function distinct(value, index, array) {
	return array.indexOf(value) === index;
}


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