class League {
	constructor (league) {
		this.offline = false;
		this.baseurl = this.make_url(league);

		// this.get_ownerdict();
		this.get_teams();
	}

	make_url(league, year=2019) {
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
			var view = params.view;

			return localurl + '/' + view;
		}
	}

	verify_league(handler) {
		this.get_data("mSettings", {})
			.then(function(j) {
				var settings = j.settings;

				var name = settings.name;
				var nteams = settings.size;
				var isPublic = settings.isPublic;
				var pubstr = isPublic ? "Public" : "Private";

				var sched = settings.scheduleSettings;
				this.regSeasonLength = sched.matchupPeriodCount;
				this.postSeasonLength = Math.ceil(Math.log2(sched.playoffTeamCount));
				this.totalWeeks = this.regSeasonLength + this.postSeasonLength;
				// console.log(this.totalWeeks);

				handler(name + " (" + pubstr + " League, " + nteams + " teams)");
			}.bind(this))
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
		// console.log(this.matchups);
		this.teams.forEach(t => t.get_full_record(this.matchups));
		// var weekIds = allgames.map(g => g.matchupPeriodId)
		// 	.filter((elem, idx, array) => array.indexOf(elem) === idx);
		// var byWeek = weekIds.map(id => allgames.filter(g => g.matchupPeriodId === id));
		// console.log(byWeek);

		this.make_week_buttons("weekbuttoncontainer");
		this.make_week_presets("weekpresetcontainer");
		this.make_team_table("tcontainer");
	}

	get_teams() {
		this.get_data("mTeam", {})
			.then( function (j) {
				console.log(j);
				this.parse_ownerdict(j);
				this.teams = j.teams.map(t => new Team(t, this.ownerdict));
				this.get_schedule();
			}.bind(this));
	}

	set_team_records(includedWeeks) {
		this.teams.forEach(t => t.set_record(includedWeeks));

		// console.log(this.teams.map(t => t.record));
	}

	make_week_buttons(parent) {
		var allWeeks = this.matchups.map(m => m.week).filter(distinct);

		d3.select("#" + parent).selectAll("div").remove();

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
				// console.log(this.teams);
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

	make_week_presets(parent) {
		var presets = {};

		presets["All"] = range(1, this.totalWeeks + 1);
		presets["None"] = [];
		presets["1st Half"] = range(1, Math.round(this.totalWeeks/2) + 1);
		presets["2nd Half"] = range(Math.round(this.totalWeeks/2) + 1, this.totalWeeks + 1);
		presets["Regular Season"] = range(1, this.regSeasonLength + 1);
		presets["Playoffs"] = range(this.regSeasonLength + 1, this.totalWeeks + 1);
		
		// console.log(presets);

		d3.select("#" + parent).selectAll("div").remove();

		var divs = d3.select("#" + parent)
			.selectAll("div")
			.data([...Object.keys(presets)]).enter()
			.append("div");

		divs.append("input")
			.attr("id", (_,i) => "preset" + i)
			.attr("type", "button")
			.attr("class", "column presetbutton")
			.attr("name", itemFcn)
			.attr("value", itemFcn)
			.on("click", function (d) {
				var bools = presets["All"].map(w => presets[d].includes(w));
				d3.selectAll(".weekinput").property("checked", (_,i) => bools[i]);
				d3.select(".weekinput").on("change")(); // call change function of a week button
			});

	}

	weeks_checked() {
		var isChecked = d3.selectAll(".weekinput")[0].map(e => e.checked);
		var weekNums = d3.selectAll(".weekbutton")[0].map(s => parseFloat(s.innerText));
		return weekNums.filter((_,i) => isChecked[i]);
	}

	make_team_table(parent) {

		tab = new Table(parent);

		tab.add_column(this.teams.map(t => t.id), "ID", {"reverseSort": true});
		tab.add_column(this.teams.map(t => t.owner), "Owner", {"datatype": "string"});
		tab.add_column(this.teams.map(t => t.record.wins.length), "Wins");
		tab.add_column(this.teams.map(t => t.record.losses.length), "Losses");

		tab.add_column(this.teams.map(t => t.record.totalPtStr), "Total Pts");
		tab.add_column(this.teams.map(t => t.record.averagePoints), "Average Pts");
		tab.add_column(this.teams.map(t => t.record.stdevPoints), "Stdev Pts");

		tab.add_column(this.teams.map(t => t.finalRanking), "Final Place", {"reverseSort": true});
		tab.add_column(this.teams.map(t => t.regSeasonRanking), "Regular Season Place", {"reverseSort": true});

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




