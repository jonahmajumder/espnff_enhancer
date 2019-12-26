class League {
	constructor (league) {
		this.offline = false;
		this.baseurl = this.make_url(league);

		// this.get_ownerdict();
		this.get_teams();
	}

	make_url(league, year=date.getFullYear()) {
		if (parseInt(year) >= 2019) {
			var part1 = "https://fantasy.espn.com/apis/v3/games/FFL/seasons/"
			var part2 = "/segments/0/leagues/";
			return part1 + year + part2 + league;
		}
		else {
			var part1 = "https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/";
			var part2 = "?seasonId=";
			return part1 + league + part2 + year;
		}
	}

	url_with_params(params) {
		if (!this.offline) {
			var paramnames = Object.keys(params);
			var paramstr = paramnames.map(p => p + "=" + params[p]).join("&");
			return this.baseurl + "?" + paramstr;
		}
		else {
			var localurl = "http://127.0.0.1:8000";
			var view = params["view"];

			return localurl + '/' + view;
		}
	}

	verify_league(handler) {
		this.get_data("mSettings", {})
			.then(function(j) {
				var settings = j["settings"];
				var name = settings["name"];
				var nteams = settings["size"];
				var isPublic = settings["isPublic"];
				var pubstr = isPublic ? "Public" : "Private";

				handler(name + " (" + pubstr + " League, " + nteams + " teams)");
			})
			.catch(function () {
				handler("Unable to access league.")
			});
	}

	// get_ownerdict() {
	// 	this.get_data("mTeam", {}).
	// 		then(this.parse_ownerdict.bind(this));
	// }

	parse_ownerdict(j) {
		// console.log(j);
		var swids = j.members.map(d => d.id);
		var fullNames = j.members.map(d => [d.firstName, d.lastName].join(" "));

		var idDict = {};
		swids.forEach((d,i) => idDict[d] = fullNames[i]);


		this.ownerdict = idDict;
	}

	get_schedule() {
		this.get_data("mMatchupScore", {}).
			then(this.parse_schedule.bind(this));
	}

	parse_schedule(j) {
		jsondata = j;
		// record some 'status' properties
		this.firstScoringPeriod = j.status.firstScoringPeriod;
		this.finalScoringPeriod = j.status.finalScoringPeriod;


		var allgames = j.schedule;
		for (var i = 0; i < allgames.length; i++) {
			// console.log(allgames[i]);
			new Matchup(allgames[i]);
		}
		this.matchups = allgames.map(g => new Matchup(g));
		this.teams.forEach(t => t.get_full_record(this.matchups));
		// var weekIds = allgames.map(g => g.matchupPeriodId)
		// 	.filter((elem, idx, array) => array.indexOf(elem) === idx);
		// var byWeek = weekIds.map(id => allgames.filter(g => g.matchupPeriodId === id));
		// console.log(byWeek);

		this.make_week_buttons("weekbuttoncontainer");



		this.make_team_table("tcontainer");
	}

	get_teams() {
		this.get_data("mTeam", {})
			.then( function (j) {
				this.parse_ownerdict(j);
				this.teams = j.teams.map(t => new Team(t, this.ownerdict));
				this.get_schedule();
			}.bind(this));
	}

	set_team_records(includedWeeks) {
		this.teams.forEach(t => t.set_record(includedWeeks));
	}

	make_week_buttons(parent) {
		var allWeeks = this.matchups.map(m => m.week).filter(distinct);

		var divs = d3.select("#" + parent)
			.selectAll("div")
			.data(allWeeks).enter()
			.append("div")
			.attr("class", "weekcontainer");

		divs.append("input")
			.attr("type", "checkbox")
			.attr("class", "invisible weekinput")
			.attr("id", (_,i) => "week" + (i+1))
			.property("checked", true)
			.on("change", function () {
				// change the team record dict to reflect weeks selected
				this.set_team_records(this.weeks_checked());
				this.make_team_table("tcontainer");
			}.bind(this));

		var labels = divs.append("label")
			.attr("class", "weeklabel")
			.attr("for", (_,i) => "week" + (i+1));

		labels.append("span")
			.attr("class", "weekbutton")
			.text((_,i) => allWeeks[i]);

	}

	weeks_checked() {
		var isChecked = d3.selectAll(".weekinput")[0].map(e => e.checked);
		var weekNums = d3.selectAll(".weekbutton")[0].map(s => parseFloat(s.innerText));
		return weekNums.filter((_,i) => isChecked[i]);
	}

	make_team_table(parent) {

		tab = new Table(parent);

		tab.add_column(this.teams.map(t => t.id), "ID");
		tab.add_column(this.teams.map(t => t.owner), "Owner", "string");
		tab.add_column(this.teams.map(t => t.record.wins.length), "Wins");
		tab.add_column(this.teams.map(t => t.record.losses.length), "Losses");

		tab.add_column(this.teams.map(t => t.record.totalPtStr), "Total Pts");
		tab.add_column(this.teams.map(t => t.record.averagePoints), "Average Pts");
		tab.add_column(this.teams.map(t => t.record.stdevPoints), "Stdev Pts");

		tab.add_column(this.teams.map(t => t.finalRanking), "Final Place");
		tab.add_column(this.teams.map(t => t.regSeasonRanking), "Regular Season Place");

		tab.add_column(this.teams.map(t => t.record.acquisitions), "Acquisitions");

	}

	get_data(view, header) {
		var params  = {
			"view": view
		};

		var purl = this.url_with_params(params);
		// console.log(purl);

		return new Promise(function (resolve, reject) {
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4) {
					if (this.status == 200) {
						resolve(JSON.parse(this.responseText));
					}
					else {
						reject(JSON.parse(this.responseText), this.status);
					}
				}
			}
			xhttp.withCredentials = true; // use browser cookies
			xhttp.open("GET", purl);
			xhttp.send();
		});
	}

}




