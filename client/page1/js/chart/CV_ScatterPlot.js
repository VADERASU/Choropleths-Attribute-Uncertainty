var state = require("../state.js");

var MapManager = require("../Map/MapManager.js");
let PL = require("../Attr/parllel_line.js");
let TsneM = require("../Tsne/TsneManager.js");


const CVSP = {

    hightregionlist :new Map(),
	highlightCircle: function(id) {
		d3.select('#CVSP-svg').selectAll(".dot")
			.classed("dothighlight", false)

		d3.select('#CVSP-svg').select(`#point${id}`)
			.classed("dothighlight", true)
	},
	unhighlightCircle: function(id) {
		d3.select('#CVSP-svg').select(`#point${id}`)
			.classed("dothighlight", false)
	},
	selectCircle: function(id) {
		d3.select('#CVSP-svg').select(`#point${id}`)
			.classed("dotselect", true)
	},
	unSelectCircle: function(id) {
		d3.select('#CVSP-svg').select(`#point${id}`)
			.classed("dotselect", false)
	},
	highlightregion: function(regionid) {
		for(let i = 0 ;i<state.data.vectors.length;i++){
				if(i==regionid){
				d3.select('#CVSP-svg').selectAll(`.region${i}`)
					.classed("dotselect", true).classed("dotnotselect", false)
				}
				else{
				d3.select('#CVSP-svg').selectAll(`.region${i}`)
					.classed("dotselect", false).classed("dotnotselect", true)
				}
		}
	},
	refreshregion(){
		if(CVSP.hightregionlist.size!=0){
			d3.select('#CVSP-svg').selectAll(`.dot`)
					.classed("dotselect", false).classed("dotnotselect", true)
			CVSP.hightregionlist.forEach((i,id)=>{
				d3.select('#CVSP-svg').selectAll(`.region${id}`)
					.classed("dotselect", true).classed("dotnotselect", false)
			})
		}else{
			d3.select('#CVSP-svg').selectAll(".dot")
					.classed("dotselect", false).classed("dotnotselect", false)
		}
	}
}

CVSP.ScatterPlot = function(data) {
	// console.log(data)

	width = $('#CVSP-svg').width() - 35,
		height = $('#CVSP-svg').height() - 35;

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

	// add the graph canvas to the body of the webpage
	var svg = d3.select('#CVSP-svg')

	// don't want dots overlapping axis, so add in buffer to data domain
	xScale.domain([0, d3.max(data, xValue) * 1.05]);
	yScale.domain([0, d3.max(data, yValue) * 1.05]);

	// draw dots
	let alldots = svg.selectAll(".dot").data(data)
	alldots.exit().remove()
	let adddots = alldots.enter().append("circle")

	let mergedots = adddots.merge(alldots)
	mergedots.attr("cx", xMap)
		.attr("cy", yMap)
		.attr("class",d=>{
			return "dot region"+d[2].regionid})
		.attr("id", function(d, i) {
			return "point" + i;
		})
		.on("mouseover", function(data) {
			let d = data[2]
			MapManager.drawRegions(state.map.leftMap, d.clusterdata, d.reflect);

			let SAC = require("../Overviewanalysis/SingleAttrChange.js");

			if(d.change.length!=undefined){
				PL.drawline(d.change, d.regionid, d.kmeans, d.reflect)
			}else{
				let changebalabala = []
				for (let i = 0; i < state.data.attrlist.length; i++) {
					if (i == SAC.AttrId)
						changebalabala.push(d.change)
					else
						changebalabala.push(0)
				}
				PL.drawline(changebalabala, d.regionid, d.kmeans, d.reflect)
			}


			//visualization Map
			if (d.MIdata != undefined) {
				let vischangelist = []
				for (let i = 0; i < state.data.LMI.length; i++) {
					vischangelist.push(d.MIdata[i] - state.data.LMI[i])
				}
				MapManager.drawvisualchange(state.map.rightMap, vischangelist)
			}

			MapManager.highlightregion(d.regionid)
			MapManager.drawchangeregions(d.changelist)


			//tsne
			let thischange = [] ;
			if(d.change.length==undefined){
				for(let i =0;i<state.data.vectors[0].length;i++){
					if(i==SAC.AttrId){
						thischange[i] = d.change
					}else{
						thischange[i]=0
					}
				}
				

				state.data.attrlist.forEach(thisattr => {
		          if (thisattr.getid() == SAC.AttrId) {
		            thisattr.shownochangeregion(findnochange(d.regionid), SAC.step )
		            thisattr.add_original_value(state.data.vectors[d.regionid][thisattr.getid()])
		            thisattr.add_now_value(state.data.vectors[d.regionid][thisattr.getid()]+d.change)
		          }
		        })
				function findnochange(id) {
				  let min = 0;
				  max = 0
				  let list = []

				  for (let i = 0; i < SAC.data[id].data.length; i++) {
				    if (SAC.data[id].data[i].changeval == 0) {
				      if (SAC.data[id].data[i].change + state.data.vectors[id][SAC.AttrId] * 1 >= 0)
				        list.push(SAC.data[id].data[i].change + state.data.vectors[id][SAC.AttrId] * 1)
				    }
				  }
				  return list
				}


			}
			TsneM.get_to_tsne_with_data(d.regionid,thischange,d.kmeans,d.reflect)
		}).on("mouseout", function(data) {
			let d = data[2]
			PL.undrawline()

			let SAC = require("../Overviewanalysis/SingleAttrChange.js");
        state.data.attrlist.forEach(thisattr => {
          if (thisattr.getid() == SAC.AttrId) {
            thisattr.hidenochangeregion()
            thisattr.remove_nowandOri_value()
          }
        })

			MapManager.drawRegions(state.map.leftMap);
			MapManager.drawvisualchange(state.map.rightMap)
			MapManager.Un_drawchangeregions(d.changelist)
			MapManager.unhighlightregion(d.regionid)


			//tsne
			TsneM.get_to_original_tsne()
			
		}).on("click",function(data){
			let d = data[2]
			let SAC = require("../Overviewanalysis/SingleAttrChange.js");
			SAC.moveto(d.regionid)
		})

	svg.selectAll(".axis").remove()
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale).ticks(5))
		.append("text")
		.attr("dy", "-.71em")
		.attr("x", width)
		.style("text-anchor", "end")
		.style("fill", "black")
		.text("Changes of VI");

	svg.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yScale).ticks(3))
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.style("text-anchor", "end")
		.style("fill", "black")
		.text("Changes of Spatial autocorrelation");

}
module.exports = CVSP