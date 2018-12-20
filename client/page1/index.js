require("./css/index.scss");
require("./css/Attr.scss");
require("./css/menu.scss");
require("./css/errorlist.scss");
localStorage.clear();
//data manager
var state = require("./js/state.js");
//map
var map = require("./js/Map/MapManager.js");
console.log(require("./js/Map/MapManager.js"))
map.Init()
//file reader
var Fileloading = require("./js/FileLoading.js");
Fileloading.init();

var TsneM = require("./js/Tsne/TsneManager.js");
var ClusterAl = require("./js/ClusterAl.js");
var SP = require("./js/ScatterPlot.js");
var TDSP = require("./js/chart/3dScatterPlot.js");
var SliH = require("./js/Silhouette.js");
var CC = require("./js/compare.js");
var LineC = require("./js/LineChart.js");
var CA = require("./js/CombinationAnalysis.js");

var PC = require("./js/PanelControl.js");
PC.init();

// linechart
// var SD=require("./js/SetDistribution.js")
// 	SD.rendering(0,10)
// $( "#Gaussian-slider-range").slider({
//   range: true,
//   min: -10,
//   max: 10,
//   step:1,
//   values: [ -1, 1 ],
//   slide: function(event, ui) {
//     $( "#Gaussiandefine" ).val("Gaussian: "+ui.values[ 0 ] + " - " + ui.values[ 1 ] );
//     SD.rendering(ui.values[ 0 ],ui.values[ 1 ])
//   }
// });
// $( "#Gaussiandefine" ).val( "Gaussian: "+$( "#Gaussian-slider-range" ).slider( "values", 0 ) +
//   " ~ " + $( "#Gaussian-slider-range" ).slider( "values", 1 ) );

var DM = require("./js/DataManager.js");

var OO = require("./js/Option/OverviewOption.js");

let RM = require("./js/Overviewanalysis/RegionMXManager.js");
$( function() {
	$('#run-K-means').button().click(RunOriKmeans);
	$('#run-Analysis').button().click(runanalysis);

	//projection
	 $('#projectiondimention').bootstrapToggle({
	      on: '2D',
	      off: '3D',
	      size:"mini"
	    });
	 $('#projectiondimention').change(function() {
	 	if($('#projectiondimention').prop('checked')){
			SP.ScatterPlot(state.tsnemachine.Two,state.data.kmeans);
			$("#twoDScat").show()
			$("#divPlot").hide()
	 	}else{
	 		TDSP.ScatterPlot("divPlot",state.data.kmeans,state.tsnemachine.Three)
			$("#twoDScat").hide()
			$("#divPlot").show()
	 	}
	 })
	$("#twoDScat").show()
	$("#divPlot").hide()

	 $('#MatrixProjection').bootstrapToggle({
	      on: 'Map',
	      off: 'PCA',
	      size:"mini"
	    });
	 $('#MatrixProjection').change(function() {
		RM.projection()
	 })


	//normalize
	$('#norm-input').bootstrapToggle({
	      on: 'ON',
	      off: 'OFF',
	      size:"mini"
	    });


	//moranIrange
	$( "#slider-moranIrange" ).slider({
      range: true,
      min: -1,
      max: 1,
      values: [ -1, 1 ],
      step:0.01,
      slide: function( event, ui ) {
        $( "#moranIrangeamountmin" ).val( ui.values[ 0 ])
        $( "#moranIrangeamountmax" ).val( ui.values[ 1  ])
      }
    });
        $( "#moranIrangeamountmin" ).val( $( "#slider-moranIrange" ).slider( "values", 0 ))
        $( "#moranIrangeamountmax" ).val( $( "#slider-moranIrange" ).slider( "values", 1 ))
    map.showMoranIlegend(-1, 1)


    //matrixrange
	$( "#Matrix_change_range" ).slider({
      range: true,
      min: -1,
      max: 1,
      values: [ -1, 1 ],
      step:0.001,
      slide: function( event, ui ) {
      	RM.rendering()
      }
    });
	$( "#Matrix_visual_range" ).slider({
      range: true,
      min: -1,
      max: 1,
      values: [ -1, 1 ],
      step:0.001,
      slide: function( event, ui ) {
      	RM.rendering()

      }
    });
	    $("#Matrixlegend").hide()
	    $("#Riverlegend").hide()

	$('#Loading_uncertainty_input').change(function() {
	  console.log(this.files);
	  state.isloadinguncertaintysetting = true;
	  d3.csv(`./${this.files[0].name}`).then(data => {
	  		let uncertaintyrange = new Map()
	  		for( let ob of data){
	  			if(ob.id*1>=0){
		  			if(uncertaintyrange.has(ob.id*1)){
		  				uncertaintyrange.get(ob.id*1).data.push({name:ob.name,range:[ob.range1*1,ob.range2*1],step:ob.step*1})
		  			}else{
						let thisrange = {id:ob.id*1,data:[]}
						thisrange.data.push({name:ob.name,range:[ob.range1*1,ob.range2*1],step:ob.step*1})
		  				uncertaintyrange.set(ob.id*1,thisrange)
		  			}
	  			}else{
		  			if(uncertaintyrange.has(ob.id)){
		  				uncertaintyrange.get(ob.id).data.push({name:ob.name,range:[ob.range1*1,ob.range2*1],step:ob.step*1})
		  			}else{
						let thisrange = {id:ob.id,data:[]}
						thisrange.data.push({name:ob.name,range:[ob.range1*1,ob.range2*1],step:ob.step*1})
		  				uncertaintyrange.set(ob.id,thisrange)
		  			}
	  			}
	  		}
	  		state.uncertainty_specified_range = [...uncertaintyrange.values()]

	  		console.log(d3.select("#MXcontainerdiv"))
	  		d3.select("#MXcontainerdiv").style("width","calc(70% - 20px)")
	  		d3.select("#specify_uncertainty_per").style("display","block")
	  		
	  		let allperun = d3.select("#specify_uncertainty_per").selectAll(".peruncer")
	  				.data(state.uncertainty_specified_range)
	  			allperun.exit().remove()
	  		let addperun = allperun.enter().append("div")
	  			.classed("peruncer",true)
	  		let mergeperun = addperun.merge(allperun)
	  		mergeperun.text(d=>{
	  				console.log(d)
	  				return `Region ${d.id}`
	  			})
	  			.style("font-size","11px")
	  			.style("padding","5px")
	  			.style("border-bottom","1px dashed rgb(51, 122, 183)")
	  			.style("line-height","17px")

	  			let allrange_per = mergeperun.selectAll(".perrange")
	  				.data(d=>{
	  					console.log(d.data)
	  					return d.data
	  				})
	  			allrange_per.exit().remove()
	  			let addrange_per= allrange_per.enter().append("div")
	  				.classed("perrange",true)
	  			mergerange_per = addrange_per.merge(allrange_per)
	  			mergerange_per.text(d=>`${d.name} : range:[${d.range[0]},${d.range[1]}], step:${d.step}`)
	  			.style("font-size","10px")
	  			.style("padding-left","5px")
	  			.style("text-align","left")
	  			.style("margin","1px")

		});
	});
  d3.select("#Loading_uncertainty").on("click",function(){
    $('#Loading_uncertainty_input').click()
  })   



});


// 	console.log(L.PatternRect())
// L.PatternRect({ x: 5, y: 5, width: 40, height: 40, rx: 10, ry: 10, fill: true }).addTo(state.map.leftMap);

function getselectA(){
	let result = []
	d3.select("#DASelectContainer").selectAll("div.selected")._groups[0].forEach(o=>{
		result.push(o.textContent)
	})
	return result
}

var Attrmanager = require("./js/Attr/Attrmanager.js");
function RunOriKmeans(){
	console.log("-------------Kmeans start-------------- : ")
	state.selectedFeatures 	= getselectA()
	state.data.kMeansK		= $('#kMeans-input').val()*1;
	let features 			= state.map.geojson.features;

	// read the vectors via selected features
	state.data.vectors = new Array();
	for(let vectorIndex = 0; vectorIndex < features.length; vectorIndex++){
		let vector = new Array(state.selectedFeatures.length);
		for(let featureIndex = 0; featureIndex < vector.length; featureIndex++){
			vector[featureIndex] = features[vectorIndex].properties[state.selectedFeatures[featureIndex]];
		}
		state.data.vectors.push(vector);
	}
	// console.log(state.data.vectors)

	//copy for analysis
	CA.data = $.extend(true, [], state.data.vectors);
	CA.features = $.extend(true, [], state.map.geojson.features);

	let normalizedata;
	if($('#norm-input').prop('checked'))
		normalizedata = DM.normalize(state.data.vectors)
	else
		normalizedata = state.data.vectors;
	// console.log("normalize data : ",normalizedata)

	//kmeans
	ClusterAl.Cluster(state.data.kMeansK, normalizedata, $('#clusterType').val())

	map.showclassificationlegend(state.data.kMeansK)

		console.log(state.data.kmeans)

	let MI = require("./js/MoranI/MoranI.js");
	MI.setslide(MI.CalcLMI(state.data.kmeans), state.data.kmeans)
	// let GOGi = require("./js/MoranI/Getis_Ord_Gi.js");
	// GOGi.CalcLGOGi(state.data.kmeans, 1);
	
	// tsne
	TsneM.RuntSNE(normalizedata);


	//drawMap
	map.clearComparisonMaps();
	map.drawRegions(state.map.leftMap);
	map.drawvisualchange(state.map.rightMap);

	
	// OO.SetAttrInput();

	Attrmanager.Refresh()
	console.log("-------------kmeans end-------------- : ")


	d3.select("#parameterOption").classed("normal",true)
	d3.select("#mod").style("top","-480px")
}
		
function runanalysis(){
	console.log("-------------Analysis start-------------- : ")
	let OverviewAnalysis = require("./js/Overviewanalysis/Analysis.js");


	if( state.isloadinguncertaintysetting == true){
		OverviewAnalysis.RunRangesetErrorAnalysis_Byfile(state.uncertainty_specified_range)
	}else{
		OverviewAnalysis.RunRangesetErrorAnalysis(Attrmanager.getrangeset())
	}


	// let rangeset = OO.GetRange();
	// Analysis.RunErrorAnalysis({
	// 		min: OO.GetMin(),
	// 		max: OO.GetMax()
	// 	}, OO.GetAttrInput())

	console.log("-------------Analysis end-------------- : ")
}

// Fileloading.fileOpen('./CommAreasNew.zip',state)


// let shpmap = new Map()
// shp('./tl_2017_us_county.zip').then(function(geojson){
	// for(let ob of geojson.features){
	// 	if(!shpmap.has(ob.properties.COUNTYFP+","+ob.properties.COUNTYNS)){
	// 		shpmap.set(ob.properties.COUNTYFP+","+ob.properties.COUNTYNS,ob)
	// 	}
	// }
	// console.log(shpmap.size)


// 	shp('./election.zip').then(function(geojson2){
// 		console.log(geojson2)
// 		for(let ob of geojson2.features){
// 			if(!shpmap.has(ob.properties.COUNTYFP+","+ob.properties.COUNTYNS)){
// 				console.log("ssss")
// 			}else{
// 				shpmap.get(ob.properties.COUNTYFP+","+ob.properties.COUNTYNS).properties = ob.properties
// 			}
// 		}
// 		console.log(shpmap)
// 		geojson2.features = [...shpmap.values()]
// 		L.geoJson(geojson2, {
// 				style: function(feature) {
// 					return {
// 						fillColor: "blue",
// 						weight: 1,
// 						opacity: 1,
// 						color: 'white',
// 						fillOpacity: 0.6
// 					}
// 				}
// 			}).addTo(state.map.leftMap.map);
// 	})
// })


// console.log(d3.scaleSequential(d3.interpolatePiYG))
// console.log()


// var canvas = document.querySelector("canvas"),
//     context = canvas.getContext("2d"),
//     width = canvas.width,
//     height = canvas.height,
//     tau = 2 * Math.PI;

// var nodes = d3.range(100).map(function(i) {
//   return {
//     r: Math.random() * 14 + 4
//   };
// });


// console.log(nodes)
// // console.log(d3.forceX().strength(0.002))

// var simulation = d3.forceSimulation(nodes)
//     // .velocityDecay(0.1)
//     // .force("x", d3.forceX().strength(0.01))
//     // .force("y", d3.forceY().strength(0.01))
//   .force('charge', d3.forceManyBody().strength(5))
//   .force('center', d3.forceCenter(d3.select("#errorlist").node().getBoundingClientRect().width / 2, d3.select("#errorlist").node().getBoundingClientRect().height / 2))
//     .force("collide", d3.forceCollide().radius(function(d) { return d.r + 0.5; }).iterations(2))
//     // .force("collide", d3.forceManyBody().strength(function(d) { return -d.r*2; }))
//     .on("tick", ticked);

// let loop=0
// function ticked() {
// 	if(loop==0){
// 		loop++
// 		console.log(nodes)
// 	}
//   context.clearRect(0, 0, width, height);
//   context.save();
//   context.translate(width / 2, height / 2);

//   context.beginPath();
//   nodes.forEach(function(d) {
//     context.moveTo(d.x + d.r, d.y);
//     context.arc(d.x, d.y, d.r, 0, tau);
//   });
//   context.fillStyle = "#ddd";
//   context.fill();
//   context.strokeStyle = "#333";
//   context.stroke();

//   context.restore();
// }




// const PCA = require('ml-pca');
// const newPoints = 
// [[10, 3, 1, 8],
// [4.9, 2, 7, 0.4],
// [5.4, 10, 1, 5]];
// console.log(Calc_PCA(newPoints))

// function Calc_PCA(vectors){
// 	let pca = new PCA(newPoints);

// 	let Cvector = []
// 	let TCvector = pca.getEigenvectors()


// 	for(let i = 0;i<2;i++){
// 		let thisvector = []
// 		for(let n = 0; n<TCvector.length;n++){
// 			thisvector.push(TCvector[n][i])
// 		}
// 		Cvector.push(thisvector)
// 	}

// 	let result = []
// 	for(let i=0;i<newPoints.length;i++){
// 		let thispro=[]
// 		for(let k=0;k<2;k++){
// 			let value = 0;
// 			for(let n=0;n<TCvector.length;n++){
// 				value += Cvector[k][n]*newPoints[i][n]
// 			}
// 			thispro.push(value)
// 		}
// 		result.push(thispro)
// 	}
// 	return result
// }

// console.log(pca.predict(newPoints)); // project new points into the PCA space



// let data = {
//     reqType: "queryDb",
//     operate: "select",
//     column: "*",
//     table: "site",
//     limit: `where id >= 0 and id <= 28746`, //  all stations in 温州
//   };

// getdata(data).then(d=>{
// 	console.log("a",d)
// })


// function getdata(data){
// 	 return new Promise((resolve, reject) => {
// 	    $.ajax({
// 	      dataType: "json",
// 	      url: "http://localhost:3000/",
// 	      type: "POST",
// 	      data: data,
// 	      success: resolve,
// 	    });
//   	});
// }


// let p=[[0,0],
// [10,0],
// [10,15],
// [20,15],
// [20,0],
// [30,0],
// [30,20],
// [0,20],[0,0]
// ]

// console.log(L.bounds(p))
// console.log(L.bounds(p).getSize())

// console.log(L.bounds(p).getBottomRight())
// console.log(L.bounds(p).getCenter())
// console.log(L.latLngBounds(p).getCenter())
// var latlngs  = [[0,0],
// [10,0],
// [10,15],
// [20,15],
// [20,0],
// [30,0],
// [30,20],
// [0,20],
// [0,0]
// ];

// console.log( L.bounds(p).intersects( L.bounds([[0,0],[10,0]])    ))

// console.log(L.bounds(p).contains([15,5]))
// console.log(L.bounds(p).intersects(L.bounds(p)))
// console.log(state.map.leftMap.map.distance([0,0],[0,0.0004]))

// console.log(L.polygon(latlngs, {color: 'red'}).addTo(state.map.leftMap.map).getCenter())




// var turf = require('turf');
// // var geojsonArea = require('geojson-area');

// var poly1 = {
// "type": "Feature",
//   "geometry": {
//     "type": "Polygon",
//     "coordinates": [[
//       	[0,0],
// 		[30,0],
// 		[30,30],
// 		[0,30],
// 		[0,0]
//     ]]
//   }
// }
// var poly2 = {
// "type": "Feature",
//   "geometry": {
//     "type": "Polygon",
//     "coordinates": [[
//      	[20,30],
// 		[40,30],
// 		[40,40],
// 		[30,40],
// 		[20,30]
//     ]]
//   }
// }

// console.log(turf.intersect(poly1, poly2))