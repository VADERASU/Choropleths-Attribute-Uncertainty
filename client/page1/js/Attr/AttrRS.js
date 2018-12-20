let {
	Attr
} = require("./Attr.js")
var {
	SA
} = require('../chart/ScaleAxis.js');
var {
	LineC
} = require("../LineChart.js");
// var Analysis = require("../Overviewanalysis/Analysis.js");

let state = require("../state.js");

export class AttrRS {
	constructor(options) {
		this.options = {
			father: d3.select("#AttrInput"),
			rank: 1,
			attrname: ""
		}
		$.each(options, d => this.options[d] = options[d]);

		this.container

		this.container = this.options.father.append("div").attr("class", "attrinput")
			.style("left", `${(this.options.rank-1)*270+15}px`)
		this.attr = new Attr(this.options.attrname)
		this.init()
	}
	getrange() {
		return this.attr.getrange()
	}
	init() {
		//checkbox
		let that = this
		this.checked = false
		this.checkinput = this.container.append("div").classed("checkinput", true)
			.on('click', function() {
				if (!that.checked) {
					that.checked = true
					that.show()
				} else {
					that.checked = false
					that.hidden()
				}
			})

		this.container.append("div")
			.attr("class", "label")
			.text(this.attr.getname())
			.call(d3.drag().on("start", function() {
				that.container.style("transition-duration","0s")
				that.container.style("z-index",1)
				that.relativeP = d3.event.x
			}).on("drag", function() {
				that.setleft(d3.event.sourceEvent.pageX - that.relativeP)
				let nowrank=calcRank(d3.event.sourceEvent.pageX )
				if(nowrank!=that.options.rank){
					state.data.attrlist.forEach((o,i)=>{
						if(o.options.rank == nowrank){
							o.options.rank = that.options.rank
							o.rerank(o.options.rank)
						}
					})
					that.options.rank=calcRank(d3.event.sourceEvent.pageX )
					that.ranksvg.select("text").text(that.options.rank)
				}
			}).on("end", function() {
				that.container.style("transition-duration","0.5s")
				that.rerank(that.options.rank)
			}));

		//add distribution
		this.container.append("svg").attr("class", "distribution").style("margin","0 6px")
		this.distri = new LineC(this.container.select(".distribution"), {
			attributename: this.attr.getname()
		})
		this.attr.setrange([-Math.floor((this.distri.getmax() - this.distri.getmin()) / 12 + 0.5),
			Math.floor((this.distri.getmax() - this.distri.getmin()) / 12 + 0.5)
		])

		//range
		this.container.append("div").attr("class", "valueRange").text("Range")
		this.container.append("input").attr("type", "text").attr("class", "textinput min")
			.property("value",-1)
		this.container.append("input").attr("type", "text").attr("class", "textinput max")
			.property("value", 1)
		// this.container.append("input").attr("type", "text").attr("class", "textinput min")
		// 	.property("value", -Math.floor((this.distri.getmax() - this.distri.getmin()) / 12 + 0.5))
		// this.container.append("input").attr("type", "text").attr("class", "textinput max")
		// 	.property("value", Math.floor((this.distri.getmax() - this.distri.getmin()) / 12 + 0.5))

		// //add slider
		// this.container.append("svg")
		// 	.attr("class", "slider")
		// 	.style("height", "40px")
		// this.slider = new SA(this.container.select(".slider"), {
		// 	width: 140,
		// 	height: 15,
		// 	top: 0,
		// 	left: 0,
		// 	moveevent: function() {},
		// 	stopevent: function() {},
		// 	type:"range_selecter"
		// }, [-Math.floor((this.distri.getmax() - this.distri.getmin()) / 12 + 0.5),
		// 	Math.floor((this.distri.getmax() - this.distri.getmin()) / 12 + 0.5)
		// ]);

		//step
		this.container.append("div").attr("class", "StepLabel").text("Step")
		this.container.append("input").attr("type", "text").attr("class", "textinput step").property("value", 1)

		//add rank
		this.ranksvg = this.container.append("svg").attr("class", "ranksvg")
		this.ranksvg.append("circle")
			.attr("cx", "15")
			.attr("cy", "15")
			.attr("r", "15")
			.style("fill", "rgb(237,125,49)")
			.style(" transition-duration", "0.6s")
		this.ranksvg.append("text")
			.attr("x", "10")
			.attr("y", "21")
			.style("fill", "white")
			.style("font-size", "15px")
			.text(this.options.rank)

		this.hidden()
		this.getid()
	}
	hidden() {
		this.checkinput.select(".checkmark").remove()
		this.container.select(".label").style("background", "#b2bac1")
		this.container.select(".valueRange").style("background", "#b2bac1")
		this.container.selectAll(".textinput").style("background", "#b2bac1")
		this.container.selectAll(".StepLabel").style("background", "#b2bac1")
		this.ranksvg.select("circle").style("fill", "#b2bac1")
	}
	show() {
		this.checkinput.append("div").classed("checkmark", true)
		this.container.select(".label").style("background", "#5b9bd5")
		this.container.select(".valueRange").style("background", "#5b9bd5")
		this.container.selectAll(".textinput").style("background", "#5b9bd5")
		this.container.selectAll(".StepLabel").style("background", "#5b9bd5")

		this.ranksvg.select("circle").style("fill", "rgb(237,125,49)")
	}
	getrange() {
		return [this.container.select(".min").property("value") * 1,
			this.container.select(".max").property("value") * 1
		]
	}
	getstep() {
		return this.container.select(".step").property("value") * 1
	}
	getname() {
		return this.attr.getname()
	}
	getid() {
		return state.selectedFeatures.indexOf(this.attr.getname())
	}
	ischeck() {
		return this.checked
	}
	setleft(value) {
		this.container.style("left", function(){
			if (value<15){
				return `${15}px`
			}
			 return `${value}px`
		})
	}
	getleft() {
		return parseInt(this.container.style("left"))
	}
	getrank() {
		return this.options.rank
	}
	setrank(value) {
		this.options.rank = value
	}
	rerank(){
		this.setleft((this.options.rank-1)*270+15)
		this.ranksvg.select("text").text(this.options.rank)
		this.container.style("z-index",0)
	}
}
function calcRank(left){
	return Math.ceil( (left-15)/270 )
}
