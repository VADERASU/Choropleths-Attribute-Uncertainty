
var fs = require('fs'),
path = require('path');


fs.readFile(__dirname + '/test.txt', {flag: 'r+', encoding: 'utf8'}, function (err, data) {
    if(err) {
     console.error(err);
     return;
    }
    console.log(data);
});

var shapefile = require("shapefile");
 let allshape = []
shapefile.open(__dirname+"/tl_2017_us_county.shp")
  .then(source => source.read()
    .then(function log(result) {
      if (result.done) {
      	console.log(allshape.length)

      	Allwritefile(allshape)
      	return 
      };
      allshape.push(result.value)
      return source.read().then(log);
    }))
  .catch(error => console.error(error.stack));

let d3 =  require("d3");

function Allwritefile(allshape){
	let count = 0 


	var w_data = ""

		var xValue = function(d) {return d[0];}
		var yValue = function(d) {return d[1];}

	for(let i =0;i<allshape.length;i++){
		if(i>=3000&&i<4000){
			if(i%100==0){
				console.log(i)
			}
			let thisshape = allshape[i]
			thisshape.bbox = [
			d3.min(thisshape.geometry.coordinates[0], xValue),
			d3.min(thisshape.geometry.coordinates[0], yValue),
			d3.max(thisshape.geometry.coordinates[0], xValue),
			d3.max(thisshape.geometry.coordinates[0], yValue)]
			w_data = w_data + thisshape.properties.COUNTYFP+","+thisshape.properties.COUNTYNS+";"
			for(let j =0 ; j <thisshape.bbox.length;j++){
				j==thisshape.bbox.length-1? w_data = w_data+thisshape.bbox[j] : w_data = w_data+thisshape.bbox[j]+","
			}
			w_data = w_data +";"
			for(let j =0 ; j <thisshape.geometry.coordinates[0].length;j++){
				if(j==thisshape.geometry.coordinates[0].length-1){
					w_data = w_data + thisshape.geometry.coordinates[0][j][0]+"A"+thisshape.geometry.coordinates[0][j][1]
				}
				else{
					w_data = w_data + thisshape.geometry.coordinates[0][j][0]+"A"+thisshape.geometry.coordinates[0][j][1]+","
				}
			}
			w_data = w_data+"\r\n"
		}

	}
    console.log(allshape.length);
	var w_data = new Buffer(w_data);

	fs.writeFile(__dirname + '/test1.txt', w_data, {flag: 'a'}, function (err) {
	   if(err) {
	    console.error(err);
	    } else {
	       console.log('end');
	    }
	});
}


function polygonAdjList(){
	let data = features
	let PolygonAdjList =[],
		adjList=[],
		Geodistance=[],
		boundDistance=[]

	// for(let i = 0; i < data.length ; i++){
	// 	let rowresult1=[];
	// 	let rowresult2=[];
	// 	let rowresult3=[];
	// 	let thisboundlength = getboundLength(data[i])
	// 	for(let j = 0; j < data.length ; j++){
	// 		let distance = getdistance(data[i],data[j])
	// 		let overlayD = get_overlay_Distance(data[i],data[j])

	// 		rowresult1.push(distance)
	// 		if(distance == 0 && i!=j) 
	// 			rowresult2.push(j)
	// 		// rowresult3.push(get_centerdis(data[i],data[j]))
	// 		rowresult3.push(overlayD)
	// 	}
	// 	PolygonAdjList .push(rowresult1)
	// 	adjList .push(rowresult2)
	// 	boundDistance.push(rowresult3)
	// 	// Geodistance.push(rowresult3)
	// }
	// console.log(boundDistance)
	// console.log(PolygonAdjList,	adjList)
}