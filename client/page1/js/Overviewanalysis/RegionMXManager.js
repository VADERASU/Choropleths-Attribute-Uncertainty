let {RegionMX} = require("./RegionMX.js")

var turf = require('turf');
var state = require("../state.js");

const RM = {
	alldata : new Map(),
	renderingdata: new Map(),
	set_all_data(data){
		//data
		data.forEach((regiondata, i) => {
			let visual = 0;
			let change = 0;
			let changemax = 0;
			let visualmin = 0;
			let visualmax = 0;
			// console.log(regiondata)
			for (let ob of regiondata.data) {
				change += ob.changeval
				visual += Math.abs(ob.visualChange)
				changemax = Math.max(ob.changeval, changemax)
				visualmax = Math.max(ob.visualChange, visualmax)
				visualmin = Math.min(ob.visualChange, visualmin)
			}
			visual = visual / regiondata.data.length
			change = change / regiondata.data.length

			if (RM.alldata.has(i)) {
				if (change>0) {
					RM.alldata.get(i).changeval = change
					RM.alldata.get(i).change = visual
					RM.alldata.get(i).div.refresh(change,
						visual,
						regiondata,
						regiondata.range,
						i)
				} else {
					RM.alldata.get(i).div.delete()
					RM.alldata.delete(i)
				}
			} else {
				if (change>0) {
					RM.alldata.set(i, {
						order: i,
						changeval: change,
						visualval: visual,
						position: {left: 0,top: 0},
						div: new RegionMX(d3.select("#Rmatrixs"), {
							lengthposition: RM.alldata.size,
							id: i,
							changeval: change,
							visualval: visual,
							data: regiondata,
							changemax: changemax,
							visualmin: visualmin,
							visualmax: visualmax
						}, regiondata.range)
					})
				}
			}
		})

		d3.select("#Rmatrixs").call(d3.drag()
			.on("start", function() {
				if (!state.event.isonMatrix)
					state.event.ispanMatrix = true
				else
					state.event.ispanMatrix = false
				state.event.panx = d3.event.sourceEvent.pageX
				state.event.pany = d3.event.sourceEvent.pageY
			}).on("drag", function() {
				if (state.event.ispanMatrix) {
					d3.selectAll(".MX")
						.style("left", function() {
							return `${d3.select(this).property("left") + (d3.event.sourceEvent.pageX - state.event.panx)/(d3.select("#Rmatrixs").style("zoom")*1)}px`
						})
						.style("top", function() {
							return `${d3.select(this).property("top") + (d3.event.sourceEvent.pageY - state.event.pany)/(d3.select("#Rmatrixs").style("zoom")*1)}px`
						})
				}
			}).on("end", function() {
				if (state.event.ispanMatrix) {
					d3.selectAll(".MX")
						.style("left", function() {
							return `${d3.select(this).property("left") + 
							(d3.event.sourceEvent.pageX - state.event.panx)/(d3.select("#Rmatrixs").style("zoom")*1)}px`
						})
						.style("top", function() {
							return `${d3.select(this).property("top") + (d3.event.sourceEvent.pageY - state.event.pany)/(d3.select("#Rmatrixs").style("zoom")*1)}px`
						})
						.property("left", function() {
							return d3.select(this).property("left") + (d3.event.sourceEvent.pageX - state.event.panx) / (d3.select("#Rmatrixs").style("zoom") * 1)
						})
						.property("top", function() {
							return d3.select(this).property("top") + (d3.event.sourceEvent.pageY - state.event.pany) / (d3.select("#Rmatrixs").style("zoom") * 1)
						})
					state.event.ispanMatrix = false
				}
			}));
		d3.select("#Rmatrixs").call(d3.zoom()
				.scaleExtent([0.1, 1.5])
				.on("zoom", function() {
					d3.select(this).style("zoom", `${d3.event.transform.k}`)
				}))
			.on("dblclick.zoom", null);

		RM.rendering()
	},
	refreshbyorder(range){
		RM.alldata.forEach((thisregion,i)=>{
			thisregion.div.setrange(range)
			thisregion.div.init()
		})
		RM.rendering()
	},
	rendering: function() {
		RM.filter()
		RM.projection()
	},
	filter(){
		RM.alldata.forEach(o=>{
			o.is_satisfy=false
			let change = false,
				visual = false
			for(let thissimulation of o.div.options.data.data){
				if(thissimulation.changeval >=$( "#Matrix_change_range" ).slider( "values", 0 )&&
					thissimulation.changeval <=$( "#Matrix_change_range" ).slider( "values",1 )){
					change=true
				}
				if(thissimulation.visualChange >=$( "#Matrix_visual_range" ).slider( "values", 0 )   &&
					thissimulation.visualChange <=$( "#Matrix_visual_range" ).slider( "values",1 )){
					visual=true
				}
			}
			if(change&&visual){
				o.is_satisfy=true
			}
		})
		RM.alldata.forEach((o,i)=>{
			if(o.is_satisfy){
				o.div.div.style("display","block")
				if(!RM.renderingdata.has(i)){
					RM.renderingdata.set(i,o)
				}
			}else{
				o.div.div.style("display","none")
				if(RM.renderingdata.has(i)){
					RM.renderingdata.delete(i)
				}
			}
		})
		// console.log(RM.renderingdata)
		// console.log($( "#Matrix_change_range" ).slider( "values", 0 ),$( "#Matrix_change_range" ).slider( "values", 1))
	},
	reposition() {
		RM.renderingdata.forEach((d, i) => {
			d.position.width = d.div.getdivWH()[0]
			d.position.height = d.div.getdivWH()[1]
		})
		continue_Run()
	},
	projection() {
		// console.log(RM.renderingdata)
		if ($('#MatrixProjection').prop('checked')) {
			let points = []
			RM.renderingdata.forEach((d, i) => {
				points.push(state.map.geojson.features[i].properties.bounds.getCenter())
			})
			let BigBound = L.bounds(points)
			// console.log(BigBound)


			RM.renderingdata.forEach((d, i) => {
				let x = state.map.geojson.features[i].properties.bounds.getCenter().x - BigBound.min.x,
					y = BigBound.max.y - state.map.geojson.features[i].properties.bounds.getCenter().y
				// console.log(x,y)
				d.position.x = x /(BigBound.max.x-BigBound.min.x)*d3.select("#errorlist").node().getBoundingClientRect().width
				d.position.y = y /(BigBound.max.y-BigBound.min.y)*d3.select("#errorlist").node().getBoundingClientRect().height
				d.position.width = d.div.getdivWH()[0]
				d.position.height = d.div.getdivWH()[1]
				d.position.left = d.position.x * 1
				d.position.top = d.position.y * 1
			})
			forcedirection()
		} else {
			let data = []
			RM.renderingdata.forEach((d, i) => {
				let thisvector = []
				d.div.getprojectvector().data.forEach(ob => {
					thisvector.push(ob.changeval)
					thisvector.push(ob.visualChange)
				})
				data.push(thisvector)
			})
			let projectiondata = Calc_PCA(data)
			// console.log(projectiondata)
			let BigBound = L.bounds(projectiondata)
			let keyarray = [...RM.renderingdata.keys()]
			keyarray.forEach((id, i) => {
				RM.renderingdata.get(id).tsnex = projectiondata[i][0] - BigBound.min.x
				RM.renderingdata.get(id).tsney = projectiondata[i][1] - BigBound.min.y
				RM.renderingdata.get(id).tsnex = RM.renderingdata.get(id).tsnex/(BigBound.max.x-BigBound.min.x)*d3.select("#errorlist").node().getBoundingClientRect().width
				RM.renderingdata.get(id).tsney = RM.renderingdata.get(id).tsney/(BigBound.max.y-BigBound.min.y)*d3.select("#errorlist").node().getBoundingClientRect().height

				RM.renderingdata.get(id).position.x = RM.renderingdata.get(id).tsnex
				RM.renderingdata.get(id).position.y = RM.renderingdata.get(id).tsney
				RM.renderingdata.get(id).position.left = RM.renderingdata.get(id).tsnex 
				RM.renderingdata.get(id).position.top = RM.renderingdata.get(id).tsney
				RM.renderingdata.get(id).position.width = RM.renderingdata.get(id).div.getdivWH()[0]
				RM.renderingdata.get(id).position.height = RM.renderingdata.get(id).div.getdivWH()[1] 
			})
			// RM.reposition()
			// avoidoverlay()
			// ODNLS()
			forcedirection()
		}
	},
	heightlight(id){
		if(RM.renderingdata.has(id)){
			RM.renderingdata.get(id).div.hightlight()
		}
	},
	unheightlight(id){
		if(RM.renderingdata.has(id)){
			RM.renderingdata.get(id).div.unhightlight()
		}
	}
}
const PCA = require('ml-pca');

function Calc_PCA(vectors) {
	let pca = new PCA(vectors);

	let Cvector = []
	let TCvector = pca.getEigenvectors()
	// let pcavectors = pca.getLoadings()
	for (let i = 0; i < 2; i++) {
		let thisvector = []
		for (let n = 0; n < TCvector.length; n++) {
			thisvector.push(TCvector[n][i])
		}
		Cvector.push(thisvector)
	}

	let result = []
	for (let i = 0; i < vectors.length; i++) {
		let thispro = []
		for (let k = 0; k < 2; k++) {
			let value = 0;
			for (let n = 0; n < TCvector.length; n++) {
				value += Cvector[k][n] * vectors[i][n]
			}
			thispro.push(value)
		}
		result.push(thispro)
	}
	// for (let i = 0; i < pcavectors.length; i++) {
	// 	pcavectors[i] =  pcavectors[i].slice(0,2)
	// }
	// console.log(pca.getExplainedVariance())
	// console.log(pca.getCumulativeVariance())
	// console.log(pca.getStandardDeviations())
	// console.log(pca.getEigenvalues())
	// console.log(pca.getLoadings())

	return result
}


function forcedirection(){
	loop=1
	// console.log(RM.renderingdata)
	let thisdata = [...RM.renderingdata.values()]
	thisdata.forEach((d, i) => {
		d.r = Math.sqrt((d.position.width/2)*(d.position.width/2)+(d.position.height/2)*(d.position.height/2))
		d.x = d.position.x
		d.y = d.position.y
	})

	if(RM.simulation==undefined){
		RM.simulation = d3.forceSimulation(thisdata)
		    .force('charge', d3.forceManyBody().strength(300))
		    .force('center', d3.forceCenter(d3.select("#errorlist").node().getBoundingClientRect().width / 2, d3.select("#errorlist").node().getBoundingClientRect().height / 2))
	        .force("collide", d3.forceCollide().radius(function(d) { return d.r+3; }).iterations(2))
		    // .velocityDecay(0.2)
		    // .force("x", d3.forceX().strength(0.01))
		    // .force("y", d3.forceY().strength(0.01))
	    	// .force("collide", d3.forceManyBody().strength(function(d) { return -d.r*2; }))
		    // .force("collide", d3.forceCollide().radius(function(d) { return  d.r }).iterations(2))
	    .on("tick", ticked);
	}else{
		continue_Run()
	}
}
function continue_Run(){
	loop=1
	let thisdata = [...RM.renderingdata.values()]
	thisdata.forEach((d, i) => {
		d.r = Math.sqrt((d.position.width/2)*(d.position.width/2)+(d.position.height/2)*(d.position.height/2))
		d.x = d.position.left
		d.y = d.position.top
	})
	RM.simulation.alphaTarget(0.9).restart()
		.nodes(thisdata)
	    .on("tick", ticked);
}

let loop =  1;
function ticked() {
	// console.log("aaaa")
		loop++
		if(loop>600){
			RM.simulation.stop()
		}

		// let point = []
	if ($('#MatrixProjection').prop('checked')) {
		RM.renderingdata.forEach((d, i) => {
			d.position.left = d.x
			d.position.top = d.y
			d.position.mapbased = [d.x,d.y]
			// console.log(d.r,d.x,d.y)
			d.div.settransform(d.x - d.r/2,d.y- d.r/2)
			// point.push([d.x,d.y])
		})
	}else{
		RM.renderingdata.forEach((d, i) => {
			d.position.left = d.x
			d.position.top = d.y
			d.position.pcabased = [d.x,d.y]
			d.div.settransform(d.x- d.r/2,d.y- d.r/2)
		})
	}
		// L.bounds(point).getCenter()

}




function avoidoverlay() {
	let arred = []
	//sortbydistance
	let orderlist = [...RM.renderingdata.values()].sort(function(a, b) {
		return a.position.x * a.position.x + a.position.y * a.position.y - (b.position.x * b.position.x + b.position.y * b.position.y)
	})
	// console.log(orderlist)

	orderlist.forEach(o => {
		let resultleft = RM.renderingdata.get(o.order).position.x,
			resulttop = RM.renderingdata.get(o.order).position.y,
			resultwidth = RM.renderingdata.get(o.order).div.getdivWH()[0]
		resultheight = RM.renderingdata.get(o.order).div.getdivWH()[1]

		let resultpoint = getupdate({
			x: resultleft,
			y: resulttop
		}, resultwidth, resultheight, arred)

		RM.renderingdata.get(o.order).position.left = resultpoint.x
		RM.renderingdata.get(o.order).position.top = resultpoint.y
		RM.renderingdata.get(o.order).bounds = {
			"type": "Feature",
			"geometry": {
				"type": "Polygon",
				"coordinates": [
					[
						[resultpoint.x, resultpoint.y],
						[resultpoint.x + resultwidth, resultpoint.y],
						[resultpoint.x + resultwidth, resultpoint.y + resultheight],
						[resultpoint.x, resultpoint.y + resultheight],
						[resultpoint.x, resultpoint.y]
					]
				]
			}
		}
		//add to arred
		arred.push({
			id: o.order,
			max: [resultpoint.x + resultwidth, resultpoint.y + resultheight],
			bounds: [
				[resultpoint.x, resultpoint.y],
				[resultpoint.x + resultwidth, resultpoint.y],
				[resultpoint.x + resultwidth, resultpoint.y + resultheight],
				[resultpoint.x, resultpoint.y + resultheight],
				[resultpoint.x, resultpoint.y]
			]
		})
	})
}




module.exports = RM




			// var TsneM = require("../Tsne/TsneManager.js");
			// TsneM.get_tsne(data).then(projectiondata=>{
			// 	console.log(projectiondata)

			// 	let zoom = d3.select("#Rmatrixs").select(".MX").style("zoom")*1

			// 	let bound = L.bounds(projectiondata)
			// 	let keyarray = [...RM.renderingdata.keys()]
			// 	keyarray.forEach((id,i)=>{
			// 		RM.renderingdata.get(id).tsnex=projectiondata[i][0] -	bound.min.x
			// 		RM.renderingdata.get(id).tsney=projectiondata[i][1] -	bound.min.y
			// 		RM.renderingdata.get(id).position.x = (projectiondata[i][0] -	bound.min.x) / RM.renderingdata.get(id).div.getzoom() * zoom
			// 		RM.renderingdata.get(id).position.y = (projectiondata[i][1] -	bound.min.y) / RM.renderingdata.get(id).div.getzoom() * zoom 
			// 	})
			// 	avoidoverlay()
			// 	RM.renderingdata.forEach((d, i) => {
			// 		d.div.settransform(d.position)
			// 	})
			// });


// function ODNLSBy(polygonid) {
// 	let arranged_element = RM.renderingdata.get(polygonid)
// 	RM.renderingdata.forEach((thiselement, i) => {
// 		//arrang thielement
// 		let waiting_element = RM.renderingdata.get(i)
// 		// avoid overlay for each arranged element
// 		if (i != polygonid && isoverlay(waiting_element.position, arranged_element.position)) {
// 			console.log(i, polygonid)
// 			//overlay then move all to avoid overlay

// 			if (Math.abs(
// 					(
// 						(waiting_element.position.left - arranged_element.position.left) /
// 						(waiting_element.position.top - arranged_element.position.top)
// 					) /
// 					(
// 						arranged_element.position.width / arranged_element.position.height
// 					) > 1)) {
// 				//x
// 				if (waiting_element.position.x - arranged_element.position.x >= 0) {
// 					let repulasivex = arranged_element.position.left + arranged_element.position.width - waiting_element.position.left + margin
// 					RM.renderingdata.forEach((nowelement, nowi) => {
// 						if (nowi != i && nowi != polygonid && nowelement.position.x > waiting_element.position.x) {
// 							nowelement.position.left = nowelement.position.left + repulasivex
// 						}
// 					})
// 					waiting_element.position.left = waiting_element.position.left + repulasivex
// 				} else {
// 					let repulasivex = waiting_element.position.left + waiting_element.position.width - arranged_element.position.left + margin
// 					RM.renderingdata.forEach((nowelement, nowi) => {
// 						if (nowi != i && nowi != polygonid && nowelement.position.x < waiting_element.position.x) {
// 							nowelement.position.left = nowelement.position.left - repulasivex
// 						}
// 					})
// 					waiting_element.position.left = waiting_element.position.left - repulasivex
// 				}
// 				//y
// 				if (waiting_element.position.y - arranged_element.position.y >= 0) {
// 					let repulasivey = arranged_element.position.top + arranged_element.position.height - waiting_element.position.top + margin
// 					RM.renderingdata.forEach((nowelement, nowi) => {
// 						if (nowi != i && nowi != polygonid && nowelement.position.top > waiting_element.position.top) {
// 							nowelement.position.top += repulasivey
// 						}
// 					})
// 					waiting_element.position.top += repulasivey
// 				} else {
// 					let repulasivey = waiting_element.position.top + waiting_element.position.height - arranged_element.position.top + margin
// 					RM.renderingdata.forEach((nowelement, nowi) => {
// 						if (nowi != i && nowi != polygonid && nowelement.position.top < waiting_element.position.top) {
// 							nowelement.position.top = nowelement.position.top - repulasivey
// 						}
// 					})
// 					waiting_element.position.top = waiting_element.position.top - repulasivey
// 				}

// 			} else {
// 				//x
// 				let repulasivey //y
// 				if (waiting_element.position.y - arranged_element.position.y >= 0) {
// 					repulasivey = arranged_element.position.top + arranged_element.position.height - waiting_element.position.top + margin
// 					RM.renderingdata.forEach((nowelement, nowi) => {
// 						if (nowi != i && nowi != polygonid && nowelement.position.y > waiting_element.position.y) {
// 							nowelement.position.top += repulasivey
// 						}
// 					})
// 					waiting_element.position.top += repulasivey
// 				} else {
// 					repulasivey = waiting_element.position.top + waiting_element.position.height - arranged_element.position.top + margin
// 					RM.renderingdata.forEach((nowelement, nowi) => {
// 						if (nowi != i && nowi != polygonid && nowelement.position.y < waiting_element.position.y) {
// 							nowelement.position.top = nowelement.position.top - repulasivey
// 						}
// 					})
// 					waiting_element.position.top = waiting_element.position.top - repulasivey
// 				}
// 				let repulasivex = repulasivey / (arranged_element.position.y - waiting_element.position.y) * (arranged_element.position.x - waiting_element.position.x)
// 				repulasivex = Math.abs(repulasivex)
// 				if (waiting_element.position.x - arranged_element.position.x >= 0) {
// 					RM.renderingdata.forEach((nowelement, nowi) => {
// 						if (nowi != i && nowi != polygonid && nowelement.position.x > waiting_element.position.x) {
// 							nowelement.position.left = nowelement.position.left + repulasivex
// 						}
// 					})
// 					waiting_element.position.left = waiting_element.position.left + repulasivex
// 				} else {
// 					RM.renderingdata.forEach((nowelement, nowi) => {
// 						if (nowi != i && nowi != polygonid && nowelement.position.x < waiting_element.position.x) {
// 							nowelement.position.left = nowelement.position.left - repulasivex
// 						}
// 					})
// 					waiting_element.position.left = waiting_element.position.left - repulasivex
// 				}
// 			}



// 		}
// 	})

// 	let thisleft = arranged_element.position.left * 1,
// 		thistop = arranged_element.position.top * 1

// 	// attraction
// 	RM.renderingdata.forEach((thiselement, i) => {
// 		let pointleft = -Infinity
// 		let pointright = Infinity
// 		let pointtop = -Infinity
// 		let pointbottom = Infinity
// 		RM.renderingdata.forEach((now, nowi) => {
// 			if (now.position.x < thiselement.position.x) {
// 				pointleft = Math.max(pointleft, now.position.left + now.div.getdivWH()[0])
// 			}
// 			if (now.position.y < thiselement.position.y) {
// 				pointtop = Math.max(pointtop, now.position.top + now.div.getdivWH()[1])
// 			}
// 		})
// 		pointleft += margin
// 		pointtop += margin
// 		if (pointleft < thiselement.position.left) {
// 			let movex = thiselement.position.left - pointleft
// 			RM.renderingdata.forEach((now, nowi) => {
// 				if (now.position.x < thiselement.position.x) {
// 					now.position.left = now.position.left + movex
// 				}
// 			})
// 		}
// 		if (pointtop < thiselement.position.top) {
// 			let movey = thiselement.position.top - pointtop
// 			RM.renderingdata.forEach((now, nowi) => {
// 				if (now.position.y < thiselement.position.y) {
// 					now.position.top = now.position.top + movey
// 				}
// 			})
// 		}
// 	})



// 	thisleft = arranged_element.position.left - thisleft
// 	thistop = arranged_element.position.top - thistop
// 	console.log(thisleft, thistop)
// 	RM.renderingdata.forEach((thiselement, i) => {
// 		thiselement.position.left = thiselement.position.left - thisleft
// 		thiselement.position.top = thiselement.position.top - thistop
// 	})

// }

// function isoverlay(polygon1, polygon2) {
// 	// if(polygon1.id==66&&polygon2.id==55){
// 	// 	console.log(polygon1, polygon2)
// 	// }

// 	let polygon = {
// 		left: polygon1.left - margin,
// 		top: polygon1.top - margin,
// 		width: polygon1.width + 2 * margin,
// 		height: polygon1.height + 2 * margin,
// 	}
// 	if (ispoint_in_polygon({
// 			x: polygon2.left,
// 			y: polygon2.top
// 		}, polygon) ||
// 		ispoint_in_polygon({
// 			x: polygon2.left + polygon2.width,
// 			y: polygon2.top
// 		}, polygon) ||
// 		ispoint_in_polygon({
// 			x: polygon2.left + polygon2.width,
// 			y: polygon2.top + polygon2.height
// 		}, polygon) ||
// 		ispoint_in_polygon({
// 			x: polygon2.left,
// 			y: polygon2.top + polygon2.height
// 		}, polygon))
// 		return true



// 	polygon = {
// 		left: polygon2.left - margin,
// 		top: polygon2.top - margin,
// 		width: polygon2.width + 2 * margin,
// 		height: polygon2.height + 2 * margin,
// 	}
// 	if (ispoint_in_polygon({
// 			x: polygon1.left,
// 			y: polygon1.top
// 		}, polygon) ||
// 		ispoint_in_polygon({
// 			x: polygon1.left + polygon1.width,
// 			y: polygon1.top
// 		}, polygon) ||
// 		ispoint_in_polygon({
// 			x: polygon1.left + polygon1.width,
// 			y: polygon1.top + polygon1.height
// 		}, polygon) ||
// 		ispoint_in_polygon({
// 			x: polygon1.left,
// 			y: polygon1.top + polygon1.height
// 		}, polygon))
// 		return true
// 	return false
// }

// function ispoint_in_polygon(point, polygon) {
// 	if (point.x >= polygon.left && point.x <= polygon.left + polygon.width &&
// 		point.y >= polygon.top && point.y <= polygon.top + polygon.height)
// 		return true
// 	return false
// }


// function getupdate(position, width, height, arred) {
// 	let list = getoverlaylist(position, width, height, arred)
// 	let point = position
// 	if (list.length != 0) {
// 		list.forEach(o => {
// 			let thispoint = getpoint(L.bounds(o.bounds).max, [position.x, position.y])
// 			if (thispoint.x > point.x || thispoint.y > point.y) {
// 				point = thispoint
// 			}
// 		})
// 		return getupdate(point, width, height, arred)
// 	} else {
// 		return point
// 	}
// }

// function getoverlaylist(position, width, height, arred) {
// 	let list = []
// 	arred.forEach(arredB => {
// 		let nowrangex = {
// 			"type": "Feature",
// 			"geometry": {
// 				"type": "Polygon",
// 				"coordinates": [
// 					[
// 						[position.x, position.y],
// 						[position.x + width, position.y],
// 						[position.x + width, position.y + height],
// 						[position.x, position.y + height],
// 						[position.x, position.y]
// 					]
// 				]
// 			}
// 		}
// 		if (!turf.intersect(nowrangex, RM.renderingdata.get(arredB.id).bounds)) {} else {
// 			list.push(arredB)
// 		}
// 	})
// 	return list
// }


// let svgmatrixinterval = 5

// function getpoint(position, vectors) {
// 	if (vectors[0] == 0) {
// 		return {
// 			x: 0,
// 			y: position.y + svgmatrixinterval
// 		}
// 	} else {
// 		if (vectors[1] == 0) {
// 			return {
// 				x: position.x + svgmatrixinterval,
// 				y: 0
// 			}
// 		} else {
// 			let P1 = getpoint_y(position.y + svgmatrixinterval, vectors)
// 			let P2 = getpoint_x(position.x + svgmatrixinterval, vectors)
// 			if (P1.x < P2.x)
// 				return P1
// 			else
// 				return P2
// 		}
// 	}
// }

// function getpoint_y(y, vectors) {
// 	return {
// 		x: y / vectors[1] * vectors[0],
// 		y: y
// 	}
// }

// function getpoint_x(x, vectors) {
// 	return {
// 		x: x,
// 		y: x / vectors[0] * vectors[1]
// 	}
// }

// function findmax(arred) {
// 	let result = [0, 0]
// 	arred.forEach(o => {
// 		result[0] = Math.max(result[0], o.max[0])
// 		result[1] = Math.max(result[1], o.max[1])
// 	})
// 	return {
// 		x: result[0],
// 		y: result[1]
// 	}

// }



// let margin = 5

// function ODNLS() {
// 	let arred = []

// 	//sortbydistance
// 	let orderlist = [...RM.renderingdata.values()].sort(function(a, b) {
// 		return a.position.x * a.position.x + a.position.y * a.position.y - (b.position.x * b.position.x + b.position.y * b.position.y)
// 	})
// 	console.log(orderlist)

// 	orderlist.forEach((thiselement) => {
// 		let i = thiselement.order
// 		//arrang thielement
// 		let waiting_element = RM.renderingdata.get(i)
// 		// avoid overlay for each arranged element
// 		arred.forEach(polygonid => {
// 			let arranged_element = RM.renderingdata.get(polygonid)

// 			if (isoverlay(waiting_element.position, arranged_element.position)) {
// 				console.log("overlay", i, polygonid)
// 				//overlay then move all to avoid overlay
// 				if (Math.abs(
// 						(
// 							(waiting_element.position.left - arranged_element.position.left) /
// 							(waiting_element.position.top - arranged_element.position.top)
// 						) /
// 						(
// 							arranged_element.position.width / arranged_element.position.height
// 						) > 1)) {

// 					//x
// 					let repulasivex
// 					if (waiting_element.position.x - arranged_element.position.x >= 0) {
// 						repulasivex = arranged_element.position.left + arranged_element.position.width - waiting_element.position.left + margin
// 						RM.renderingdata.forEach((nowelement, nowi) => {
// 							if (nowi != i && nowi != polygonid && nowelement.position.x > waiting_element.position.x) {
// 								nowelement.position.left = nowelement.position.left + repulasivex
// 							}
// 						})
// 						waiting_element.position.left = waiting_element.position.left + repulasivex
// 					} else {
// 						repulasivex = waiting_element.position.left + waiting_element.position.width - arranged_element.position.left + margin
// 						RM.renderingdata.forEach((nowelement, nowi) => {
// 							if (nowi != i && nowi != polygonid && nowelement.position.x < waiting_element.position.x) {
// 								nowelement.position.left = nowelement.position.left - repulasivex
// 							}
// 						})
// 						waiting_element.position.left = waiting_element.position.left - repulasivex
// 					}

// 					let repulasivey = repulasivex / (arranged_element.position.x - waiting_element.position.x) * (arranged_element.position.y - waiting_element.position.y)
// 					repulasivey = Math.abs(repulasivey)
// 					//y
// 					if (waiting_element.position.y - arranged_element.position.y >= 0) {
// 						// let repulasivey = arranged_element.position.top + arranged_element.position.height - waiting_element.position.top + margin
// 						RM.renderingdata.forEach((nowelement, nowi) => {
// 							if (nowi != i && nowi != polygonid && nowelement.position.y > waiting_element.position.y) {
// 								nowelement.position.top += repulasivey
// 							}
// 						})
// 						waiting_element.position.top += repulasivey
// 					} else {
// 						// let repulasivey = waiting_element.position.top + waiting_element.position.height - arranged_element.position.top + margin
// 						RM.renderingdata.forEach((nowelement, nowi) => {
// 							if (nowi != i && nowi != polygonid && nowelement.position.y < waiting_element.position.y) {
// 								nowelement.position.top = nowelement.position.top - repulasivey
// 							}
// 						})
// 						waiting_element.position.top = waiting_element.position.top - repulasivey
// 					}

// 				} else {
// 					//x
// 					let repulasivey //y
// 					if (waiting_element.position.y - arranged_element.position.y >= 0) {
// 						repulasivey = arranged_element.position.top + arranged_element.position.height - waiting_element.position.top + margin
// 						RM.renderingdata.forEach((nowelement, nowi) => {
// 							if (nowi != i && nowi != polygonid && nowelement.position.y > waiting_element.position.y) {
// 								nowelement.position.top += repulasivey
// 							}
// 						})
// 						waiting_element.position.top += repulasivey
// 					} else {
// 						repulasivey = waiting_element.position.top + waiting_element.position.height - arranged_element.position.top + margin
// 						RM.renderingdata.forEach((nowelement, nowi) => {
// 							if (nowi != i && nowi != polygonid && nowelement.position.y < waiting_element.position.y) {
// 								nowelement.position.top = nowelement.position.top - repulasivey
// 							}
// 						})
// 						waiting_element.position.top = waiting_element.position.top - repulasivey
// 					}
// 					let repulasivex = repulasivey / (arranged_element.position.y - waiting_element.position.y) * (arranged_element.position.x - waiting_element.position.x)
// 					repulasivex = Math.abs(repulasivex)
// 					if (waiting_element.position.x - arranged_element.position.x >= 0) {
// 						RM.renderingdata.forEach((nowelement, nowi) => {
// 							if (nowi != i && nowi != polygonid && nowelement.position.x > waiting_element.position.x) {
// 								nowelement.position.left = nowelement.position.left + repulasivex
// 							}
// 						})
// 						waiting_element.position.left = waiting_element.position.left + repulasivex
// 					} else {
// 						RM.renderingdata.forEach((nowelement, nowi) => {
// 							if (nowi != i && nowi != polygonid && nowelement.position.x < waiting_element.position.x) {
// 								nowelement.position.left = nowelement.position.left - repulasivex
// 							}
// 						})
// 						waiting_element.position.left = waiting_element.position.left - repulasivex
// 					}
// 				}

// 			}
// 		})
// 		arred.push(i)
// 	})

// 	// // avoid overlay
// 	// RM.renderingdata.forEach((thiselement, i) => {
// 	// 	//arrang thielement
// 	// 	let waiting_element = RM.renderingdata.get(i)
// 	// 	// avoid overlay for each arranged element
// 	// 	arred.forEach(polygonid => {
// 	// 		let arranged_element = RM.renderingdata.get(polygonid)

// 	// 		if (isoverlay(waiting_element.position, arranged_element.position)) {
// 	// 			//overlay then move all to avoid overlay
// 	// 			//x
// 	// 			if (waiting_element.position.x - arranged_element.position.x >= 0) {
// 	// 				let repulasivex = arranged_element.position.left + arranged_element.position.width - waiting_element.position.left + margin
// 	// 				RM.renderingdata.forEach((nowelement, nowi) => {
// 	// 					if (nowi != i && nowi != polygonid && nowelement.position.x > waiting_element.position.x) {
// 	// 						nowelement.position.left = nowelement.position.left + repulasivex
// 	// 					}
// 	// 				})
// 	// 				waiting_element.position.left = waiting_element.position.left+repulasivex
// 	// 			} else {
// 	// 				let repulasivex = waiting_element.position.left + waiting_element.position.width - arranged_element.position.left + margin
// 	// 				RM.renderingdata.forEach((nowelement, nowi) => {
// 	// 					if (nowi != i && nowi != polygonid && nowelement.position.x < waiting_element.position.x) {
// 	// 						nowelement.position.left = nowelement.position.left - repulasivex
// 	// 					}
// 	// 				})
// 	// 				waiting_element.position.left = waiting_element.position.left- repulasivex
// 	// 			}
// 	// 			//y
// 	// 			if (waiting_element.position.y - arranged_element.position.y >= 0) {
// 	// 				let repulasivey = arranged_element.position.top + arranged_element.position.height - waiting_element.position.top + margin
// 	// 				RM.renderingdata.forEach((nowelement, nowi) => {
// 	// 					if (nowi != i && nowi != polygonid && nowelement.position.top > waiting_element.position.top) {
// 	// 						nowelement.position.top += repulasivey
// 	// 					}
// 	// 				})
// 	// 				waiting_element.position.top += repulasivey
// 	// 			} else {
// 	// 				let repulasivey = waiting_element.position.top + waiting_element.position.height - arranged_element.position.top + margin
// 	// 				RM.renderingdata.forEach((nowelement, nowi) => {
// 	// 					if (nowi != i && nowi != polygonid && nowelement.position.top < waiting_element.position.top) {
// 	// 						nowelement.position.top = nowelement.position.top - repulasivey
// 	// 					}
// 	// 				})
// 	// 				waiting_element.position.top = waiting_element.position.top - repulasivey
// 	// 			}
// 	// 		}
// 	// 	})
// 	// 	arred.push(i)
// 	// })


// 	// attraction
// 	RM.renderingdata.forEach((thiselement, i) => {
// 		let pointtop = []
// 		let pointbottom = []
// 		let bottommax_sajsfkldlsalkd = Infinity
// 		RM.renderingdata.forEach((now, nowi) => {
// 			if (now.position.y <= thiselement.position.y) {
// 				pointtop.push(now)
// 			}else{
// 				bottommax_sajsfkldlsalkd = Math.min(now.position.top,bottommax_sajsfkldlsalkd)
// 				pointbottom.push(now)
// 			}
// 		})

// 		let maxy = Infinity
// 		pointbottom.forEach(bottomelement=> {
// 			pointtop.forEach(topelement=>{
// 				if(iflineoverlay( bottomelement.position.left,bottomelement.position.left+bottomelement.position.width,
// 				    topelement.position.left,topelement.position.left+topelement.position.width)){
// 					maxy = Math.min(maxy, bottomelement.position.top - topelement.position.top - topelement.position.height  )
// 				}
// 			})
// 		})
// 		maxy = Math.min(bottommax_sajsfkldlsalkd,maxy)
// 		if(maxy>0&&maxy!=Infinity){
// 			pointbottom.forEach(bottomelement=> {
// 				bottomelement.position.top = bottomelement.position.top - maxy
// 			})
// 		}


// 		let pointleft = []
// 		let pointright = []
// 		let rightmax_sajsfkldlsalkd = Infinity
// 		RM.renderingdata.forEach((now, nowi) => {
// 			if (now.position.x <= thiselement.position.x) {
// 				pointleft.push(now)
// 			}else{
// 				rightmax_sajsfkldlsalkd = Math.min(now.position.left,rightmax_sajsfkldlsalkd)
// 				pointright.push(now)
// 			}
// 		})
// 		let maxx = Infinity
// 		pointright.forEach(rightelement=> {
// 			pointleft.forEach(leftelement=>{
// 				if(iflineoverlay( leftelement.position.top,leftelement.position.top+leftelement.position.height,
// 				    rightelement.position.top,rightelement.position.top+rightelement.position.height)){
// 					maxy = Math.min(maxy, rightelement.position.left - leftelement.position.left - leftelement.position.width  )
// 				}
// 			})
// 		})
// 		maxx = Math.min(rightmax_sajsfkldlsalkd,maxx)
// 		if(maxy>0&&maxy!=Infinity){
// 			pointright.forEach(rightelement=> {
// 				rightelement.position.left = rightelement.position.left - maxy
// 			})
// 		}

// 	})


// 	let left = Infinity
// 	let top = Infinity
// 	RM.renderingdata.forEach((thiselement, i) => {
// 		left = Math.min(thiselement.position.left * 1, left)
// 		top = Math.min(thiselement.position.top * 1, top)
// 	})
// 	console.log(left, top)
// 	RM.renderingdata.forEach((thiselement, i) => {
// 		thiselement.position.left = thiselement.position.left - left
// 		thiselement.position.top = thiselement.position.top - top
// 	})
// 	//rescale by lefttop
// }

// function iflineoverlay(x1,x2,y1,y2){
// 	if( (x1>y1&&x1<y2) || (x2>y1&&x2<y2) || (y1>x1&&y1<x2) || (y2>x1&&y2<x2) )
// 		return true
// 	else
// 		return false
// }




	// repositionby(polygonid) {
	// 	console.log("repositionby")
	// 	RM.renderingdata.forEach((d, i) => {
	// 		d.position.width = d.div.getdivWH()[0]
	// 		d.position.height = d.div.getdivWH()[1]
	// 	})
	// 	// avoidoverlay()
	// 	ODNLSBy(polygonid)
	// 	RM.renderingdata.forEach((d, i) => {
	// 		d.div.settransform(d.position)
	// 	})
	// },

// reposition() {
// 	if ($('#MatrixProjection').prop('checked')) {
// 		let points = []
// 		RM.renderingdata.forEach((d, i) => {
// 			points.push(state.map.geojson.features[i].properties.bounds.getCenter())
// 		})
// 		let BigBound = L.bounds(points)


// 		RM.renderingdata.forEach((d, i) => {
// 			let x = state.map.geojson.features[i].properties.bounds.getCenter().x - BigBound.min.x,
// 				y = state.map.geojson.features[i].properties.bounds.getCenter().y - BigBound.min.y

// 			x = (x * 800 / BigBound.getSize().x)
// 			y = (600 - y * 600 / BigBound.getSize().y)
// 			d.position.x = x
// 			d.position.y = y
// 		})
// 		// avoidoverlay()
// 		 ODNLS()
// 		RM.renderingdata.forEach((d, i) => {
// 			d.div.settransform(d.position)
// 		})
// 	} else {

// 		let keyarray = [...RM.renderingdata.keys()]
// 		keyarray.forEach((id, i) => {
// 			RM.renderingdata.get(id).position.x = RM.renderingdata.get(id).tsnex
// 			RM.renderingdata.get(id).position.y = RM.renderingdata.get(id).tsney
// 		})
// 		// avoidoverlay()
// 		 ODNLS()
// 		RM.renderingdata.forEach((d, i) => {
// 			d.div.settransform(d.position)
// 		})
// 	}
// },



// //find arredBound
// 			let maxx = findmax(arred).x,
// 				maxy = findmax(arred).y
// 			console.log(resultheight, resultwidth)

// 			//build poly
// 			let x = [Infinity, Infinity]
// 			let y = [Infinity, Infinity]
// 			if (resulttop != 0) {
// 				let vectors = [resultleft, resulttop]
// 				let thisrangex = {
// 					"type": "Feature",
// 					"geometry": {
// 						"type": "Polygon",
// 						"coordinates": [
// 							[
// 								[resultleft, resulttop],
// 								[resultleft + resultwidth, resulttop],
// 								[getpoint_y(maxy, vectors)[0] + resultwidth, maxy],
// 								getpoint_y(maxy, vectors), [resultleft, resulttop]
// 							]
// 						]
// 					}
// 				}
// 				//find overlay
// 				let overlay = []
// 				arred.forEach(arredB => {
// 					let thisover = turf.intersect(thisrangex, RM.renderingdata.get(arredB.id).bounds)
// 					if (thisover != undefined) {
// 						thisover = thisover.geometry.coordinates
// 						if (thisover[0].length != undefined) {
// 							thisover.forEach(point => {
// 								if (point[0].length != undefined) {
// 									overlay = overlay.concat(point)
// 								} else {
// 									overlay.push(point)
// 								}
// 							})
// 						} else {
// 							overlay.push(thisover)
// 						}
// 					}
// 				})
// 				let candipointlist = []
// 				console.log(overlay)
// 				//find point
// 				overlay.forEach(point => {
// 					let flag = false
// 					arred.forEach(arredB => {
// 						let nowrangex = {
// 							"type": "Feature",
// 							"geometry": {
// 								"type": "Polygon",
// 								"coordinates": [
// 									[
// 										getpoint_y(point[1], vectors), [getpoint_y(point[1], vectors)[0], getpoint_y(point[1], vectors)[1] + resultheight],
// 										[getpoint_y(point[1], vectors)[0] + resultwidth, getpoint_y(point[1], vectors)[1] + resultheight],
// 										[getpoint_y(point[1], vectors)[0] + resultwidth, getpoint_y(point[1], vectors)[1]],
// 										getpoint_y(point[1], vectors)
// 									]
// 								]
// 							}
// 						}
// 						if (turf.intersect(nowrangex, RM.renderingdata.get(arredB.id).bounds)) {

// 							// if(L.bounds(arredB.bounds).overlaps(L.bounds([
// 							// 	getpoint_y(point[1],vectors) ,
// 							// 	[point[0],point[1]] ]))){
// 							flag = true
// 						}
// 					})
// 					if (!flag) {
// 						candipointlist.push(point)
// 					}
// 				})
// 				//find min 
// 				candipointlist.forEach(point => {
// 					point = getpoint_y(point[1], vectors)
// 					if (y[0] > point[0])
// 						y = point
// 				})
// 			}
// 			if (resultleft != 0) {
// 				let vectors = [resultleft, resulttop]
// 				let thisrangex = {
// 					"type": "Feature",
// 					"geometry": {
// 						"type": "Polygon",
// 						"coordinates": [
// 							[
// 								[resultleft, resulttop],
// 								[resultleft, resulttop + resultheight],
// 								[maxx, getpoint_x(maxx, vectors)[1] + resultheight],
// 								getpoint_x(maxx, vectors), [resultleft, resulttop]
// 							]
// 						]
// 					}
// 				}
// 				//find overlay
// 				let overlay = []
// 				arred.forEach(arredB => {
// 					let thisover = turf.intersect(thisrangex, RM.renderingdata.get(arredB.id).bounds)
// 					if (thisover != undefined) {
// 						thisover = thisover.geometry.coordinates
// 						if (thisover[0].length != undefined) {
// 							thisover.forEach(point => {
// 								if (point[0].length != undefined) {
// 									overlay = overlay.concat(point)
// 								} else {
// 									overlay.push(point)
// 								}
// 							})
// 						} else {
// 							overlay.push(thisover)
// 						}
// 					}
// 				})
// 				console.log(overlay)
// 				console.log(arred)
// 				let candipointlist = []
// 				//find point
// 				overlay.forEach(point => {
// 					let flag = false
// 					arred.forEach(arredB => {
// 						let nowrangex = {
// 							"type": "Feature",
// 							"geometry": {
// 								"type": "Polygon",
// 								"coordinates": [
// 									[
// 										getpoint_x(point[0], vectors), [getpoint_x(point[0], vectors)[0], getpoint_x(point[0], vectors)[1] + resultheight],
// 										[getpoint_x(point[0], vectors)[0] + resultwidth, getpoint_x(point[0], vectors)[1] + resultheight],
// 										[getpoint_x(point[0], vectors)[0] + resultwidth, getpoint_x(point[0], vectors)[1]],
// 										getpoint_x(point[0], vectors)
// 									]
// 								]
// 							}
// 						}
// 						if (turf.intersect(nowrangex, RM.renderingdata.get(arredB.id).bounds)) {
// 							flag = true
// 						}
// 					})
// 					if (!flag) {
// 						candipointlist.push(point)
// 					}
// 				})
// 				//find min 
// 				candipointlist.forEach(point => {
// 					point = getpoint_x(point[0], vectors)
// 					if (x[0] > point[0])
// 						x = point
// 				})
// 			}
// 			let resultposition = [Infinity, Infinity]

// 			if (x[0] != Infinity && y[0] != Infinity) {
// 				resultposition = x
// 				if (x[0] < y[0])
// 					resultposition = y
// 			} else {
// 				if (x[0] != Infinity) {
// 					resultposition = x
// 				} else {
// 					if (y[0] != Infinity) {
// 						resultposition = y
// 					} else {
// 						resultposition = [resultleft, resulttop]
// 					}
// 				}
// 			}
// 			//setposition
// 			resultleft = resultposition[0]
// 			resulttop = resultposition[1]
// 			console.log(o, x, y)