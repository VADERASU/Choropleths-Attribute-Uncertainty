var {SA} = require('../chart/ScaleAxis.js');
var state = require("../state.js");
var Analysis = require("../Overviewanalysis/Analysis.js");
var { LineC } = require("../LineChart.js");

const OO = {
	SetAttrInput: function() {
		let thisattrinput = d3.select("#AttrInput").selectAll(".attrinput")
			.data(state.selectedFeatures)

		thisattrinput.exit().remove()
		let addattrinput = thisattrinput.enter()
			.append("div").attr("class", "custom-control custom-checkbox attrinput")

		addattrinput.append("input").attr("type", "checkbox").attr("class", "custom-control-input")
		addattrinput.append("label").attr("class", "custom-control-label")
		addattrinput.append("div").attr("class", "valueRange").text("")
		addattrinput.append("svg").attr("class", "distribution").style("display", "none")
		addattrinput.append("svg").attr("class", "slider").style("height", "40px").style("display", "none")


		let updateattrinput = addattrinput.merge(thisattrinput)

		updateattrinput.select("input").on('input change', function(d) {
			if (d3.select(this).property("checked")) {
				//add distribution
				if (!d3.select(this.parentNode).property("distributionOb")) {
					let a = new LineC(d3.select(this.parentNode).select(".distribution"), {
						attributename: d
					})
					d3.select(this.parentNode).property("distributionOb", a)
				}
				d3.select(this.parentNode).property("distributionOb").show()
				//add slider
				if (!d3.select(this.parentNode).property("sliderOb")) {

					let min = d3.select(this.parentNode).property("distributionOb").getmin()
					let max = d3.select(this.parentNode).property("distributionOb").getmax()
					let a = new SA(d3.select(this.parentNode).select(".slider"), {
						width: 260,
						height: 20,
						top: 0,
						left: 20,
						moveevent: function() {},
						stopevent: function() {}
					}, [-Math.floor((max - min) / 12 + 0.5),
						Math.floor((max - min) / 12 + 0.5)
					]);
					d3.select(this.parentNode).property("sliderOb", a)
				}
				d3.select(this.parentNode).select(".slider").style("display", "block")
			} else {
				//delete
				d3.select(this.parentNode).property("distributionOb").hide()
				d3.select(this.parentNode).select(".slider").style("display", "none")
			}
		})
		updateattrinput.select("label").text(d => d).style("margin-left", "7px")
			.style("margin-bottom", "0px")
	},
	GetRange() {
		let result =[]
		d3.select("#AttrInput").selectAll(".attrinput").each( function(d, i){
			if(d3.select(this).select("input").property("checked")){
				result.push({name:d, id:i, range:d3.select(this).property("sliderOb").getTime()})
			}
		})
		return result
	}

}
module.exports = OO


	// GetAttrInput: function() {
	// 	return $('#AttrInput').val()
	// },
	// GetMin() {
	// 	return state.errorinput.getTime()[0].toFixed(1) * 1
	// },
	// GetMax() {
	// 	return state.errorinput.getTime()[1].toFixed(1) * 1
	// },
	// GetRange() {
	// 	return state.errorinput.getTime()
	// },
	// SetErroSlider: function() {
	// 	let distribution = LineC.datadistribution(OO.GetAttrInput())

	// 	state.errorinput == undefined ? null : state.errorinput.delete()
	// 	let scrollwidth = parseFloat(d3.select("#errorlist").style("width")) - 350 - 100
	// 	scrollwidth = Math.floor(scrollwidth / 25 + 1) * 25
	// 	state.errorinput = new SA(
	// 		d3.select("#errorline"), {
	// 			width: scrollwidth,
	// 			height: 20,
	// 			top: 0,
	// 			left: 362.5,
	// 			moveevent: function() {
	// 				d3.selectAll(".clusterchart").attr("transform", `translate(${350+state.errorinput.getminposition()} 0)`)
	// 			},
	// 			stopevent: function() {
	// 				d3.selectAll(".clusterchart").attr("transform", `translate(${350+state.errorinput.getminposition()} 0)`)
	// 				$("#errordefine").val("error: " + OO.GetMin() + " - " + OO.GetMax());
	// 				Analysis.RunErrorAnalysis({
	// 					min: OO.GetMin(),
	// 					max: OO.GetMax()
	// 				}, OO.GetAttrInput())
	// 			}
	// 		}, [-Math.floor(scrollwidth / 25 / 2) - 1,
	// 			Math.floor(scrollwidth / 25 / 2)
	// 		]);

	// 	$("#errordefine").val(`error: ${OO.GetMin()} ~ ${OO.GetMax()}`);
	// 	Analysis.RunErrorAnalysis({
	// 		min: OO.GetMin(),
	// 		max: OO.GetMax()
	// 	}, OO.GetAttrInput())
	// },