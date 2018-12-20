const state = require("./state.js");
const map = require("./Map/MapManager.js");
const MA = require("./Math/mathmatic.js");

let crimeattrname = ["DISTURBANCES", "DRUNKNESS", "BURGLARY", "THEFT", "domestic_disturbances", "NOISE", "ROBBERY", "BATTERY"]
let Ccrimeattrname = ["ARSON", "ASSAULT", "BATTERY", "BURGLARY", "THEFT", "STALKING", "SEX OFFENSE", "ROBBERY","KIDNAPPING","INTIMIDATION", "Attribute1", "Attribute2"]
let affricaattrname = ["Battle-No change of territory",
	"Violence against civilians", "Strategic development",
	"Battle-Government regains territory", "Remote violence",
	"Riots/Protests", "Non-violent transfer of territory",
	"Headquarters or base established", "Battle-Non-state actor overtakes territory"
]
let electionname = ["POP645213", "EDU635213", "EDU685213", "LFE305213","HSG495213","diff_2012","INC110213","PVY020213","SEX255214"]
let statename = ["CA", "UT", "NV", "AZ"]

const filemanager = {
	init: function() {
		$('#openfilebutton1').click(function() {
			// filemanager.fileOpen('./cb_2016_18_bg_500k.zip')
			filemanager.fileOpen('./CommAreasNew.zip')
		});
		$('#openfilebutton2').click(function() {
			filemanager.fileOpen('./NGA_adm_shp.zip')
		});
		$('#openfilebutton3').click(function() {
			filemanager.fileOpen('./tl_2017_us_county.zip')
		});

		d3.select("#parameterOption").on("click", function() {
			if (d3.select("#mod").style("top") != "50px") {
				d3.select("#parameterOption").classed("normal", false)
				d3.select("#mod").style("top", "50px")
			} else {
				d3.select("#parameterOption").classed("normal", true)
				d3.select("#mod").style("top", "-480px")
			}
		})

	},
	fileOpen: function(file) {
		console.log("---------------Open start---------------")
		// If map layer already exists remove the layer and clear the scatter plot
		map.clearComparisonMaps()
		state.scat.drawn = false;
		state.selectedList = [];

		//set Map center and zoom level
		if (file.indexOf('cb_2016_18_bg_500k') > -1) {
			state.map.leftMap.getMap().setView([40.4, -86.9]);
			state.map.leftMap.getMap().setZoom(10);
		}
		if (file.indexOf('CommAreasNew') > -1) {
			state.map.leftMap.getMap().setView([41.8781, -87.6298]);
			state.map.leftMap.getMap().setZoom(11);
		}
		if (file.indexOf('NGA_adm_shp') > -1) {
			state.map.leftMap.getMap().setView([9, 8]);
			state.map.leftMap.getMap().setZoom(6);
		}
		if (file.indexOf('tl_2017_us_county') > -1) {
			state.map.leftMap.getMap().setView([39.5296, -119.8138]);
			state.map.leftMap.getMap().setZoom(5);
		}
		state.map.rightMap.getMap().setView(state.map.leftMap.getMap().getCenter());
		state.map.rightMap.getMap().setZoom(state.map.leftMap.getMap().getZoom());

		filemanager.readShapeFile(file, state)
	},
	readShapeFile: function(file, state) {
		//get shape file
		shp(file).then(function(geojson) {
			let newfeature = new Array()
			let eventdata = []
			if (file.indexOf('CommAreasNew') > -1) {
				console.log(geojson)
				state.eventattrname = Ccrimeattrname
				for (let ob of geojson.features) {
						ob.properties={}
					// if (MA.IsInArea(ob.geometry.bbox, [-87.086, 40.233, -86.695, 40.60])) {
						ob.properties.AREA_NUMBE = newfeature.length
						for (prop of Ccrimeattrname) {
							ob.properties[prop] = 0;
						}
						ob.properties.sum = 0;
						ob.properties.crimelist = [];
						ob.properties.bounds = L.bounds(ob.geometry.coordinates[0])
						newfeature.push(ob)
					// }
				}
				geojson.features = newfeature

				// read eventdata
				d3.text("./Ccrimeeventdata.txt").then(result=>{
						let Event = result.split("\n")
						let features=[]
						Event.forEach(thisrecord=>{
							thisrecord= thisrecord.split(";")
							let thisfeature = geojson.features[thisrecord[0].split(",")[1]*1]
							for(let j = 1;j<thisrecord.length-1;j++){
								thisrecord[j]= thisrecord[j].split(",")
								thisfeature.properties[thisrecord[j][0]] = thisrecord[j][1]*1
							}
							thisfeature.id = thisrecord[0].split(",")[1]*1
							thisfeature.properties["Attribute1"] = 0
							features.push(thisfeature)
						})

						geojson.features = features
						state.map.geojson = geojson;
						polygonAdjList()
						creatAttrlist(Ccrimeattrname)
						d3.select("#filename").text('Crime Data').append("b").classed("caret", true)


						let generate_data = require("./generate_data/get_kmeans_normal_data.js");
						generate_data.init()
					})
				// //write eventdata
				// d3.csv("./CCrimes_2015.csv").then(data => {
				// 		// // console.log(data)
				// 		process_event(data, geojson, "Primary Type")
				// 		let string =""
				// 		geojson.features.forEach((region,id)=>{
				// 			string += "id,"+id+";"
				// 			Ccrimeattrname.forEach(attrname=>{
				// 				string += attrname+","+region.properties[attrname]+";"
				// 			})
				// 			string += "\n\r"
				// 		})
				//  		writeeventdata({
				// 		    reqType: "writeevent",
				// 		    data: string
				// 		  })
				// });
			}if (file.indexOf('cb_2016_18_bg_500k') > -1) {
				state.eventattrname = crimeattrname
				for (let ob of geojson.features) {
					if (MA.IsInArea(ob.geometry.bbox, [-87.086, 40.233, -86.695, 40.60])) {
						ob.properties.AREA_NUMBE = newfeature.length
						for (prop of crimeattrname) {
							ob.properties[prop] = 0;
						}
						ob.properties.sum = 0;
						ob.properties.crimelist = [];
						ob.properties.bounds = L.bounds(ob.geometry.coordinates[0])
						newfeature.push(ob)
					}
				}
				geojson.features = newfeature
				//read eventdata
				d3.csv("./purdue_events.csv").then(data => {
					process_event(data, geojson, "category")
					state.map.geojson = geojson;
					creatAttrlist(crimeattrname)
					polygonAdjList()

					state.map.geojson.features.forEach((o,i)=>{
						o.id = i
					})
					d3.select("#filename").text('Crime Data').append("b").classed("caret", true)
				});
			}
			if (file.indexOf('tl_2017_us_county') > -1) {
				let shpmap = new Map()
				shp('./tl_2017_us_county.zip').then(function(geojson) {
					for (let ob of geojson.features) {
						if (!shpmap.has(ob.properties.COUNTYFP + "," + ob.properties.COUNTYNS)) {
							shpmap.set(ob.properties.COUNTYFP + "," + ob.properties.COUNTYNS, ob)
						}
					}
					shp('./election.zip').then(function(geojson2) {
						for (let ob of geojson2.features) {
							if (!shpmap.has(ob.properties.COUNTYFP + "," + ob.properties.COUNTYNS)) {
								console.log("ssss")
							} else {
								shpmap.get(ob.properties.COUNTYFP + "," + ob.properties.COUNTYNS).properties = ob.properties
							}
						}
						geojson2.features = [...shpmap.values()]


						state.eventattrname = electionname
						for (let ob of geojson2.features) {
							// if(MA.IsInArea(ob.geometry.bbox,[-123,32.0639555947,-110.0957031250,42.7540979797])){
							if(statename.indexOf(ob.properties.state_abbr)!=-1){
								ob.properties.AREA_NUMBE = newfeature.length
								if(ob.geometry.coordinates.length>1){
									ob.properties.bounds = L.bounds(ob.geometry.coordinates[0][0])
								}else{
									ob.properties.bounds = L.bounds(ob.geometry.coordinates[0])
								}
								ob.id = ob.properties.COUNTYFP+ ","+ ob.properties.COUNTYNS
								newfeature.push(ob)
							}
						}
						geojson2.features = newfeature
						state.map.geojson = geojson2;

						// state.map.geojson.features.forEach(o=>{
						// 	console.log(o.properties.bounds,o.properties.bounds.getCenter(),o.geometry.coordinates)
						// })
				
						// console.log(state)

						creatAttrlist(electionname)

							d3.text("./regionrelation.txt").then(result=>{
								let relationR = result.split("\n")
								relationR.forEach(o=>{
									o = o.split(";")
								})
								for(let i =0;i< relationR.length;i++){
									relationR[i] = relationR[i].split(";")
								}
								for(let i =0;i< relationR.length;i++){
									let thisMap = new Map()
									for(let j =1;j< relationR[i].length;j++){
										let string = relationR[i][j].split(",")
										if(string[1] !=undefined){
											thisMap.set(string[0]+","+string[1],string[2]*1)
										}
									}
									relationR[i] = {id:relationR[i][0], distance:thisMap}
								}

								state.data.adjList = new Map()

								relationR.forEach(o=>{
									state.data.adjList.set(o.id,o.distance)
								}) 
								// console.log(state.data.adjList)
							})
						// polygonAdjListw()
						d3.select("#filename").text('election').append("b").classed("caret", true)

					})
				})

			}
			if (file.indexOf('NGA_adm_shp') > -1) {
				state.eventattrname = crimeattrname
				geojson = geojson[1]

				d3.csv("./1900-01-01-2018-02-05.csv").then(data => {
					let timeC = new Date("2015-01-01")
					data.forEach(o => {
						if (o.country == "Nigeria" && timeC < new Date(o.event_date)) {
							eventdata.push(o)
						}
					})

					for (let ob of geojson.features) {
						ob.properties.AREA_NUMBE = newfeature.length
						for (prop of affricaattrname) {
							ob.properties[prop] = 0;
						}
						ob.properties.sum = 0;
						ob.properties.crimelist = [];
						ob.properties.bounds = L.bounds(ob.geometry.coordinates[0])
						newfeature.push(ob)
					}
					geojson.features = newfeature
					// preprocess
					process_event(eventdata, geojson, "event_type")
					state.map.geojson = geojson;
					creatAttrlist(affricaattrname)
					// console.log("aaadfdfaa")
					polygonAdjList()

					state.map.geojson.features.forEach((o,i)=>{
						o.id = i
					})
					d3.select("#filename").text('Nigeria Event Data').append("b").classed("caret", true)
				})
			}
		});
	}
}



function write(data) {
	return new Promise((resolve, reject) => {
		$.ajax({
			dataType: "json",
			url: "http://localhost:8000/",
			type: "POST",
			data: data,
			success: resolve,
		});
	});
}

function creatAttrlist(attrname) {
	// Empty the feature list and recreate it from geojson properties
	d3.select("#DASelectContainer").selectAll("div").remove()
	attrname.forEach((o, i) => {
		if (i < 3) {
			d3.select("#DASelectContainer").append("div")
				.text(o).classed("selected", true)
				.on("click", function() {
					d3.select(this).classed("selected", !d3.select(this).classed("selected"))
				})
		} else {
			d3.select("#DASelectContainer").append("div")
				.text(o).on("click", function() {
					d3.select(this).classed("selected", !d3.select(this).classed("selected"))
				})
		}
	})
}

function process_event(eventdata, geojson, typename) {
	// console.log(eventdata,geojson)
	// eventdata = eventdata.slice(0,10000)
	l:for (let crime of eventdata) {
		if (crime.longitude == undefined || crime.latitude == undefined||state.eventattrname.indexOf(crime[typename])==-1) {
			continue
		}
		k:for (let area of geojson.features) {
			if (MA.IsPointInArea([crime.longitude, crime.latitude], area.geometry.bbox)) {
				// if(isMarkerInsidePolygon([crime.longitude,crime.latitude], area.properties.coordinates)){
				if (MA.isMarkerInsidePolygon([crime.longitude, crime.latitude], area.geometry.coordinates[0])) {
					area.properties.sum++
						area.properties.crimelist.push(crime)
					if (area.properties[crime[typename]] == undefined)
						area.properties[crime[typename]] = 0;
					area.properties[crime[typename]]++
					break k;
				}
			}
		}
	}
	// ensure not exist nonevent spatial unit
	let NoeEmptyGF = []
	for (let area of geojson.features) {
		if (area.properties.sum != 0) {
			NoeEmptyGF.push(area)
		}
	}
	geojson.features = NoeEmptyGF
}


function writeeventdata(data){
	 return new Promise((resolve, reject) => {
	    $.ajax({
	      dataType: "json",
	      url: "http://localhost:8000/",
	      type: "POST",
	      data: data,
	      success: resolve,
	    });
  	});
}


function polygonAdjList() {
	let data = state.map.geojson.features
	state.data.adjList = new Map()

	for (let i = 0; i < data.length; i++) {
		let rowresult3 = new Map;
		for (let j = 0; j < data.length; j++) {
			let distance = getdistance(data[i], data[j])

			if (distance == 0){
				let overlayD = get_overlay_Distance(data[i], data[j])
				rowresult3.set(j,overlayD)
			}
		}
		state.data.adjList.set(i, rowresult3)
	}
}
// function polygonAdjList() {
// 	let data = state.map.geojson.features
// 	// state.data.PolygonAdjList = []
// 	state.data.adjList = []
// 	state.data.Geodistance = []
// 	state.data.boundDistance = new Map()

// 	for (let i = 0; i < data.length; i++) {
// 		// let rowresult1 = [];
// 		let rowresult2 = [];
// 		let rowresult3 = new Map;
// 		let thisboundlength = getboundLength(data[i])
// 		for (let j = 0; j < data.length; j++) {
// 			let distance = getdistance(data[i], data[j])
// 			let overlayD = get_overlay_Distance(data[i], data[j])

// 			// rowresult1.push(distance)
// 			if (distance == 0){
// 				 if(i != j){
// 					rowresult2.push(j)
// 				 }
// 				let overlayD = get_overlay_Distance(data[i], data[j])
// 				rowresult3.set(j,overlayD)
// 			}
// 			// rowresult3.push(get_centerdis(data[i],data[j]))
// 		}
// 		// state.data.PolygonAdjList.push(rowresult1)
// 		state.data.adjList.push(rowresult2)
// 		state.data.boundDistance.set(i,rowresult3)
// 		// state.data.Geodistance.push(rowresult3)
// 	}
// 	// console.log(state.data.boundDistance)
// 	// console.log(state.data.PolygonAdjList,	state.data.adjList)
// }

function polygonAdjListw() {
	let data = state.map.geojson.features

	for (let i = 0; i < data.length; i++) {
		console.log(i)
		let rowresult = "";
		for (let j = 0; j < data.length; j++) {
			let distance = getdistance(data[i], data[j])
			if (distance == 0) {
				rowresult += `${data[j].properties.COUNTYFP},${data[j].properties.COUNTYNS},${get_overlay_Distance(data[i],data[j])};`
			}
		}
		let string = `${data[i].properties.COUNTYFP},${data[i].properties.COUNTYNS};${rowresult}\r\n`
		write({
			reqType: "write",
			data: string
		})
	}
}


function get_overlay_Distance(polygon1, polygon2) {
	//find overlay
	let result = []
	for (let point1 of polygon1.geometry.coordinates[0]) {
		l: for (let point2 of polygon2.geometry.coordinates[0]) {
			if (point1[0] == point2[0] && point1[1] == point2[1]) {
				result.push(point1)
				break l;
			}
		}
	}
	let segement = []
	if (result.length != 0) {
		//find segement
		let thisseg = []
		for (let point1 of polygon1.geometry.coordinates[0]) {
			let isexist = false
			l: for (let point2 of result) {
				if (point1[0] == point2[0] && point1[1] == point2[1]) {
					isexist = true
					thisseg.push(point1)
					break l;
				}
			}
			if (!isexist) {
				if (thisseg.length != 0) {
					segement.push($.extend(true, [], thisseg))
					thisseg = []
				}
			}
		}
		if (thisseg.length != 0) {
			segement.push(thisseg)
		}
	}
	let distance = 0;
	segement.forEach(polyline => {
		if (polyline.length > 1) {
			for (let i = 1; i < polyline.length; i++) {
				distance += state.map.leftMap.map.distance(
					[polyline[i - 1][0], polyline[i - 1][1]], [polyline[i][0], polyline[i][1]])
			}
		}
	})

	return distance
}

function getboundLength(polygon1) {
	let distance = 0;
	let polyline = polygon1.geometry.coordinates[0]
	if (polyline.length > 1) {
		for (let i = 1; i < polyline.length; i++) {
			distance += state.map.leftMap.map.distance(
				[polyline[i - 1][0], polyline[i - 1][1]], [polyline[i][0], polyline[i][1]])
		}
	}
	return distance
}


function get_centerdis(polygon1, polygon2) {
	return state.map.leftMap.map.distance(
		[polygon1.properties.bounds.getCenter().x,
			polygon1.properties.bounds.getCenter().y
		], [polygon2.properties.bounds.getCenter().x,
			polygon2.properties.bounds.getCenter().y
		])
}

function getdistance(polygon1, polygon2) {
	let mindis = Infinity
	if (polygon1.properties.bounds.intersects(polygon2.properties.bounds)) {
		for (let point1 of polygon1.geometry.coordinates[0]) {
			// let bound1 = polygon1
			for (let point2 of polygon2.geometry.coordinates[0]) {
				let dis = (point1[0] - point2[0]) * (point1[0] - point2[0]) +
					(point1[1] - point2[1]) * (point1[1] - point2[1])
				if (mindis > dis)
					mindis = dis
			}
		}
	} else {
		let x = [polygon1.properties.bounds.getBottomLeft(),
			polygon1.properties.bounds.getTopRight(),
			polygon1.properties.bounds.getTopLeft(),
			polygon1.properties.bounds.getBottomRight()
		]
		let y = [polygon2.properties.bounds.getBottomLeft(),
			polygon2.properties.bounds.getTopRight(),
			polygon2.properties.bounds.getTopLeft(),
			polygon2.properties.bounds.getBottomRight()
		]
		for (let point1 of x) {
			// let bound1 = polygon1
			for (let point2 of y) {
				let dis = (point1.x - point2.x) * (point1.x - point2.x) +
					(point1.y - point2.y) * (point1.y - point2.y)
				if (mindis > dis)
					mindis = dis
			}
		}
	}
	mindis = Math.sqrt(mindis)
	return mindis
}

function Intersect(bb1, bb2) {
	return !(bb2[0] > bb1[2] ||
		bb2[2] < bb1[0] ||
		bb2[1] > bb1[3] ||
		bb2[3] < bb1[1]);
}

module.exports = filemanager