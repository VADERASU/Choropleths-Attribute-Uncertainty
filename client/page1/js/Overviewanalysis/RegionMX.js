var state = require("../state.js");
var MapManager = require("../Map/MapManager.js");
var SP = require("../ScatterPlot.js");
var TDSP = require("../chart/3dScatterPlot.js");
let PL = require("../Attr/parllel_line.js");
var CVSP = require("../chart/CV_ScatterPlot.js");
export class RegionMX {
	constructor(container, options, range) {
		this.options = {
			width: 10,
			id: 0,
			height: 10,
			top: 0,
			left: 0,
			changeval: 0,
			visualval: 0,
			data: null,
			rectwidth: 20,
			changemax: 0,
			visualmin: 0,
			visualmax: 0
		}
		$.each(options, d => this.options[d] = options[d]);
		this.container = container
		this.range = range
		let that = this
		this.div = this.container.append("div").classed("MX", true)
			.style("position", "absolute")
			.style("zoom",1)
			.style("left",0+"px")
			.style("top",0+"px")
			// .style("transition-duration","0.2s")
			.property("left", 0 )
			.property("top",0)
			.on("mouseover",function(d){
				SP.highlightCircle(that.options.id)
				state.event.isonMatrix = true
				that.hightlight()
           		CVSP.highlightregion(that.options.id)
			})
			.on("mouseout",function(){
				CVSP.refreshregion()
				SP.unhighlightCircle(that.options.id)
				state.event.isonMatrix = false
				that.unhightlight()
				// //tsne
				// let TsneM = require("../Tsne/TsneManager.js");
				// TsneM.get_to_original_tsne()
			})


		this.div.append("label").text(`Region ${this.options.data.id}`)
			.on("mouseover",function(){
				MapManager.highlightregion(that.options.data.id)
			})
			.on("mouseout",function(){
				MapManager.unhighlightregion(that.options.data.id)
			})
			.on("click",function(d){
	          if(CVSP.hightregionlist.has(that.options.data.id)){
	            CVSP.hightregionlist.delete(that.options.data.id)
	            d3.select(this).classed("highlightfixed",false)
	          }else{
	            CVSP.hightregionlist.set(that.options.id,that.options.data.id)
	            d3.select(this).classed("highlightfixed",true)
	          }
          		CVSP.refreshregion()
        	})
		this.svg = this.div.append("svg").style("width", "100px").style("display", "block")
			.style("margin", "5px")
			// .style("transition-duration","0.5s")
		this.root = this.svg.append("g").classed("Matrix", true)
			.on("click", function(d) {
				if (!d3.select(this).property("open") && !state.event.unfold) {
					// console.log("aaaaa")
					that.root.selectAll("rect").remove()
					that.init()
					let RM = require("./RegionMXManager.js");
					RM.reposition()
				}
				state.event.unfold=false
			})

		this.root.property("fixed", [])
			.property("open", false)
			.property("regionid", this.options.id)
			.property("level", 0)
			.property("x", 0)
			.property("y", 0)
			.property("width", 20)
			.property("height", 20)
		this.init()
	}
	hightlight(){
		this.div.select("label").classed("highlight",true)
	}
	unhightlight(){
		this.div.select("label").classed("highlight",false)
	}
	getdivWH(){
		return [this.div.node().getBoundingClientRect().width,this.div.node().getBoundingClientRect().height]
	}
	setrange(range){
		this.div.style("left",0+"px")
			.style("top",0+"px")
			.property("left", 0 )
			.property("top",0)
		this.range = range
		this.root.property("fixed", [])
			.property("open", false)
			.property("regionid", this.options.id)

		this.root.selectAll("g").remove()	
		this.root.selectAll("rect").remove()	
	}
	init() {
		drawMatrix(this.root, this.options.data, this.range, this.options)
	}
	getzoom(){
		return this.div.style("zoom")
	}
	refresh(change, visual, regiondata, range, id) {
		this.div.style("left",0+"px")
			.style("top",0+"px")
			.property("left", 0 )
			.property("top",0)

		this.options.changeval = change
		this.options.visualval = visual
		this.options.data = regiondata
		this.options.id = id
		this.range = range
		this.div.select("label").text(`Region ${this.options.id}`)
		this.root.property("fixed", [])
			.property("open", false)
			.property("regionid", this.options.id)

		this.root.selectAll("g").remove()	
		this.root.selectAll("rect").remove()	

		this.init()
	}
	delete() {
		this.div.remove()
	}
	// settransform(position){
	// 	this.div.style("transform",`translate(${position.left}px, ${position.top}px)`)
	// 		// .style("left",position.left+"px").style("top",position.top+"px")
	// 		// .property("left", position.left )
	// 		// .property("top",position.top)
	// }
	settransform(x,y){
		this.div.style("transform",`translate(${x}px, ${y}px)`)
			// .style("left",position.left+"px").style("top",position.top+"px")
			// .property("left", position.left )
			// .property("top",position.top)
	}
	setposition(position){
		this.div.style("left",position.left+"px").style("top",position.top+"px")
			.property("left", position.left )
			.property("top",position.top)
	}
	getprojectvector(){
		return this.options.data
	}
}

function resort(id) {
	d3.selectAll(".MX").each(function(d, i) {
		if (d3.select(this).select(".Matrix").property("regionid") == id) {
			let outer = get_WH_element(d3.select(this).select(".Matrix"))
			d3.select(this).select("svg")
				.style("width", `${outer.width}px`).style("height", `${outer.height}px`)
			resize_forelement(d3.select(this).select(".Matrix"))
		}
	})
}

let axiswidth = 15,
	axispadding = axiswidth * 2 + 10,
	textmargin = 5,
	interval= 5

function resize_forelement(element) {
	if (element.property("open")) {
		let WH = get_WHlist_element(element) //list
		let elementWH = get_WH_element(element)
		//element
		element.selectAll(".element").each(function(d, i) {
			if (d3.select(this).property("level") - 1 == element.property("level")) {
				// console.log(d,i)
				let left = 0,
					top = 0
				for (let i = 0; i < d.x; i++) {
					left += WH.widthlist[i] + interval
				}
				for (let i = 0; i < d.y; i++) {
					top += WH.heightlist[i] + interval
				}
				if (element.property("attrs").length == 2)
					d3.select(this).attr("transform", d => `translate(${axispadding+left},
					${axispadding+top})`)
				if (element.property("attrs").length == 1)
					d3.select(this).attr("transform", d => `translate(${left},
					${axispadding+top})`)
			}
		})
		//axis
		element.selectAll(`.attrname${element.property("level")}`)
			.attr("transform", d => {
				return element.property("attrs").length == 2 ? (d.isx ? `translate(${axispadding}, 0)` : `translate(0, ${axispadding})`) :
					(d.isx ? `translate(0, 0)` : `translate(0, ${axispadding})`)
			})
		element.selectAll(`.attrname${element.property("level")}`).select("rect")
			.style("width", d => {
				return element.property("attrs").length == 2 ? (d.isx ? elementWH.width - axispadding : axiswidth) :
					(d.isx ? elementWH.width : axiswidth)
			})
			.style("height", d => {
				return d.isx ? axiswidth : elementWH.height - axispadding
			})
		element.selectAll(`.attrname${element.property("level")}`).select("text")
			.attr("x", function(d) {
				return element.property("attrs").length == 2 ?
					(d.isx ? 0.5 * (elementWH.width - axispadding - d3.select(this).node().getBoundingClientRect().width) :
						-0.5 * (elementWH.height - axispadding + d3.select(this).node().getBoundingClientRect().height)) :
					(d.isx ? 0.5 * (elementWH.width - d3.select(this).node().getBoundingClientRect().width) :
						-0.5 * (elementWH.height - axispadding + d3.select(this).node().getBoundingClientRect().height))
			})
			.attr("y", 12)

		//axisrect
		element.selectAll(`.attraxis${element.property("level")}`)
			.attr("transform", d => {
				let trans = ""
				if (element.property("attrs").length == 2) {
					if (d.isx) {
						let result = 0;
						for (i = 0; i < d.order; i++) {
							result += WH.widthlist[i] + interval
						}
						trans = `translate(${axispadding+result}, 20)`
					} else {
						let result = 0;
						for (i = 0; i < d.order; i++) {
							result += WH.heightlist[i] + interval
						}
						trans = `translate(20, ${axispadding+result})`
					}
				} else {
					let result = 0;
					for (i = 0; i < d.order; i++) {
						result += WH.widthlist[i] + interval
					}
					trans = `translate(${result}, 20)`
				}
				return trans
			})
		element.selectAll(`.attraxis${element.property("level")}`).select("rect")
			.style("width", d => {
				return d.isx ? WH.widthlist[d.order] : axiswidth
			})
			.style("height", d => {
				return d.isx ? axiswidth : WH.heightlist[d.order]
			})
		element.selectAll(`.attraxis${element.property("level")}`).select("text")
			.text(d => d.value+"%")
			.style("fill", "white")
			.style("font-size", "11px")
			.style("font-weight", 100)
			.attr("transform", function(d) {
				return d.isx ? null : "rotate(-90 0,0)"
			})
			.attr("x", function(d) {
				if (d.isx) {
					return 0.5 * (WH.widthlist[d.order] - d3.select(this).node().getBoundingClientRect().width)
				} else {
					return -0.5 * (WH.heightlist[d.order] + d3.select(this).node().getBoundingClientRect().height)
				}
			})
			.attr("y", 12)

		element.selectAll(`.unfold${element.property("level")}`)
			.attr("transform", `translate(${elementWH.width-20 },${elementWH.height-20})`)
	} else {

	}
}

function fold(root, options,[changecolorscale, visualcolorscale_pos, visualcolorscale_neg]){
	if(root.classed("Matrix")){
		root.selectAll("g").remove()
		root.append("rect").classed("changeR", true)
				.attr("width", options.rectwidth)
				.attr("height", options.rectwidth)
				.style("fill", function(){
					let data = options.data.data
					let result = 0
					for (let i of data) {
						result += i.changeval
					}
					result = result / data.length
					if(result==0) return "#f2f2f2"
					return changecolorscale(result)
				})
		root.append("rect").classed("visualR", true)
				.style("pointer-events", "none")
				.attr("x", 5)
				.attr("y", 5)
				.attr("width", options.rectwidth / 2)
				.attr("height", options.rectwidth / 2)
				.style("fill", function(){
					let data = options.data.data
					let result = 0
					for (let i of data) {
						result += i.visualChange
					}
					result = result / data.length
					if(result==0) return "#f2f2f2"
					return result < 0 ? visualcolorscale_neg(result) : visualcolorscale_pos(result)
				})
		state.event.unfold = true
		root.property("open",false)
				state.event.isonMatrix = false

	}else{
		root.selectAll("g").remove()

		root.append("rect").classed("changeR", true)
				.attr("width", options.rectwidth)
				.attr("height", options.rectwidth)
				.style("fill", d => {
					let result = 0
					for (let i of d.data) {
						result += i.changeval
					}
					result = result / d.data.length
					if(result==0) return "#f2f2f2"
					return changecolorscale(result)
				})
		root.append("rect").classed("visualR", true)
				.style("pointer-events", "none")
				.attr("x", 5)
				.attr("y", 5)
				.attr("width", options.rectwidth / 2)
				.attr("height", options.rectwidth / 2)
				.style("fill", d => {
					let result = 0
					for (let i of d.data) {
						result += i.visualChange
					}
					result = result / d.data.length
					if(result==0) return "#f2f2f2"
					return result < 0 ? visualcolorscale_neg(result) : visualcolorscale_pos(result)
				})
		// root.append("text").attr("y",14)
		// 		.text(d=>{
		// 			console.log(d)
		// 			let result = 0
		// 			for (let i of d.data) {
		// 				result += i.visualChange
		// 			}
		// 			return (result / d.data.length).toFixed(2)*1
		// 		})
		// 		.attr("x",function(){
		// 			return 10-d3.select(this).node().getBoundingClientRect().width/2
		// 		})
		state.event.unfold = true
		root.property("open",false)
		unhightlistattrs(root.property("regionid"), root.property("level") - 1, root.property("xy"))
	}

	resort(root.property("regionid"))
}

function drawMatrix(root, data, range, options) {

	// get fixed attr name
	let attrs = getTopTwoAttr(range, root.property("fixed"))
	if (attrs.length < 1)
		return
	let fixed = $.extend(true, [], root.property("fixed"));
	for (let ob of attrs) {
		fixed.push(ob.id)
	}

	//loading data
	let thisdata = initMatrixdata(attrs)
	for (let thischange of data.data) {
		if (attrs.length == 1) {
			thisdata[(thischange.changepersentage[attrs[0].id] - attrs[0].range[0])/attrs[0].step][0].data.push(thischange)
		} else {
			thisdata[(thischange.changepersentage[attrs[0].id] - attrs[0].range[0])/attrs[0].step]
				[(thischange.changepersentage[attrs[1].id] - attrs[1].range[0])/attrs[1].step].data.push(thischange)
		}
	}
	let [changecolorscale, visualcolorscale_pos, visualcolorscale_neg] = state.data.scale

	// console.log((attrs[0].range[1] - attrs[0].range[0])/attrs[0].step + 1)
	//rendering
	//get width height
	let rectwidth = options.rectwidth
	root.property("open", true)
	root.property("attrs", attrs)
	root.property("xnum", (attrs[0].range[1] - attrs[0].range[0])/attrs[0].step + 1)
	root.property("ynum", attrs.length == 2 ? (attrs[1].range[1] - attrs[1].range[0])/attrs[1].step + 1 : 1)

	//attr axis
	//name
	let attrname = root.selectAll(`.attrname${root.property("level")}`).data(function() {
		if (attrs.length == 2)
			return [{
				name: attrs[0].name,
				isx: true
			}, {
				name: attrs[1].name,
				isx: false
			}]
		else {
			return [{
				name: attrs[0].name,
				isx: true
			}]
		}

	})
	attrname.exit().remove()
	let append_attrname = attrname.enter().append("g").classed(`attrname${root.property("level")}`, true)
	append_attrname.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.style("fill", "#ababab")
		.style("transition-duration","0.6s")
	append_attrname.append("text")
		.style("fill", "white")
		.style("font-size", "11px")
		.style("font-weight", 100)
	let merge_attrname = append_attrname.merge(attrname)
	merge_attrname.select("text").text(d => d.name)
	merge_attrname.select("text").attr("transform", function(d) {
		return d.isx ? null : "rotate(-90 0,0)"
	})
	//axis
	let attraxis = root.selectAll(`.attraxis${root.property("level")}`).data(function() {
		let data = []
		for (let i = 0; i < root.property("xnum"); i++) {
			data.push({
				name: attrs[0].name,
				isx: true,
				value: attrs[0].range[0] + i * attrs[0].step,
				order: i
			})
		}

		if (attrs.length == 2) {
			for (let i = 0; i < root.property("ynum"); i++) {
				data.push({
					name: attrs[1].name,
					isx: false,
					value: attrs[1].range[0] + i * attrs[1].step,
					order: i
				})
			}
		}
		return data
	})
	attraxis.exit().remove()
	let append_attraxis = attraxis.enter().append("g").classed(`attraxis${root.property("level")}`, true)
	append_attraxis.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.style("fill", "#ababab")
		.style("transition-duration","0.6s")
	append_attraxis.append("text")
	let merge_attraxis = append_attraxis.merge(attraxis)
	merge_attraxis.property("x", d => d.order)


	//element
	let allrect = root.selectAll(".element").data(d => {
		let data = []
		for (let i of thisdata) {
			for (let m of i) {
				data.push(m)
			}
		}
		return data
	})
	allrect.exit().remove()
	let addRect = allrect.enter().append("g").attr("class", "element")
	addRect.append("rect").classed("changeR", true)
	addRect.append("rect").classed("visualR", true)
	addRect.append("text")

	let updateRect = addRect.merge(allrect)
			.property("regionid", root.property("regionid"))
			.property("xy", d => [d.x, d.y])
			.property("fixed", fixed)
			.property("open", false)
			.property("level", root.property("level") + 1)
			.property("width", rectwidth)
			.property("height", rectwidth)
			.attr("transform", d => `translate(${axispadding+d.x * (rectwidth + interval)},
			${axispadding+d.y * (rectwidth + interval)})`)
			.on("mouseover", function(d) {
				hightlightattrs(d3.select(this))
				if (fixed.length == range.length) {


					//clustering result
					MapManager.drawRegions(state.map.leftMap, d.data[0].clusterdata, d.data[0].reflect);
					//highlight this region 
     				MapManager.highlightregion(root.property("regionid"))
					MapManager.drawchangeregions(d.data[0].changelist,d.data[0].clusterdata, d.data[0].reflect)

					PL.drawline(d.data[0].change,root.property("regionid"),d.data[0].kmeans,d.data[0].reflect)

					state.data.attrlist.forEach(thisattr => {
			            // thisattr.shownochangeregion(findnochange(d.regionid), SAC.step )
			            thisattr.add_original_value(state.data.vectors[root.property("regionid")][thisattr.getid()])
			            thisattr.add_now_value(state.data.vectors[root.property("regionid")][thisattr.getid()]+d.data[0].change[thisattr.getid()])
			        })


					//visualization Map
					if(d.data[0].MIdata!=undefined){
						let vischangelist = []
						for (let i = 0; i < state.data.LMI.length; i++) {
						    vischangelist.push(d.data[0].MIdata[i] - state.data.LMI[i])
						}
						MapManager.drawvisualchange(state.map.rightMap,vischangelist)
					}

     				//tsne
			        let TsneM = require("../Tsne/TsneManager.js");
			        // console.log(d.data[0])
			        TsneM.get_to_tsne_with_data(root.property("regionid"),d.data[0].change,d.data[0].kmeans,d.data[0].reflect)
				}
			})
			.on("mouseout", function(d) {
				unhightlistattrs(d3.select(this).property("regionid"), d3.select(this).property("level") - 1, d3.select(this).property("xy"))
				if (fixed.length == range.length) {
					PL.undrawline()
					MapManager.drawRegions(state.map.leftMap);
					MapManager.drawvisualchange(state.map.rightMap)
			      	MapManager.Un_drawchangeregions(d.data[0].changelist)
			     	MapManager.unhighlightregion(root.property("regionid"))


			     	
			        state.data.attrlist.forEach(thisattr => {
			            thisattr.hidenochangeregion()
			            thisattr.remove_nowandOri_value()
			        })
			     	
					// if ($('#projectiondimention').prop('checked')) {
					// 	SP.ScatterPlot(state.tsnemachine.Two, state.data.kmeans);
					// } else {
					// 	TDSP.ScatterPlot("divPlot", state.data.kmeans, state.tsnemachine.Three)
					// }
				}
			})
			.on("click", function(d) {
				if (fixed.length != range.length && !d3.select(this).property("open") && !state.event.unfold) {
					//add
					let newdata = {
						id: d3.select(this).property("regionid"),
						data: d.data
					}
					d3.select(this).selectAll("rect").remove()
					d3.select(this).selectAll("text").remove()
					drawMatrix(d3.select(this), newdata, range, options)
					//rescale
					resort(d3.select(this).property("regionid"))
				}

				let RM = require("./RegionMXManager.js");
				RM.reposition()
					// RM.reposition()
				state.event.unfold=false
			})

		//drawrect
		updateRect.select(".changeR")
			.attr("width", rectwidth)
			.attr("height", rectwidth)
			.style("fill", d => {
				let result = 0
				for (let i of d.data) {
					result += i.changeval
				}
				result = result / d.data.length
				if(result==0) return "#f2f2f2"
				return changecolorscale(result)
			})
		updateRect.select(".visualR")
			.style("pointer-events", "none")
			.attr("x", 5)
			.attr("y", 5)
			.attr("width", rectwidth / 2)
			.attr("height", rectwidth / 2)
			.style("fill", d => {
				let result = 0
				for (let i of d.data) {
					result += i.visualChange
				}
				result = result / d.data.length
				if(result==0) return "#f2f2f2"
				return result < 0 ? visualcolorscale_neg(result) : visualcolorscale_pos(result)
			})
			// updateRect.select("text").attr("y",14)
			// 	.text(d=>{
			// 		let result = 0
			// 		for (let i of d.data) {
			// 			result += i.visualChange
			// 		}

			// 		return result==0? "" : (result / d.data.length).toFixed(2)*1
			// 	})
			// 	.attr("x",function(){
			// 		return 10-d3.select(this).node().getBoundingClientRect().width/2
			// 	})

			let unfoldG= addunfold(root)
			unfoldG.on("click",function(){
				fold(root,options,[changecolorscale, visualcolorscale_pos, visualcolorscale_neg])
				let RM = require("./RegionMXManager.js");
				RM.reposition()
			})

		resort(root.property("regionid"))
		resize_forelement(root)
	}

	function addunfold(element){
		let tA = element.append("g").classed(`unfold${element.property("level")}`,true)
			.classed(`unfold`,true)
		let interactiveP=	tA . append("polygon")
				.attr("points","20,0 20,20 0,20")
			tA . append("line")
				.attr("x1","12")
				.attr("x2","17")
				.attr("y1","14")
				.attr("y2","14")
				.attr("style","stroke:rgb(255, 255, 255);stroke-width:2;pointer-events: none;")
		return interactiveP
	}
	
	function hightlightattrs(thisnode) {
		let xy = thisnode.property("xy")
		//
		let fathernode = d3.select(thisnode.node().parentNode)

		fathernode.selectAll(`.attrname${thisnode.property("level") - 1}`).select("rect")
						.style("fill", "#5b9bd5")
		fathernode.selectAll(`.attraxis${thisnode.property("level") - 1}`).each(function(d, i) {
			if(d.isx){
				if(d3.select(this).property("x") == xy[0]){
					d3.select(this).select("rect").style("fill", "#5b9bd5")
				}
			}else{
				if(d3.select(this).property("x") == xy[1]){
					d3.select(this).select("rect").style("fill", "#5b9bd5")
				}
			}
		})
		if(!fathernode.classed("Matrix")){
			hightlightattrs(fathernode)
		}
	}
	function unhightlistattrs(id, level, xy){
		d3.selectAll(".MX").each(function(d, i) {
				if (d3.select(this).select(".Matrix").property("regionid") == id) {
					d3.select(this).selectAll(`.attrname${level}`).select("rect")
						.style("fill", "#ababab")

					d3.select(this).selectAll(`.attraxis${level}`).each(function(d, i) {
						if(d.isx){
							if(d3.select(this).property("x") == xy[0]){
								d3.select(this).select("rect").style("fill", "#ababab")
							}
						}else{
							if(d3.select(this).property("x") == xy[1]){
								d3.select(this).select("rect").style("fill", "#ababab")
							}
						}
					})
				}
			})
	}

	function get_WH_element(element) {

		if (!element.property("open")) {
			return {
				width: element.property("width"),
				height: element.property("height")
			}
		} else {
			let list = get_WHlist_element(element)
			let textwidth = 0,
				textheight = 0
			element.selectAll(`.attrname${element.property("level")}`).each(function(d, i) {
				d.isx ? textwidth = d3.select(this).select("text").node().getBoundingClientRect().width :
					textheight = d3.select(this).select("text").node().getBoundingClientRect().height
			})
			if (element.property("attrs").length == 1)
				return {
					width: Math.max(textwidth + textmargin*2,
						d3.sum(list.widthlist) + interval * (list.widthlist.length + 1)),
					height: Math.max(textheight + textmargin*2 + axispadding,
						axispadding + d3.sum(list.heightlist) + interval * (list.heightlist.length + 1))
				}

			else
				return {
					width: Math.max(textwidth + textmargin*2 + axispadding,
						axispadding + d3.sum(list.widthlist) + interval * (list.widthlist.length + 1)),
					height: Math.max(textheight + textmargin*2 + axispadding,
						axispadding + d3.sum(list.heightlist) + interval * (list.heightlist.length + 1))
				}
		}
	}

	function get_WHlist_element(element) {
		let widthlist = [],
			heightlist = []
		for (let x = 0; x < element.property("xnum"); x++) {
			widthlist.push(0)
		}
		for (let y = 0; y < element.property("ynum"); y++) {
			heightlist.push(0)
		}
		element.selectAll(".element").each(function(d, i) {
			if (d3.select(this).property("level") == element.property("level") + 1) {
				widthlist[d3.select(this).property("xy")[0]] = Math.max(widthlist[d3.select(this).property("xy")[0]],
					get_WH_element(d3.select(this)).width)
				heightlist[d3.select(this).property("xy")[1]] = Math.max(heightlist[d3.select(this).property("xy")[1]],
					get_WH_element(d3.select(this)).height)
			}
		})
		return {
			widthlist: widthlist,
			heightlist: heightlist
		}
	}



	function getTopTwoAttr(range, fixed) {
		let count = 0;
		let result = []
		for (let ob of range) {
			if (fixed.indexOf(ob.id) == -1 && count < 2) {
				result.push(ob)
				count++
			}
		}
		return result
	}

	function initMatrixdata(attrs) {
		// console.log(attrs)
		let result = []
		for (let i = attrs[0].range[0]; i <= attrs[0].range[1]; i+=attrs[0].step) {
			result.push([])
			if (attrs.length == 1) {
				result[(i - attrs[0].range[0])/attrs[0].step].push({
					x:(i - attrs[0].range[0])/attrs[0].step,
					y: 0,
					data: []
				})
			} else {
				for (let m = attrs[1].range[0]; m <= attrs[1].range[1]; m+=attrs[1].step) {
					result[(i - attrs[0].range[0])/attrs[0].step].push({
						x:(i - attrs[0].range[0])/attrs[0].step,
						y: (m - attrs[1].range[0])/attrs[1].step,
						data: []
					})
				}
			}
		}
		return result
	}

	