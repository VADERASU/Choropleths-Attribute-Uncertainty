//data manager
let state = require("../state.js");
let {MapClass} = require  ('./MapClass.js');
//Map Manager
const MapManager={
	Init : function(){
		state.map.leftMap =  new MapClass('og-map',{});
		state.map.rightMap =  new MapClass('max-map',{});
		SetMapCor(state.map.leftMap,state.map.rightMap)
	},
	PopupAttr : {} ,
	bounds : L.latLngBounds(L.latLng(90,180), L.latLng(-60,-180)),
	unhighlightregion:function (id){
		MapManager.renderingregion(state.map.leftMap,state.map.leftMap.getLayers())
		MapManager.renderingregion(state.map.rightMap,state.map.rightMap.getLayers())
	},
	highlightregion:function (id){
		state.map.leftMap.getLayers().forEach((obj,i)=>{
			if(state.ADhighlightlist.indexOf(i)==-1){
			  state.map.leftMap.setUHL(i)
			}else{
			  state.map.leftMap.setSel(i)
			}
		})
		state.map.rightMap.getLayers().forEach((obj,i)=>{
			if(state.ADhighlightlist.indexOf(i)==-1){
			  state.map.rightMap.setnormal(i)
			}else{
			  state.map.rightMap.setSel(i)
			}
		})
		state.map.leftMap.setHL(id)
		state.map.rightMap.setHL(id)
	},
	selectregion: function (id){
		state.map.leftMap.setSel(id)
		state.map.rightMap.setSel(id)
	},
	clearComparisonMaps:function(){
		state.map.leftMap.removeLayer()
		state.map.rightMap.removeLayer()
	},
	drawRegions(thisMap,ChangeClass,reflect){
		let features = state.map.geojson.features
		let reflectset=[]
		if(ChangeClass!=undefined){
			for(let i=0;i<features.length;i++){
				reflectset[i] = reflect.indexOf(ChangeClass[i])*1
			}
		}
		else{
			for(let i=0;i<features.length;i++){
				reflectset[i] = features[i].properties.KMeansCluster*1
			}
		}
		thisMap.SetLayer(state.map.geojson, state.color, onEachFeature, reflectset)
		this.renderingregion(thisMap, thisMap.getLayers())
	},
	renderingregion: function(thismap,layer){
		if(state.ADhighlightlist.length == 0){
			layer.forEach((obj,i)=>{thismap.setnormal(i)})
		}else{
			layer.forEach((obj,i)=>{
				if(state.ADhighlightlist.indexOf(i)==-1){
				  thismap.setUHL(i)
				}else{
				  thismap.setSel(i)
				}
			})
		}
	},
	drawchangeregions:function (idlist,clusterdata, reflect){
		idlist.forEach(id=>{
			let stripes = new L.StripePattern({
	            patternContentUnits: 'objectBoundingBox',
	            patternUnits: 'objectBoundingBox',
	            weight: 0.04,
	            spaceWeight:1000,
	            height: 0.13,
	            color:state.color(state.map.geojson.features[id].properties.KMeansCluster),
	            angle: 45,
		      });
			let thispath;
			// state.map.geojson.features.forEach(region=>{
			// 	if(region.id==id)
			thispath = state.map.geojson.features[id].geometry.coordinates[0]
			if(thispath[0].length!=2)
				thispath = thispath[0]
			// })
			state.map.leftMap.setischange(id,stripes,thispath)
		})
	},
	Un_drawchangeregions:function (idlist){
		idlist.forEach(id=>{
			state.map.leftMap.setUHL(id)
		})
	},
	fixed_simulation(){

	},
	drawvisualchange:function(thismap,vischangelist,max,min){
		if(vischangelist!=undefined){
			let colorscale = function(value){
				if(value<$( "#slider-moranIrange" ).slider( "values", 1 )&&value>$( "#slider-moranIrange" ).slider( "values",0))
					return MapManager.morancolorscale(value)
				else
					return "none"
			}
			thismap.SetLayer(state.map.geojson, colorscale, onEachFeature, vischangelist)
		}else{
			thismap.SetLayer(state.map.geojson, ["none"], onEachFeature)
		}
	},
	showclassificationlegend:function(k){
		let recttotalwidth = 400
		let alllegend = d3.select("#classification_legend").selectAll("div").data(function(){
			state.classificationcolor.sort(function(a, b) {return a.value - b.value})
			for(let i=0;i<state.classificationcolor.length;i++){
				if(i==0)
					state.classificationcolor[i].left = 0 
				else
					state.classificationcolor[i].left = (state.classificationcolor[i].value+state.classificationcolor[i-1].value)/2
				if(i ==state.classificationcolor.length-1)
					state.classificationcolor[i].right = 1
				else
					state.classificationcolor[i].right = (state.classificationcolor[i].value+state.classificationcolor[i+1].value)/2
			}
			console.log(state.classificationcolor)
			return state.classificationcolor
		})

		alllegend.exit().remove()
		let addlegend = alllegend.enter().append("div")
		addlegend.append("div").attr("id","legendtext")
		let mergelegend = addlegend.merge(alllegend)
		mergelegend.attr("style",(d,i)=>{
			return `background:${d.color};
			    height: 20px;
			    width: 20px;
			    border-radius: 3px;
			    margin: 2px;`
		})

		if(state.selectedFeatures.length == 1){
			// find max
			let max = Math.max.apply(Math, state.map.geojson.features.map(function(o) { return o.properties[state.selectedFeatures[0]]; }))
			mergelegend.select("#legendtext")
				.text((d,i)=>`${Math.floor(max*d.left)} ~ ${Math.floor(max*d.right)}`)
				.attr("style", `color: white;
				    position: absolute;
				    z-index: 1;
				    font-size: 11px;
				    line-height: 20px;
				    left: 40px;`)
		}else{
			let labelname  = ["A","B","C","D","E","F","G","H"]
			mergelegend.select("#legendtext").text((d,i)=>{
				return labelname[i]
			}).attr("style", `color: white;
			    position: absolute;
			    z-index: 1;
			    font-size: 11px;
			    line-height: 20px;
			    left: 40px;`)
		}
	},
	showMoranIlegend:function(min , max){
		MapManager.morancolorscale = d3.scaleLinear()
			.domain([min<-1?-1:min, 0, max>1?1:max])
			.range([d3.hsl('#2166ac'),d3.hsl('#f7f7f7'),d3.hsl('#b2182b')])
			// .range([d3.rgb('rgb(179,222,105)') , d3.rgb("rgb(255, 255, 255)"), d3.rgb('rgb(251,128,114)')])
			// .range([d3.hsl('#fc8d59'),d3.hsl('#ffffff'),d3.hsl('#91bfdb')])
		let alllegend = d3.select("#moranI_legend").selectAll("div").data(function(){
			let data = [];
			for(let i=0;i<10;i++){
				data.push({i:i, color:MapManager.morancolorscale((max-min)/9*i+min)})
			}
			return data
		})

		alllegend.exit().remove()
		let addlegend = alllegend.enter().append("div")
		let mergelegend = addlegend.merge(alllegend)
		mergelegend.attr("style",d=>{
			return `background:${d.color}; height: 20px;width: 20px;position: absolute;border-radius: 3px;
			    left: ${35+20*d.i}px;`
		})
	}

}

function SetMapCor(Map1,Map2){
	Map1.getMap().on('drag', function(e){
				let center = Map1.getMap().getCenter();
					Map2.getMap().panTo(center);});
	Map1.getMap().on('zoomend', function(e){
				let zoom = Map1.getMap().getZoom();
					Map2.getMap().setZoom(zoom);});
	Map2.getMap().on('drag', function(e){
				let center = Map2.getMap().getCenter();
					Map1.getMap().panTo(center);});
	Map2.getMap().on('zoomend', function(e){
				let zoom = Map2.getMap().getZoom();
					Map1.getMap().setZoom(zoom);});
}

let CA = require("../CombinationAnalysis.js");
let CrimeList = require("../CrimeList.js");
let PC = require("../PanelControl.js");
var RS = require("../RegionStatistic.js");
//Map interaction
function onEachFeature(feature, layer) {
	// layer.bindPopup('something')
    layer.on({
   //  	click:function(e){
   //  		CA.changelist.forEach((o,id)=>{
   //  			if(o.size==0)
		 //              CA.changelist.delete(id)
   //  		})
			// PC.SpecificationAnalysis();
   // 			let ID = e.target.feature.properties.FeatureIndex
   // 			MapManager.PopupAttr = e.target.feature.properties
   // 			if(!CA.changelist.has(ID))
   // 				CA.changelist.set(ID,new Map())

   // 			CA.ReRenderingList()
   // 			CrimeList.Rendering(MapManager.PopupAttr.crimelist)
			// RS.Rendering(MapManager.PopupAttr.crimelist)
			// $('#specifylist').animate({  
		 //        scrollTop: $(`#regionspecify${ID}`).offset().top-$('#specifylistsvg').offset().top
		 //    },500);
   //  	},
        mouseover: highlightFeature,
        mouseout: unhighlightFeature,
    	click:function(e){
			let ID = e.target.feature.properties.FeatureIndex
			let SAC = require("../Overviewanalysis/SingleAttrChange.js");
			SAC.moveto(ID)
    	}
    });
}

// domestic_disturbances
function highlightFeature(e) {
	d3.select("#regiondatadetail").attr("isshow",true)
	let ID = e.target.feature.properties.FeatureIndex

	state.map.leftMap.getLayers().forEach((obj,i)=>{
		if(state.ADhighlightlist.indexOf(i)==-1){
		  state.map.leftMap.setUHL(i)
		}else{
		  state.map.leftMap.setSel(i)
		}
	})
	state.map.rightMap.getLayers().forEach((obj,i)=>{
		if(state.ADhighlightlist.indexOf(i)==-1){
		  state.map.rightMap.setUHL(i)
		}else{
		  state.map.rightMap.setSel(i)
		}
	})
	state.map.leftMap.setHL(ID)
	state.map.rightMap.setHL(ID)

	// if(CA.changelist.has(ID)){
	//  $('#specifylist').animate({  
	//         scrollTop: $(`#regionspecify${ID}`).offset().top-$('#specifylistsvg').offset().top
	//     },500);
	//  }
	//highlightPoint
	showdetaildata(e)
	let SP = require("../ScatterPlot.js");
	SP.highlightCircle(e.target.feature.properties.FeatureIndex);


	let RM = require("../Overviewanalysis/RegionMXManager.js");
	RM.heightlight(e.target.feature.properties.FeatureIndex)	

}
function unhighlightFeature(e) {
	d3.select("#regiondatadetail").attr("isshow",false)
	MapManager.renderingregion(state.map.leftMap, state.map.leftMap.getLayers())
	MapManager.renderingregion(state.map.rightMap, state.map.rightMap.getLayers())
	let ID = e.target.feature.properties.FeatureIndex
	let SAC = require("../Overviewanalysis/SingleAttrChange.js");
	SAC.unhighlightSAC(ID)

    //unhighlightPoint
    hidedetaildata()
	let SP = require("../ScatterPlot.js");
	SP.unhighlightCircle(e.target.feature.properties.FeatureIndex);
	let RM = require("../Overviewanalysis/RegionMXManager.js");
	RM.unheightlight(e.target.feature.properties.FeatureIndex)	
}

function showdetaildata(e){
	// console.log(e.target.feature.id)
	let data = e.target.feature.properties
	let container = d3.select("#regiondatadetail").style("left","0px")
	container.style("height", 10+25*state.eventattrname.length +"px")

	let max = 0

	let allattrde = container.selectAll(".attrDe").data(function(){
		let result = []
		for(let name of state.eventattrname){
			result.push({name:name,number:data[name]})
			max = Math.max(max,data[name])
		}
		return result
	})
	allattrde.exit().remove()

	let addattrde = allattrde.enter().append("div").classed("attrDe",true)
	addattrde.append("div").classed("name",true)
	addattrde.append("div").classed("rect",true)

	let mergeattrde = addattrde.merge(allattrde)
	mergeattrde.select(".name").text(d=>{
		return d.name
	})
	mergeattrde.select(".rect").text(d=>d.number).style("width",d=>{
		return d.number / max * 140 +"px"
	})
}

d3.select("#map-container").on("mousemove",function(){
	// console.log(d3.mouse(this)[0],d3.mouse(this)[1])
	if(d3.select("#regiondatadetail").attr("isshow")=="true"){

			let rightmax = $('#map-container').width()- 10 - $('#regiondatadetail').width()
			let leftmin = 10
			let bottommin = d3.mouse(this)[1] < $('#og-map-div').height() ?  ($('#og-map-div').height() - $('#regiondatadetail').height() ):( $('#map-container').height()-10 - $('#regiondatadetail').height() )
			let topmin =d3.mouse(this)[1] < $('#og-map-div').height() ? 30 : $('#og-map-div').height()+30


			let left = d3.mouse(this)[0] < leftmin? leftmin: d3.mouse(this)[0] > rightmax? rightmax: d3.mouse(this)[0]
			let top = d3.mouse(this)[1] <topmin? topmin : d3.mouse(this)[1]> bottommin?bottommin : d3.mouse(this)[1]


		d3.select("#regiondatadetail").style("left",left+"px").style("top",top+"px")
	}
})

function hidedetaildata(){
	d3.select("#regiondatadetail").style("left","8000px")
}


			
module.exports = MapManager;