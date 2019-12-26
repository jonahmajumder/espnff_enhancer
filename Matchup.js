// Matchup.js

class Matchup {
	constructor(game) {
		// console.log(game);
		var notBye = ["home", "away"].every(d => Object.keys(game).includes(d));
		this.bye = !notBye;

		this.week = game.matchupPeriodId;
		this.playoffs = game.playoffTierType.toLowerCase() != "none";

		this.homeId = game.home.teamId;
		this.homePoints = game.home.totalPoints;

		if (notBye) {
			this.awayId = game.away.teamId;
			this.teamIds = [this.homeId, this.awayId];

			this.awayPoints = game.away.totalPoints;

			var winner = game.winner.toLowerCase();
			var widx = ["home", "away"].indexOf(winner);

			if (widx >= 0) { // matchup is undecided (still in progress)
				var wname = ["home", "away"][widx];
				var lname = ["home", "away"][1 - widx];

				this.winnerId = game[wname].teamId;
				this.loserId = game[lname].teamId;
			}
			else {
				this.winnerId = undefined;
				this.loserId = undefined;
			}
		}
		else {
			this.awayId = undefined;
			this.awayPoints = undefined;
			this.winnerId = undefined;
			this.loserId = undefined;
			this.teamIds = [this.homeId];
		}
	}

	won(teamId) {
		return teamId == this.winnerId;
	}

	lost(teamId) {
		return teamId == this.loserId;
	}

	points(teamId) {
		switch (teamId) {
			case this.homeId:
				return this.homePoints;
			case this.awayId:
				return this.awayPoints;
			default:
				return undefined;
		}

	}
}



