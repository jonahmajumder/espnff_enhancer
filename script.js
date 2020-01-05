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

function range(...args) {
	if (args.length == 0) {
		console.error("Range needs at least 1 argument.");
	}
	else if (args.length == 1) {
		return [...Array(args[0]).keys()];
	}
	else if (args.length == 2) {
		return [...Array(args[1] - args[0]).keys()].map(d => d + args[0]);
	}
	else {
		console.error("Range takes at most 2 arguments.");
	}
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