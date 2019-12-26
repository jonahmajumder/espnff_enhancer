// Team.js

class Team {
	constructor (teamjson, ownerdict) {
		this.owner = ownerdict[teamjson.primaryOwner];
		this.id = teamjson.id;
		this.name = [teamjson.location, teamjson.nickname].join(" ");

		this.ptFormatter = d3.format(".2f");

		this.full_record = {};

		this.full_record.acquisitions = teamjson.transactionCounter.acquisitions;
		this.full_record.acquisitionsByWeek = teamjson.transactionCounter.matchupAcquisitionTotals;
		// console.log(this.acquisitionsByWeek);

		this.finalRanking = teamjson.rankCalculatedFinal;
		this.regSeasonRanking = teamjson.playoffSeed;

		// console.log(teamjson);
		// console.log(this.owner);
		// console.log(teamjson.record.overall);
	}

	get_full_record(matchups) {
		// console.log("Getting record for team " + this.name + ".");
		var involved = matchups.filter(m => m.teamIds.includes(this.id));

		this.full_record.involved = involved;
		this.full_record.wins = involved.filter(m => m.won(this.id));
		this.full_record.losses = involved.filter(m => m.lost(this.id));
		this.full_record.pointsByWeek = involved.map(m => m.points(this.id));

		this.full_record.totalPtStr = this.ptFormatter(d3.sum(this.full_record.pointsByWeek));
		this.full_record.averagePoints = this.ptFormatter(d3.mean(this.full_record.pointsByWeek));
		this.full_record.stdevPoints = this.ptFormatter(d3.deviation(this.full_record.pointsByWeek));
		// console.log(this.wins.length + " wins, " + this.losses.length + " losses");

		this.record = this.full_record;
	}

	set_record(includedWeeks) {
		// this function sets the Team's "record" property so that it reflects just the specified weeks
		
		if (includedWeeks == "all") {
			this.record = this.full_record;
			return;
		}


	}

}