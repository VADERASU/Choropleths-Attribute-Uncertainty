const state = require("../state.js");
const CC = require("../compare.js");
const PC = require("../PanelControl.js");
const DM = require("../DataManager.js");
const SAC = require("./SingleAttrChange.js");
const Loading = require("../Loading.js");
const MapManager = require("../Map/MapManager.js");
const OverviewAnalysis = {

	RunErrorAnalysis: function(range, attribute) {
		//show view
		PC.OverviewAnalysis()
		var AttrId = state.selectedFeatures.indexOf($("#AttrInput").val())

		SAC.data = []

		for (let VectorsID = 0; VectorsID < state.data.vectors.length; VectorsID++) {
			let thisregionresult = {
				id: VectorsID,
				data: []
			}
			for (let thischange = range.min; thischange <= range.max; thischange++) {
				let tempvectors = $.extend(true, [], state.data.vectors)

				tempvectors[VectorsID][AttrId] = tempvectors[VectorsID][AttrId] * 1 + thischange * 1;
				if (tempvectors[VectorsID][AttrId] < 0)
					tempvectors[VectorsID][AttrId] = 0;

				let change = CC.ErrorAnalysis(tempvectors)
				thisregionresult.data.push({
					changeval: change.changeval,
					reflect: change.reflect,
					kmeans: change.kmeans,
					clusterdata: change.clusterdata,
					visualChange: change.visualChange,
					change: thischange,
					MIdata: change.MIdata
				})
			}
			SAC.data.push(thisregionresult)
		}
		SAC.ReRenderingList()
	},
	RunRangesetErrorAnalysis_Byfile(rangeset){
		PC.muiltAttrAnalysis()
		console.log(rangeset)
		// let rangeset = [{id:1,data:[{name:"EDU635213",range:[-1,3],step:1},
		// 							{name:"EDU685213",range:[-2,3],step:1}]},
		// 				{id:2,data:[{name:"EDU635213",range:[-3,3],step:1},
		// 							{name:"EDU685213",range:[-4,3],step:1}]},
		// 				{id:93,data:[{name:"EDU635213",range:[-2,3],step:1},
		// 							{name:"EDU685213",range:[-5,3],step:1}]},
		// 				{id:"other",data:[{name:"EDU635213",range:[-2,3],step:1},
		// 							{name:"EDU685213",range:[-1,3],step:1}]}]
		let resultdata = [],
			changemax = 0,
			visualmin = 0,
			visualmax = 0,
			MImax = 0,
			MImin = 0
		let simulatedset = new Map()


		for(let thisrange of rangeset){
			if(thisrange.id != "other"){
				simulatedset.set(thisrange.id,1)
				let thisregionresult = {
					id: thisrange.id,
					data: [],
					range:[]
				}

				thisrange.data.forEach((o,i)=>{
					thisregionresult.range.push({
						id:state.selectedFeatures.indexOf(o.name),
						name:o.name,
						range:o.range,
						rank:i,
						step:o.step
					})
				})
				let tempvectors = $.extend(true, [], state.data.vectors)

				let thisrangeset = [[]]
				// d3.select("#attributenamelabel").text("Matrix")
				thisrange.data.forEach(ob => {
					let thisturn = []
					for (let thischange = ob.range[0]; thischange <= ob.range[1]; thischange += ob.step)
						thisturn.push({
							changeval: thischange,
							thisid: state.selectedFeatures.indexOf(ob.name)
						})

					let newrangeset = []
					for (let i = 0; i < thisrangeset.length; i++) {
						for (let m = 0; m < thisturn.length; m++) {
							let a = $.extend(true, [], thisrangeset[i])
							a.push(thisturn[m])
							newrangeset.push(a)
						}
					}
					thisrangeset = newrangeset
				})
				// console.log(thisrangeset)

				for (let thischange of thisrangeset) {
					//get data
					let changeval = Array.apply(null,Array(tempvectors[0].length)).map(function(v, i){return 0;}),
						thischangepersentage = Array.apply(null,Array(tempvectors[0].length)).map(function(v, i){return 0;})
					for (let i = 0; i < thischange.length; i++) {
						thischangepersentage[thischange[i].thisid] += thischange[i].changeval
						changeval[thischange[i].thisid] += (tempvectors[thisrange.id][thischange[i].thisid] * thischange[i].changeval/100).toFixed(1)*1
						tempvectors[thisrange.id][thischange[i].thisid] += changeval[thischange[i].thisid]
					}
					// console.log(tempvectors[thisrange.id],changeval,thischangepersentage)

					//run analysis
					let change = CC.ErrorAnalysis(tempvectors, thisrange.id)
					thisregionresult.data.push({
						changeval: change.changeval,//classification impact
						reflect: change.reflect,
						kmeans: change.kmeans,
						clusterdata: change.clusterdata,
						visualChange: change.visualChange,//visualization impact
						change: changeval,
						changepersentage : thischangepersentage,
						changelist: change.Changelist,
						MIdata: change.MIdata
					})

					//update max and min
					changemax = Math.max(change.changeval, changemax)
					visualmin = Math.min(change.visualChange, visualmin)
					visualmax = Math.max(change.visualChange, visualmax)
					if (change.MIdata != undefined) {
						for (let i = 0; i < state.data.LMI.length; i++) {
							MImin = Math.min((change.MIdata[i] - state.data.LMI[i]), MImin)
							MImax = Math.max((change.MIdata[i] - state.data.LMI[i]), MImax)
						}
					}
					// reset tempvectors
					for(let ob of thischange){
						tempvectors[thisrange.id][ob.thisid] -= changeval[ob.thisid]
					}
				}
				resultdata.push(thisregionresult)

			}else{
				let thisrangeset = [[]]
				// d3.select("#attributenamelabel").text("Matrix")
				thisrange.data.forEach(ob => {
					let thisturn = []
					for (let thischange = ob.range[0]; thischange <= ob.range[1]; thischange += ob.step)
						thisturn.push({
							changeval: thischange,
							thisid: state.selectedFeatures.indexOf(ob.name)
						})

					let newrangeset = []
					for (let i = 0; i < thisrangeset.length; i++) {
						for (let m = 0; m < thisturn.length; m++) {
							let a = $.extend(true, [], thisrangeset[i])
							a.push(thisturn[m])
							newrangeset.push(a)
						}
					}
					thisrangeset = newrangeset
				})
				// console.log(thisrangeset)

				// console.log(simulatedset)
				for (let VectorsID = 0; VectorsID < state.data.vectors.length; VectorsID++) {
					if (VectorsID % 10 == 0)
						console.log(VectorsID)
					if(!simulatedset.has(VectorsID)){
						let thisregionresult = {
							id: VectorsID,
							data: [],
							range:[]
						}
						thisrange.data.forEach((o,i)=>{
							thisregionresult.range.push({
								id:state.selectedFeatures.indexOf(o.name),
								name:o.name,
								range:o.range,
								rank:i,
								step:o.step
							})
						})

						let tempvectors = $.extend(true, [], state.data.vectors)

						for (let thischange of thisrangeset) {
							//get data
							let changeval = Array.apply(null,Array(tempvectors[0].length)).map(function(v, i){return 0;}),
								thischangepersentage = Array.apply(null,Array(tempvectors[0].length)).map(function(v, i){return 0;})
							for (let i = 0; i < thischange.length; i++) {
								thischangepersentage[thischange[i].thisid] += thischange[i].changeval
								changeval[thischange[i].thisid] += (tempvectors[VectorsID][thischange[i].thisid] * thischange[i].changeval/100).toFixed(1)*1
								tempvectors[VectorsID][thischange[i].thisid] += changeval[thischange[i].thisid]
							}
							// console.log(tempvectors[VectorsID],changeval,thischangepersentage)

							//run analysis
							let change = CC.ErrorAnalysis(tempvectors, VectorsID)
							thisregionresult.data.push({
								changeval: change.changeval,//classification impact
								reflect: change.reflect,
								kmeans: change.kmeans,
								clusterdata: change.clusterdata,
								visualChange: change.visualChange,//visualization impact
								change: changeval,
								changepersentage : thischangepersentage,
								changelist: change.Changelist,
								MIdata: change.MIdata
							})

							//update max and min
							changemax = Math.max(change.changeval, changemax)
							visualmin = Math.min(change.visualChange, visualmin)
							visualmax = Math.max(change.visualChange, visualmax)
							if (change.MIdata != undefined) {
								for (let i = 0; i < state.data.LMI.length; i++) {
									MImin = Math.min((change.MIdata[i] - state.data.LMI[i]), MImin)
									MImax = Math.max((change.MIdata[i] - state.data.LMI[i]), MImax)
								}
							}
							// reset tempvectors
							for(let ob of thischange){
								tempvectors[VectorsID][ob.thisid] -= changeval[ob.thisid]
							}
						}
						resultdata.push(thisregionresult)

					}

				}
			}
			// console.log(resultdata)
			resultdata.sort(function(a, b) {return a.id - b.id;});
			//show legend
			state.data.scale = buildscale({
				changemax: changemax,
				visualmin: visualmin,
				visualmax: visualmax
			})
			MImin = MImin.toFixed(2) * 1
			MImax = MImax.toFixed(2) * 1 + 0.01
			$("#slider-moranIrange").slider({
				min: MImin,
				max: MImax,
				values: [MImin, MImax]
			})
			$( "#moranIrangeamountmin" ).val( $( "#slider-moranIrange" ).slider( "values", 0 ))
			$( "#moranIrangeamountmax" ).val( $( "#slider-moranIrange" ).slider( "values", 1 ))
			MapManager.showMoranIlegend(MImin, MImax)
			showanalysislegend(state.data.scale)

			let RM = require("./RegionMXManager.js");
			RM.set_all_data(resultdata)

			console.log(resultdata)
			//CVSP
			var CVSP = require("../chart/CV_ScatterPlot.js");
			let CVSPdata = []
			resultdata.forEach((regiondatasac, id) => {
				regiondatasac.data.forEach(o => {
					o.regionid = id
					if (o.changeval != 0)
						CVSPdata.push([o.changeval, o.visualChange, o])
				})
			})
			CVSP.ScatterPlot(CVSPdata)
		}
	},
	RunRangesetErrorAnalysis(range) {
		console.log(range)
		switch (range.length) {
			case 0:
				break;
			case 1:
				{
					// console.log(range)
					hideanalysislegend()
					PC.SingleAttrAnalysis()
					SAC.AttrId = range[0].id
					// console.log(SAC.AttrId)
					// let min = range[0].range[1]/2 + range[0].range[0]/2-Math.ceil(d3.select("#scaleaxis").node().getBoundingClientRect().width/25)/2
					// let max = min+Math.ceil(d3.select("#scaleaxis").node().getBoundingClientRect().width/25)

					let min = range[0].range[0]
					max = range[0].range[1]
					let step = range[0].step

					d3.select("#attributenamelabel").text(range[0].name)


					SAC.data = []
					SAC.range = [min, max]
					SAC.step = step
					for (let VectorsID = 0; VectorsID < state.data.vectors.length; VectorsID++) {
						let thisregionresult = {
							id: VectorsID,
							data: []
						}
						for (let thischange = min; thischange <= max; thischange += step) {
							let tempvectors = $.extend(true, [], state.data.vectors)
							let realchange = Math.round(tempvectors[VectorsID][SAC.AttrId] * (thischange / 100))

							tempvectors[VectorsID][SAC.AttrId] = tempvectors[VectorsID][SAC.AttrId] * 1 + realchange;
							if (tempvectors[VectorsID][SAC.AttrId] < 0) {
								tempvectors[VectorsID][SAC.AttrId] = 0;
								thisregionresult.data.push({
									change: realchange,
									underzero: true
								})
							} else {
								let change = CC.ErrorAnalysis(tempvectors)
								thisregionresult.data.push({
									underzero: false,
									changeval: change.changeval,
									reflect: change.reflect,
									kmeans: change.kmeans,
									clusterdata: change.clusterdata,
									visualChange: change.visualChange,
									change: realchange,
									changelist: change.Changelist,
									MIdata: change.MIdata,
									changenumber: change.changenumber
								})
							}
						}
						SAC.data.push(thisregionresult)
					}
					SAC.ReRenderingList()
				}
				break;
			default:
				{
					PC.muiltAttrAnalysis()
					let rangeset = [
						[]
					]

					// d3.select("#attributenamelabel").text("Matrix")
					range.forEach(ob => {
						let thisturn = []
						for (let thischange = ob.range[0]; thischange <= ob.range[1]; thischange += ob.step)
							thisturn.push({
								changeval: thischange,
								thisid: ob.id
							})

						let newrangeset = []
						for (let i = 0; i < rangeset.length; i++) {
							for (let m = 0; m < thisturn.length; m++) {
								let a = $.extend(true, [], rangeset[i])
								a.push(thisturn[m])
								newrangeset.push(a)
							}
						}
						rangeset = newrangeset
					})
					// console.log(rangeset)


					let resultdata = [],
						changemax = 0,
						visualmin = 0,
						visualmax = 0,
						MImax = 0,
						MImin = 0
					for (let VectorsID = 0; VectorsID < state.data.vectors.length; VectorsID++) {
						if (VectorsID % 10 == 0)
							console.log(VectorsID)
						let thisregionresult = {
							id: VectorsID,
							data: [],
							range:range
						}
						let tempvectors = $.extend(true, [], state.data.vectors)
						for (let thischange of rangeset) {
							//get data
							let changeval = Array.apply(null,Array(tempvectors[0].length)).map(function(v, i){return 0;}),
								thischangepersentage = Array.apply(null,Array(tempvectors[0].length)).map(function(v, i){return 0;})
							for (let i = 0; i < thischange.length; i++) {
								thischangepersentage[thischange[i].thisid] += thischange[i].changeval
								changeval[thischange[i].thisid] += (tempvectors[VectorsID][thischange[i].thisid] * thischange[i].changeval/100).toFixed(1)*1
								tempvectors[VectorsID][thischange[i].thisid] += changeval[thischange[i].thisid]
							}
							// console.log(tempvectors[VectorsID],changeval,thischangepersentage)

							//run analysis
							let change = CC.ErrorAnalysis(tempvectors, VectorsID)
							thisregionresult.data.push({
								changeval: change.changeval,//classification impact
								reflect: change.reflect,
								kmeans: change.kmeans,
								clusterdata: change.clusterdata,
								visualChange: change.visualChange,//visualization impact
								change: changeval,
								changepersentage : thischangepersentage,
								changelist: change.Changelist,
								MIdata: change.MIdata
							})

							//update max and min
							changemax = Math.max(change.changeval, changemax)
							visualmin = Math.min(change.visualChange, visualmin)
							visualmax = Math.max(change.visualChange, visualmax)
							if (change.MIdata != undefined) {
								for (let i = 0; i < state.data.LMI.length; i++) {
									MImin = Math.min((change.MIdata[i] - state.data.LMI[i]), MImin)
									MImax = Math.max((change.MIdata[i] - state.data.LMI[i]), MImax)
								}
							}
							// reset tempvectors
							for(let ob of thischange){
								tempvectors[VectorsID][ob.thisid] -= changeval[ob.thisid]
							}
						}
						resultdata.push(thisregionresult)
					}

					//show legend
					state.data.scale = buildscale({
						changemax: changemax,
						visualmin: visualmin,
						visualmax: visualmax
					})
					MImin = MImin.toFixed(2) * 1
					MImax = MImax.toFixed(2) * 1 + 0.01
					$("#slider-moranIrange").slider({
						min: MImin,
						max: MImax,
						values: [MImin, MImax]
					})
					$( "#moranIrangeamountmin" ).val( $( "#slider-moranIrange" ).slider( "values", 0 ))
					$( "#moranIrangeamountmax" ).val( $( "#slider-moranIrange" ).slider( "values", 1 ))
					MapManager.showMoranIlegend(MImin, MImax)
					showanalysislegend(state.data.scale)

					let RM = require("./RegionMXManager.js");
					// console.log(resultdata)
					RM.set_all_data(resultdata)

					//CVSP
					var CVSP = require("../chart/CV_ScatterPlot.js");
					let CVSPdata = []
					resultdata.forEach((regiondatasac, id) => {
						regiondatasac.data.forEach(o => {
							o.regionid = id
							if (o.changeval != 0)
								CVSPdata.push([o.changeval, o.visualChange, o])
						})
					})
					CVSP.ScatterPlot(CVSPdata)
				}
		}

		// console.log(range)
	}


}

function hideanalysislegend() {
	d3.select("#analysis_legend").style("display", "none")
}

function showanalysislegend(scale) {


	let visualmax = scale[1],
		visualmin = scale[2],
		change = scale[0]
	$("#Matrix_change_range").slider({
		min: 0,
		max: change.domain()[1],
		values: [0, change.domain()[1]]
	})
	$("#Matrix_visual_range").slider({
		min: 0,
		max: visualmax.domain()[1],
		values: [0, visualmax.domain()[1]]
	})


	let container = d3.select("#analysis_legend").style("display", "block")
	container.selectAll("div").remove()

	container.append("div")
		.attr("style", `height: 20px;width: 20px;    font-size: 12px;line-height: 20px;background: transparent;color: #777777;
			    position: absolute;left:0; top:5px`).text(change.domain()[0].toFixed(2) * 1)
	for (let i = 0; i < 10; i++) {
		container.append("div")
			.attr("style", `height: 20px;
			    width: 20px;
			    position: absolute;`)
			.style("left", 20 + i * 20 + "px")
			.style("top", "5px")
			.style("background", function() {
				return change(change.domain()[0] + (change.domain()[1] - change.domain()[0]) / 9 * i)
			})

	}
	container.append("div")
		.attr("style", `height: 20px;width: 20px;    font-size: 12px;line-height: 20px;background: transparent;color: #777777;
			    position: absolute;left:220px; top:5px`).text(change.domain()[1].toFixed(2) * 1)


	container.append("div")
		.attr("style", `height: 20px; width: 20px;    font-size: 12px; line-height: 20px;background: transparent;color: #777777;
			    position: absolute;left:250px; top:5px`).text(visualmin.domain()[1].toFixed(2) * 1)
	for (let i = 0; i < 10; i++) {
		container.append("div")
			.attr("style", `height: 20px; width: 20px;position: absolute;`)
			.style("left", 250 + 20 + i * 20 + "px")
			.style("top", "5px")
			.style("background", function() {
				return visualmax(visualmax.domain()[0] + (visualmax.domain()[1] - visualmax.domain()[0]) / 9 * i)
			})
		// container.append("div")
		// 	.attr("style", `height: 20px;
		// 	    width: 20px;
		// 	    position: absolute;`)
		// 	.style("left", 20 + i * 20 + "px")
		// 	.style("top", 25 + "px")
		// 	.style("background", function() {
		// 		return visualmin(visualmin.domain()[1] - (visualmin.domain()[1] - visualmin.domain()[0]) / 4 * i)
		// 	})
	}
	container.append("div")
		.attr("style", `height: 20px;
			    width: 20px;    font-size: 12px;background: transparent;color: #777777;
    			line-height: 20px;
			    position: absolute;left:470px; top:5px`).text(visualmax.domain()[1].toFixed(2) * 1)


}

function buildscale(options) {
	//findmax to scale
	let visualmax_pos = options.visualmax,
		visualmax_neg = options.visualmin,
		changemax = options.changemax
	return [d3.scaleLinear()
		.domain([0, changemax])
		.range([d3.rgb("rgb(255, 255, 255)"), d3.rgb('rgb(237,125,49)')]),//rgb(255, 173, 76)
		d3.scaleLinear()
		.domain([0, visualmax_pos])
		.range([d3.rgb("rgb(255, 255, 255)"), d3.rgb('rgb(46, 117, 182)')]),//rgb(87, 183, 255)
		d3.scaleLinear()
		.domain([0, visualmax_neg])
		.range([d3.rgb("rgb(255, 255, 255)"), d3.rgb('rgb(77, 175, 74)')])//rgb(35,132,67)
	]
	//rgb(237,125,49)
}


module.exports = OverviewAnalysis