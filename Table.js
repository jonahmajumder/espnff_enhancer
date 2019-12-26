// Table.js
// requires d3.js

class Table {

	constructor (parentid) {
		// get rid of old table
		var parent = d3.select("#" + parentid);
		parent.select("table").remove();

		// make table d3 selctor
		this.table = parent.append("table");

		this.headerrow = this.table.append("thead").append("tr");
		this.tbody = this.table.append("tbody");

		this.colTypes = [];

		this.sortDescending = true;
		this.lastColSorted = undefined;

	}

	add_column(array, name, datatype="number") {
	
		this.headerrow.append("th").datum(name).text(name).on("click", d => this.sort_table(d));
		this.tbody.selectAll("tr").data(array.map(indexFcn)).enter().append("tr"); // add rows if necessary
		this.tbody.selectAll("tr").append("td").data(array).text(itemFcn);		

		this.rows = this.tbody.selectAll("tr");

		this.colTypes.push(datatype);

	}

	col_names() {
		return this.headerrow.selectAll("th").data();
	}

	sort_table(column) {
		var colNum;
		if (typeof(column) == "string") {
			colNum = this.col_names().indexOf(column);
		}
		else if (typeof(column) == "number") {
			colNum = column;
		}
		else {
			colNum = -1;
		}

		if (colNum < 0 || colNum > this.col_names().length - 1) {
			return -1;
		}
		else {
			return this.rearrange_rows(colNum);
		}
	}

	rearrange_rows(colNum) {
		var currentData = this.tbody.selectAll("tr").selectAll("td").select(itemFcn);
		var sortCol = currentData.map(row => row[colNum]); // data to sort by

		if (this.colTypes[colNum] != undefined) {
			switch (this.colTypes[colNum]) {
				case "number":
					sortCol = sortCol.map(d => parseFloat(d));
			}
		}


		this.rows.data(sortCol); // make row "data" the data of the sorting column

		if (colNum == this.lastColSorted && !this.sortDescending) {
			this.rows.sort(d3.ascending);
			this.sortDescending = true;
		}
		else {
			this.rows.sort(d3.descending);
			this.sortDescending = false;
		}

		this.lastColSorted = colNum;

	}
}