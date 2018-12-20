var state = require("./state.js");
var MapManager = require("./Map/MapManager.js");

const SP = {
	highlightCircle: function(id) {
		d3.select('#scat-svg').selectAll(".dot")
			.classed("dothighlight", false)

		d3.select('#scat-svg').select(`#point${id}`)
			.classed("dothighlight", true)
	},
	unhighlightCircle: function(id) {
		d3.select('#scat-svg').select(`#point${id}`)
			.classed("dothighlight", false)
	},
	selectCircle: function(id) {
		d3.select('#scat-svg').select(`#point${id}`)
			.classed("dotselect", true)
    		.style("stroke","rgb(56, 56, 56)")
	},
	unSelectCircle: function(id) {
		d3.select('#scat-svg').select(`#point${id}`)
			.classed("dotselect", false)
			.style("stroke", function(d, i) {
				return state.color(cOValue(id));
			})
	}
}

rerendering = function() {
	state.ADhighlightlist.forEach(o => {
		d3.select('#scat-svg').select(`#point${o}`).classed("dotselect", true)
	})
}

SP.ScatterPlot = function(data, kmeans, reflect) {
	var margin = {
			top: 20,
			right: 20,
			bottom: 20,
			left: 30
		},
		padding = {
			top: 20,
			right: 20,
			bottom: 10,
			left: 10
		},
		width = $('#scat').width(),
		height = $('#scat').height() - margin.top - margin.bottom - padding.top - padding.bottom;

	// setup x 
	var xValue = function(d) {
			return d[0];
		}, // data -> value
		xScale = d3.scaleLinear().range([0, width]),
		xMap = function(d) {
			return xScale(xValue(d));
		} // data -> display
	// xAxis = ;

	// setup y
	var yValue = function(d) {
			return d[1];
		}, // data -> value
		yScale = d3.scaleLinear().range([height, 0]),
		yMap = function(d) {
			return yScale(yValue(d));
		} // data -> display
	// yAxis = d3.axisBottom(yScale);

	// setup fill color
	var cValue = function(id) {
		for (let i = 0; i < kmeans.length; i++) {
			if (kmeans[i].indexOf(id) != -1) {
				if (reflect == undefined)
					return i;
				else
					return reflect.indexOf(i);
			}
		}
	};

	// add the graph canvas to the body of the webpage
	var svg = d3.select('#scat').select("#scat-svg").attr("width", width)
		.attr("height", height + padding.top + padding.bottom)

	// don't want dots overlapping axis, so add in buffer to data domain
	xScale.domain([d3.min(data, xValue) * 1.05, d3.max(data, xValue) * 1.05]);
	yScale.domain([d3.min(data, yValue) * 1.05, d3.max(data, yValue) * 1.05]);


	let allpath = svg.selectAll("path").data(function() {
		let thisdata = []
		for (var i = 0; i < kmeans.length; i++) {
			let filteredData = new Array(kmeans[i].length);
			for (var j = 0; j < filteredData.length; j++) {
				let index = kmeans[i][j];
				filteredData[j] = [xMap(data[index]), yMap(data[index])];
			}

			thisdata.push({
				label: reflect == undefined ? label = i : reflect.indexOf(i),
				id: i,
				filteredData: filteredData
			})
		}
		return thisdata
	})
	allpath.exit().remove();

	let addpath = allpath.enter().append("path").classed("hull",true)
		.attr("transform", "translate(0," + margin.top + ")")

	let mergepath = allpath.merge(addpath)
		.attr("fill", d => state.color(d.label))
		.attr("stroke", d => state.color(d.label))
		.attr("id", d => `k${d.i}`)
		.attr("d", d=> {
			if(d.filteredData.length <= 2)
				return null
			let pathdata = d3.polygonHull(d.filteredData)
			if (pathdata.length === 0) return "";
			return "M" + pathdata.join("L") + "Z";
		});

	// draw dots
	let alldots = svg.selectAll(".dot").data(data)
	alldots.exit().remove()

	let adddots = alldots.enter().append("circle")
		.classed("dot",true)
		.attr("transform", "translate(0," + margin.top + ")")

	let mergedots = adddots.merge(alldots)

	mergedots.attr("cx", xMap)
		.attr("cy", yMap)
		.classed("dotiscenter",function(d,i){
			return cOValue(i)==undefined ? true :false
		})
		.attr("id", function(d, i) {
			return "point" + i;
		})
		.style("fill", function(d, i) {
			return state.color(cOValue(i));
		})
		.style("stroke", function(d, i) {
			return state.color(cValue(i));
		})
		.classed("dotchanged", function(d, i) {
			return cOValue(i) == cValue(i) ? false: true
		})
		.on("mouseover", function(d, i) {
			cOValue(i)==undefined ? null:MapManager.highlightregion(i)
		})
		.on("mouseout", function(d, i) {
			cOValue(i)==undefined ? null:MapManager.unhighlightregion(i)
		})
	rerendering();

	let changelist = []
	for (let i = 0 ;i<data.length;i++){
		if(cOValue(i) != cValue(i) ) {
			changelist.push(i)
		}
	}
	console.log(changelist)

	let alloridots = svg.selectAll(".origindot").data(function(){
		for (let i =0;i<changelist.length;i++){
			let thisid = changelist[i]*1
			changelist[i]=state.tsnemachine.Two[thisid]
			changelist[i][2] = thisid
		}
		return changelist
	})
	alloridots.exit().remove()

	let addoridots = alloridots.enter().append("circle")
		.classed("origindot",true)
		.attr("transform", "translate(0," + margin.top + ")")

	let mergeoridots = addoridots.merge(alloridots)
		.attr("cx", xMap)
		.attr("cy", yMap)
		.classed("dotiscenter",false)
		.attr("id", function(d, i) {
			return "oripoint" + i;
		})
		// .style("fill", function(d, i) {
		// 	return state.color(cOValue(i));
		// })
		.style("stroke", function(d, i) {
			return state.color(cOValue(d[2]));
		})
		.style("r","5px")
		.style("stroke-width","3px")
		.style("fill","none")
		.style("stroke-dasharray","1.5px")

	// //draw trajectories
	// if(reflect!=undefined){
	// 	for(var i = 0; i < data.length; i++){
	// 		let x1 = xMap(state.tsnemachine.Two[i])
	// 			x2 = xMap(data[i])
	// 			y1 = yMap(state.tsnemachine.Two[i])
	// 			y2 = yMap(data[i])
	// 		let dist= Math.sqrt((x2-x1)*(x2-x1)+ (y2 -y1)*(y2 -y1))
	// 		svg.append("polygon")
	// 			.attr("points",`${x1},${y1} ${x2+((-y2+y1)/dist*2)},${y2+((-x2+x1)/dist*2)} ${x2-((-y2+y1)/dist*2)},${y2-((-y2+y1)/dist*2)}`)
	// 			.attr("style","fill:lime;stroke:purple;stroke-width:1")
	// 	}
	// }

}
	var cOValue = function(id) {
		for (let i = 0; i < state.data.kmeans.length; i++) {
			if (state.data.kmeans[i].indexOf(id) != -1) {
				return i;
			}
		}
	};
module.exports = SP