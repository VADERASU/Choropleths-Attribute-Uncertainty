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
let PL = require("./parllel_line.js");

export class AttrRS {
	constructor(options) {
		this.options = {
			father: d3.select("#AttrInput"),
			rank: 1,
			attrname: ""
		}
		$.each(options, d => this.options[d] = options[d]);

		this.container = this.options.father.append("g").attr("class", "attrinput")
		this.resetleft()

		this.attr = new Attr(this.options.attrname)
		this.attr.setstep(1)
		this.attr.setrange([-1, 1])
		this.init()
	}
	init() {
		let that = this

		let width = 200
		this.width = width

		this.container.append("rect").attr("class", "textrect")
			.attr("width",width).style("pointer-events", "none")
			.attr("height",275)
			.style("fill","rgba(178, 186, 193, 0.18)")
			.attr("x", 0)
			.attr("y", 0)

		let circleheight = 30

		//name
		this.container.append("rect").attr("class", "textrect")
			.attr("width", 200)
			.attr("height", 30)
			.attr("x", 0)
			.attr("y", 0)
			.call(d3.drag().on("start", function() {
				that.container.style("transition-duration", "0s")
				that.container.style("z-index", 1)
				that.relativeP = d3.event.x
			}).on("drag", function() {
				that.setleft(d3.event.sourceEvent.pageX - that.relativeP+$('#MXcontainerdiv').scrollLeft())
				let nowrank = calcRank(d3.event.sourceEvent.pageX+$('#MXcontainerdiv').scrollLeft())
				if (nowrank != that.options.rank) {
					state.data.attrlist.forEach((o, i) => {
						if (o.options.rank == nowrank) {
							o.options.rank = that.options.rank
							o.rerank(o.options.rank)
						}
					})
					that.setrank(calcRank(d3.event.sourceEvent.pageX+$('#MXcontainerdiv').scrollLeft()))

					var Attrmanager = require("../Attr/Attrmanager.js");
						
					let RM = require("../Overviewanalysis/RegionMXManager.js");
						RM.refreshbyorder(Attrmanager.getrangeset())

				}
				PL.renderingline(state.data.kmeans,state.data.vectors)
			}).on("end", function() {
				that.rerank(that.options.rank)
				PL.renderingline(state.data.kmeans,state.data.vectors)
			}))
		this.container.append("text").attr("class", "textinput name")
			.text(this.attr.getname())
			.attr("x", function() {
				return 100 - this.getBoundingClientRect().width / 2
			})
			.attr("y", 21)
			.style("font-size", "14px")


		let data = []
		for (let i = 0; i < state.data.vectors.length; i++) {
			data.push(state.data.vectors[i][state.selectedFeatures.indexOf(this.attr.getname())])
		}
		let min = Math.min(...data)
		let max = Math.max(...data)
		// if(max>200){
		// 	this.attr.setstep(Math.floor(max/100))
		// 	this.attr.setrange([0,0])
		// }

		//add rank
		this.container.append("circle")
			.attr("cx", 20)
			.attr("cy", 15)
			.attr("r", 10)
			.style("fill", "rgb(237,125,49)")
			.style(" transition-duration", "0.6s")
		this.container.append("text")
			.attr("id", "rankcircle")
			.style("font-size", "15px")
			.attr("class", "textinput step")
			.text(this.options.rank)
			.attr("x", function() {
				return 20 - this.getBoundingClientRect().width / 2
			})
			.attr("y", 20)
			.style("font-size", "14px")

		//checkbox
		this.checked = false
		this.container.append("rect").attr("class", "checkbox")
			.attr("x", 180)
			.attr("y", 10)
			.on('click', function() {
				if (!that.checked) {
					that.checked = true
					that.show()
					that.container.append("path").attr("id", "checkicon").attr("d", "M 182 15 l 3 5")
						.style("stroke", "white").style("stroke-width", 2).style("pointer-events", "none")
					that.container.append("path").attr("id", "checkicon").attr("d", "M 185 20 l 4 -8")
						.style("stroke", "white").style("stroke-width", 2).style("pointer-events", "none")
				} else {
					that.checked = false
					that.container.selectAll("#checkicon").remove()
					that.hidden()
				}
			})
		// this.container.append("path").attr("class", "textrect").attr("d", "M90 85 L110 85 L100 95 Z").style("pointer-events", "none")



		let buttonheight = 20
		let steptop = 30 + 5
		//step
		let stepwidth = 90
		this.container.append("rect").attr("class", "textrect")
			.attr("width", 45)
			.style("pointer-events", "none")
			.attr("height", 20)
			.attr("x", 5)
			.attr("y", 35)
		this.container.append("text").attr("class", "textinput")
			.text("Step")
			.attr("x", function() {
				return 5+22.5 - this.getBoundingClientRect().width / 2
			})
			.attr("y", 50)
		this.container.append("rect").attr("class", "textrect")
			.attr("width", 35)
			.style("pointer-events", "none")
			.attr("height", 20)
			.attr("x", 75)
			.attr("y", 35)
		this.container.append("text").attr("class", "textinput").attr("id", "stepvalue")
			.text(this.attr.getstep()+"%")
			.attr("x", function() {
				return 75+17.5 - this.getBoundingClientRect().width / 2
			})
			.attr("y", 50)
		this.container.append("rect").attr("class", "textrectlight")
			.attr("width", 15)
			.attr("height", 20)
			.attr("x", 60)
			.attr("y", steptop)
			.style("cursor", "pointer")
			.on("mousedown", function() {
				setstepvalue(that,that.attr.getstep() - 1)
				that.time = setInterval(function() 
					{
						setstepvalue(that,that.attr.getstep() - 1)
					}, 150);
			}).on("mouseup", function() {
				clearInterval(that.time);
			})
		this.container.append("rect").attr("class", "textrectlight")
			.attr("width", 15)
			.attr("height", 20)
			.attr("x", 110)
			.style("cursor", "pointer")
			.attr("y", steptop)
			.on("mousedown", function() {
				setstepvalue(that,that.attr.getstep() + 1)
				that.time = setInterval(function() 
					{setstepvalue(that,that.attr.getstep() + 1)
					}, 150);
			}).on("mouseup", function() {
				clearInterval(that.time);
			})
		this.container.append("text").attr("class", "textinput step")
			.text("+").attr("x", function() {
				return 110 + 15 / 2 - this.getBoundingClientRect().width / 2
			}).attr("y", 50)
		this.container.append("text").attr("class", "textinput step")
			.text("-").attr("x", function() {
				return 60+15/2 - this.getBoundingClientRect().width / 2
			}).attr("y", 50)

		//range
		this.container.append("rect").attr("class", "textrect")
			.attr("width", 45)
			.style("pointer-events", "none")
			.attr("height", 20)
			.attr("x", 5)
			.attr("y", 60)
		this.container.append("text").attr("class", "textinput")
			.text("Range")
			.attr("x", function() {
				return 5+22.5 - this.getBoundingClientRect().width / 2
			})
			.attr("y", 75)
		this.container.append("rect").attr("class", "textrect")
			.attr("width", 35)
			.style("pointer-events", "none")
			.attr("height", 20)
			.attr("x", 75)
			.attr("y", 60)
		this.container.append("text").attr("class", "textinput").attr("id", "rangevalue0")
			.text(that.attr.getrange()[0] > 0 ? ("+" + that.attr.getrange()[0]+"%") : that.attr.getrange()[0]+"%").attr("y", 75)
			.attr("x", function() {
				return 75+35 / 2 - this.getBoundingClientRect().width / 2
			})
		this.container.append("rect").attr("class", "textrectlight")
			.attr("width", 15)
			.attr("height", 20)
			.attr("x", 110).attr("y", 60)
			.style("cursor", "pointer")
			.on("mousedown", function() {
				setrangemin(that, that.attr.getrange()[0] +that.attr.getstep())
				that.time = setInterval(function() {
					setrangemin(that, that.attr.getrange()[0] + that.attr.getstep())
				}, 150);
			}).on("mouseup", function() {
				clearInterval(that.time);
			})
		this.container.append("text").attr("class", "textinput step")
			.text("+").attr("x", function() {
				return 110+15/2 - this.getBoundingClientRect().width / 2
			}).attr("y", 75)
		this.container.append("rect").attr("class", "textrectlight")
			.attr("width", 15)
			.attr("height", 20)
			.attr("x", 60)
			.attr("y", 60)
			.style("cursor", "pointer")
			.on("mousedown", function() {
				setrangemin(that, that.attr.getrange()[0] - that.attr.getstep())
				that.time = setInterval(
					function() {
						setrangemin(that, that.attr.getrange()[0] - that.attr.getstep())
					}, 150);
			}).on("mouseup", function() {
				clearInterval(that.time);
			})
		this.container.append("text").attr("class", "textinput step")
			.text("-").attr("x", function() {
				return 60 + 15/2 - this.getBoundingClientRect().width / 2
			}).attr("y", 75)
		//+
		this.container.append("rect").attr("class", "textrect")
			.attr("width", 35)
			.style("pointer-events", "none")
			.attr("height", 20)
			.attr("x", 145)
			.attr("y", 60)
		this.container.append("text").attr("class", "textinput").attr("id", "rangevalue1")
			.text(that.attr.getrange()[1] > 0 ? "+" + that.attr.getrange()[1]+"%" : that.attr.getrange()[1]+"%")
			.attr("y", 75)
			.attr("x", function() {
				return 145 + 35 / 2 - this.getBoundingClientRect().width / 2
			})
		this.container.append("rect").attr("class", "textrectlight")
			.attr("width", 15).attr("height", 20).attr("x", 180).attr("y", 60)
			.style("cursor", "pointer")
			.on("mousedown", function() {
				setrangemax(that, that.attr.getrange()[1] + that.attr.getstep())
				that.time = setInterval(
					function() {
						setrangemax(that, that.attr.getrange()[1] + that.attr.getstep())
					}, 100);
			}).on("mouseup", function() {
				clearInterval(that.time);
			})
		this.container.append("text").attr("class", "textinput step")
			.text("+").attr("x", function() {
				return 180 + 15 / 2 - this.getBoundingClientRect().width / 2
			}).attr("y", 75)
		this.container.append("rect").attr("class", "textrectlight")
			.attr("width", 15).attr("height", 20).attr("x", 130).attr("y", 60)
			.style("cursor", "pointer")
			.on("mousedown", function() {
				setrangemax(that, that.attr.getrange()[1] - that.attr.getstep())
				that.time = setInterval(
					function() {
						setrangemax(that, that.attr.getrange()[1] - that.attr.getstep())
					}, 150);
			}).on("mouseup", function() {
				clearInterval(that.time);
			})
		this.container.append("text").attr("class", "textinput step")
			.text("-").attr("x", function() {
				return 130 + 15 / 2 - this.getBoundingClientRect().width / 2
			}).attr("y", 75)


		



		data.sort(function(a, b) {
			return a - b;
		})
		let onefour = data[Math.floor(data.length / 4)]
		let half = data[Math.floor(data.length / 2)]
		let threefour = data[Math.floor(data.length / 4 * 3)]
		// console.log(min, max, onefour, half, threefour)

		this.box = {
			height: 150,
			left: 100,
			top: 100
		}
		this.box.chart = this.container.append("g").style("transform", `translate(${this.box.left}px, ${this.box.top}px)`)
		this.box.chart.append("path").classed("boxline", true)
			.attr("d", `M 0 0 l 0 ${this.box.height}`)

		this.scale = d3.scaleLog()
			.domain([ max<100?max+30:max*1.3,min + 1])
			.range([0,  this.box.height]);

		this.box.chart.append("rect").attr("class", "boxrect")
			.attr("width", 20)
			.attr("height",  that.scale(onefour + 1)-that.scale(threefour + 1))
			.attr("x", -10).style("pointer-events", "none")
			.attr("y", that.scale(threefour + 1))
		this.box.chart.append("path").classed("boxline", true).attr("d", `M -10 ${that.scale(min+1)} l 20 0`)
		this.box.chart.append("path").classed("boxline", true).attr("d", `M -10 ${that.scale(half+1)} l 20 0`)
		this.box.chart.append("path").classed("boxline", true).attr("d", `M -10 ${that.scale(max+1)} l 20 0`)

		that.container.append("rect").attr("id","selectrect")
			.style("fill","rgba(117, 117, 117, 0.32)")
			.style("transform", `translate(${this.box.left}px, ${this.box.top}px)`)
			.style("display","none")


		//max
		that.container.append("g").attr("id","maxlabel")
			.style("transform", `translate(${this.box.left}px, ${this.box.top+this.scale(max) }px)`)
		that.container.select("#maxlabel").append("rect").attr("width", 40)
			.attr("height", 20)
			.attr("x", -60)
			.attr("y", -10)
			.style("fill","rgb(91, 155, 213)")
		that.container.select("#maxlabel").append("text").style("fill","white").style("font-size","12px")
					.text(max.toFixed(1))
					.attr("y",5)
					.attr("x", function(){return  -40-this.getBoundingClientRect().width / 2} )
		that.container.select("#maxlabel").append("path").attr("class", "textrect").attr("d", "M-20 5 L-20 -5 L-11 0 Z")
			.style("pointer-events", "none")
			.style("fill","rgb(91, 155, 213)")
		//min
		that.container.append("g").attr("id","minlabel")
			.style("transform", `translate(${this.box.left}px, ${this.box.top+this.box.height}px)`)
		that.container.select("#minlabel").append("rect").attr("width", 40)
			.attr("height", 20)
			.attr("x", -60)
			.attr("y", -10)
			.style("fill","rgb(91, 155, 213)")
		that.container.select("#minlabel").append("text").style("fill","white").style("font-size","12px")
					.text(min.toFixed(1))
					.attr("y",5 )
					.attr("x", function(){return  -40-this.getBoundingClientRect().width / 2} )
		that.container.select("#minlabel").append("path").attr("class", "textrect").attr("d", "M-20 5 L-20 -5 L-11 0 Z")
			.style("pointer-events", "none")
			.style("fill","rgb(91, 155, 213)")


		that.container.append("g").attr("id","hoverrect")
			.style("transform", `translate(${this.box.left}px, ${this.box.top}px)`)
			.style("display","none")
		that.container.select("#hoverrect").append("rect").attr("width", 40)
			.attr("height", 20)
			.attr("x", -60)
			.attr("y", -10)
			.style("fill","rgb(91, 155, 213)")
		that.container.select("#hoverrect").append("text").style("fill","white").style("font-size","12px").text("0")
					.attr("y",5 )
		that.container.select("#hoverrect").append("path").attr("class", "textrect").attr("d", "M-20 5 L-20 -5 L-11 0 Z")
			.style("pointer-events", "none")
			.style("fill","rgb(91, 155, 213)")

		//interact
		this.container.append("rect").attr("id","interactionrect")
			.style("transform", `translate(${this.box.left}px, ${this.box.top}px)`)
			.attr("width", 30)
			.attr("x", -15)
			.attr("height", this.box.height+10)
			.attr("y", -5)
			.style("fill","transparent")
			.style("cursor","crosshair")
			.call(d3.drag().on("start", function() {
				let thisy = d3.mouse(this)[1]
				thisy = thisy < 0 ? 0 : thisy>that.box.height?that.box.height: thisy
				let text = Math.round( that.scale.invert(thisy) )
				thisy = that.scale(text)
				that.selectP = thisy
				that.container.select("#selectrect")
					.attr("width", 30)
					.style("display","none")
					.attr("x", -15)

			}).on("drag", function() {
				let thisy = d3.mouse(this)[1]
				thisy = thisy < 0 ? 0 : thisy>that.box.height?that.box.height: thisy
				let text = Math.round( that.scale.invert(thisy) )
				thisy = that.scale(text)

				that.container.select("#hoverrect").style("display","block")
					.style("transform", `translate(${that.box.left}px, ${that.box.top+thisy}px)`)
				that.container.select("#hoverrect").select("text")
					.text(text-1)
					.attr("x", function(){return  -40-this.getBoundingClientRect().width / 2} )

				if(thisy < that.selectP){
					that.container.select("#selectrect")
						.style("display","block")
						.attr("y",thisy<0 ? 0  : thisy>that.box.height?that.box.height:thisy)
						.attr("height", thisy > 0? that.selectP -thisy: that.selectP)
				}else{
					that.container.select("#selectrect")
						.style("display","block")
						.attr("y", that.selectP<0 ? 0  : that.selectP>that.box.height?that.box.height: that.selectP)
						.attr("height", thisy < that.box.height? thisy - that.selectP:that.box.height - that.selectP )
				}
				that.set_filter_condition(that.container.select("#selectrect").attr("y"),that.container.select("#selectrect").attr("height"))
				 filter()

			}).on("end", function() {
				that.set_filter_condition(that.container.select("#selectrect").attr("y"),that.container.select("#selectrect").attr("height"))
				 filter()
			}))
			.on("mousemove",function(){
				let thisy = d3.mouse(this)[1]
				thisy = thisy < 0 ? 0 : thisy>that.box.height?that.box.height: thisy
				let text = Math.round( that.scale.invert(thisy) )
				thisy = that.scale(text)

				that.container.select("#hoverrect").style("display","block")
					.style("transform", `translate(${that.box.left}px, ${that.box.top+thisy}px)`)
				that.container.select("#hoverrect").select("text")
					.text(text-1)
					.attr("x", function(){return  -40-this.getBoundingClientRect().width / 2} )
			})
			.on("mouseout",function(){
				that.container.select("#hoverrect").style("display","none")
			})
		this.hidden()
	}
	shownochangeregion(list,step){
		let rect = []
		let thisrect ={min :null,max:null,now:null}
		for(let i =0;i<list.length;i++){
			if(thisrect.min==null){
				thisrect.min = list[i]
				thisrect.max = list[i]
				thisrect.now = list[i]
			}else{
				if(list[i]-thisrect.now==step){
					thisrect.max = list[i]
					thisrect.now = list[i]
				}else{
					rect.push( $.extend(true, {}, thisrect))
					thisrect ={min :null,max:null,now:null}
				}
			}
		}
		if(thisrect.min!=null){
			rect.push( $.extend(true, {}, thisrect))
		}
		let max = Math.max(...list)

		rect.forEach(thisrect=>{
			// console.log(thisrect)
			this.container.append("rect").attr("id","nochangerect")
				.attr("x", this.box.left -20)
				.attr("width", 40)
				.attr("height", this.getpositionofpoint(thisrect.min)[1]-this.getpositionofpoint(thisrect.max)[1])
				.attr("y", this.getpositionofpoint(thisrect.max)[1])
				.style("fill","rgba(123, 123, 123, 0.58)")
				.style("pointer-events","none")
		})

	}
	add_now_value(value){
		this.container.append("g").attr("id","add_now_value")
			.style("transform", `translate(${this.box.left}px, ${this.box.top+this.scale(value) }px)`)
		this.container.select("#add_now_value").append("rect").attr("width", 40)
			.attr("height", 20)
			.attr("x", 20)
			.attr("y", -10)
			.style("fill","rgb(179, 179, 179)")
		this.container.select("#add_now_value").append("text").style("fill","white").style("font-size","12px")
					.text(value.toFixed(1))
					.attr("y",5)
					.attr("x", function(){return  40-this.getBoundingClientRect().width / 2} )
		this.container.select("#add_now_value").append("path").attr("class", "textrect").attr("d", "M20 5 L20 -5 L11 0 Z")
			.style("pointer-events", "none")
			.style("fill","rgb(179, 179, 179)")
	}
	add_original_value(value){
		this.container.append("g").attr("id","add_original_value")
			.style("transform", `translate(${this.box.left}px, ${this.box.top+this.scale(value) }px)`)
		this.container.select("#add_original_value").append("rect").attr("width", 40)
			.attr("height", 20)
			.attr("x", -60)
			.attr("y", -10)
			.style("fill","rgb(91, 155, 213)")
		this.container.select("#add_original_value").append("text").style("fill","white").style("font-size","12px")
					.text(value.toFixed(1))
					.attr("y",5)
					.attr("x", function(){return  -40-this.getBoundingClientRect().width / 2} )
		this.container.select("#add_original_value").append("path").attr("class", "textrect").attr("d", "M-20 5 L-20 -5 L-11 0 Z")
			.style("pointer-events", "none")
			.style("fill","rgb(91, 155, 213)")
	}
	remove_nowandOri_value(){
		d3.selectAll("#add_original_value").remove()
		d3.selectAll("#add_now_value").remove()
	}



	hidenochangeregion(){
		this.container.selectAll("#nochangerect").remove()
	}
	set_filter_condition(y,height){
		this.filtercondition = [Math.round(this.scale.invert(y*1+1*height)-1),Math.round(this.scale.invert(y)-1)] 
	}
	get_filter_condition(y,height){
		return this.filtercondition 
	}
	hidden() {
		this.container.selectAll(".active").classed("active", false)
		this.container.selectAll(".textrectlightactive").classed("textrectlightactive", false)
	}
	show() {
		this.container.selectAll(".checkbox").classed("active", true)
		this.container.selectAll(".textrect").classed("active", true)
		this.container.selectAll(".textrectlight").classed("textrectlightactive", true)
	}
	getrange() {
		return this.attr.getrange()
	}
	getstep() {
		return this.attr.getstep()
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
		this.container.style("transform", `translate(${value}px, 0px)`)
		this.container.attr("left",value)
	}
	resetleft(value) {
		this.container.style("transform", `translate(${(this.options.rank-1)*225+15}px, 0px)`)
		this.container.attr("left",(this.options.rank-1)*225+15)
	}
	getleft() {
		return Number.parseInt(this.container.attr("left"))
	}
	getrank() {
		return this.options.rank
	}
	setrank(value) {
		this.options.rank = value
		this.container.select("#rankcircle").text(value)
	}
	rerank() {
		this.setleft((this.options.rank - 1) * 225 + 15)
		this.container.select("#rankcircle").text(this.options.rank)
		this.container.style("z-index", 0)
	}
	getpositionofpoint(point){
		if (point>this.scale.domain()[0])
			point = this.scale.domain()[0]

		return [this.getleft()+this.width/2, this.box.top +  this.scale(point+1)]
	}
}

let MapManager = require("../Map/MapManager.js");
let SP = require("../ScatterPlot.js");
function filter(){
	let list = []
	state.data.vectors.forEach((vector,i)=>{
		let flag = true
		let ishave = false
		state.data.attrlist.forEach(thisattr => {
			if(thisattr.container.select("#selectrect").style("display") == "block"){
				ishave = true
				if(vector[thisattr.getid()] > thisattr.get_filter_condition()[1] || vector[thisattr.getid()]  < thisattr.get_filter_condition()[0]  ){
					flag = false
				}
			}
		})
		if(flag&&ishave){
			list.push(i)
		}
	})

	 state.ADhighlightlist=list
	for(let i =0;i<state.data.vectors.length;i++){
		if(list.indexOf(i)!=-1){
	        SP.selectCircle(i);
	        MapManager.selectregion(i)
		}else{
	        SP.unSelectCircle(i);
	        MapManager.unhighlightregion(i)
		}
	}

	PL.highlight(list)
}

function calcRank(left) {
	return Math.ceil((left - 15) / 225)
}

function setrangemin(that, value) {
	value <= that.attr.getrange()[1] ? that.attr.setrange([value, that.attr.getrange()[1]]) : null
	that.container.select("#rangevalue0")
		.text(that.attr.getrange()[0] > 0 ? "+" + that.attr.getrange()[0]+"%" : that.attr.getrange()[0]+"%")
		.attr("x", function() {
			return 75+35 / 2  - this.getBoundingClientRect().width / 2
		})
}
function setrangemax(that, value) {
	value >= that.attr.getrange()[0] ? that.attr.setrange([that.attr.getrange()[0], value]) : null
	that.container.select("#rangevalue1")
		.text(that.attr.getrange()[1] > 0 ? "+" + that.attr.getrange()[1]+"%" : that.attr.getrange()[1]+"%")
		.attr("x", function() {
			return  145 + 35 / 2 - this.getBoundingClientRect().width / 2
		})
}
function setstepvalue(that,value){
	value < 1 ? null : that.attr.setstep(value)
	that.container.select("#stepvalue")
		.text(that.attr.getstep()+"%")
		.attr("x", function() {
			return 75+17.5 - this.getBoundingClientRect().width / 2
		})
}