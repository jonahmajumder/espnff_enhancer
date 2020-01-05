// Table.js
// requires d3.js

class Table {

	constructor (parentid) {
		// get rid of old table
		this.parent = d3.select("#" + parentid);
		this.parent.select("table").remove();
		this.parent.selectAll(".tooltip").remove()

		// make table d3 selctor
		this.table = this.parent.append("table");

		this.headerrow = this.table.append("thead").append("tr");
		this.tbody = this.table.append("tbody");

		this.colTypes = [];

		this.sortingDefault = false;
		this.lastColSorted = undefined;

	}

	add_column(array, name, argdict) {

		if (argdict === undefined) {
			argdict = {};
		}

		// impose defaults
		var datatype = argdict.hasOwnProperty("datatype") ? argdict["datatype"] : "number";
		var reverseSort = argdict.hasOwnProperty("reverseSort") ? argdict["reverseSort"] : false;
		
		var th = this.headerrow.append("th").datum(name)
			.text(name)
			.on("click", d => this.sort_table(d, reverseSort));

		var threct = th[0][0].getBoundingClientRect();

		console.log(threct);

		// Define the div for the tooltip
		var div = this.parent.append("div")	
			.attr("class", "tooltip")				
			.style("opacity", 0)
			.html(name)
			;

		var drect = div[0][0].getBoundingClientRect();

		var divleft = threct.x;
		var divtop = threct.y;

		div.style("left", (divleft) + "px")		
			.style("top", (divtop) + "px");

		th.on("mouseover", function(d) {
				console.log(this.getBoundingClientRect());
				console.log(div.getBoundingClientRect());
				div.transition()		
					.duration(200)		
					.style("opacity", .9);			
				})					
			.on("mouseout", function(d) {		
				div.transition()		
					.duration(200)		
					.style("opacity", 0);	
			});

		this.tbody.selectAll("tr").data(array.map(indexFcn)).enter().append("tr"); // add rows if necessary
		this.tbody.selectAll("tr").append("td").data(array).text(itemFcn);		

		this.rows = this.tbody.selectAll("tr");

		this.colTypes.push(datatype);

	}

	col_names() {
		return this.headerrow.selectAll("th").data();
	}

	sort_table(column, reverseSort=false) {
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
			return this.rearrange_rows(colNum, reverseSort);
		}
	}

	rearrange_rows(colNum, reverseSort=false) {
		var currentData = this.tbody.selectAll("tr").selectAll("td").select(itemFcn);
		var sortCol = currentData.map(row => row[colNum]); // data to sort by

		if (this.colTypes[colNum] != undefined) {
			switch (this.colTypes[colNum]) {
				case "number":
					sortCol = sortCol.map(d => parseFloat(d));
			}
		}

		this.rows.data(sortCol); // make row "data" the data of the sorting column

		var defaultSort = d3.descending;
		var alternateSort = d3.ascending;

		if (reverseSort) {
			[defaultSort, alternateSort] = [alternateSort, defaultSort];
		}

		if (colNum == this.lastColSorted && this.sortingDefault) {
			this.rows.sort(alternateSort);
			this.sortingDefault = false;
		}
		else {
			this.rows.sort(defaultSort);
			this.sortingDefault = true;
		}

		this.lastColSorted = colNum;

	}
}