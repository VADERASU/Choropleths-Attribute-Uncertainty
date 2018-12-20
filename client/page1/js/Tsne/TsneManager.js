let tsnejs = require("./tsne.js");
let state = require("../state.js");
let DM = require("../DataManager.js");
let SP = require("../ScatterPlot.js");
let TDSP = require("../chart/3dScatterPlot.js");


const TM = {
	RuntSNE : function(vectors) {
		//add clustering center to get tsne
		let vectorsnumber=vectors.length*1
		vectors = vectors.concat(state.data.stacenters)


		let vectors025 = []
		if(vectors[0].length==6){
			for(let ob of vectors){
				vectors025.push([ob[0],ob[2],ob[5]])
			}
			vectors = vectors025
		}


		getnew_tsnesolution({
			    reqType: "tsne",
		    	matrixProjection:false,
			    vectors: vectors,
			    dimension: 2,
		    	isnew:true,
			    run:5,
			    kmeans:state.data.kmeans,
		    	vectorsnumber:vectorsnumber
			  }).then(d=>{
			  	// console.log(d)
		  		state.tsnemachine.Two = d
				//scat
				if($('#projectiondimention').prop('checked')){
					SP.ScatterPlot(d,state.data.kmeans);
					state.scat.drawn = true;
				}
		})

		time = (new Date()).getTime()
		getnew_tsnesolution({
		    reqType: "tsne",
		    matrixProjection:false,
		    isnew:true,
		    vectors: vectors,
		    dimension: 3,
		    run:1,
			kmeans:state.data.kmeans,
		    vectorsnumber:vectorsnumber
		  }).then(d=>{
		  	state.tsnemachine.Three = d
			//scat
			if(!$('#projectiondimention').prop('checked')){
				TDSP.ScatterPlot("divPlot",state.data.kmeans,state.tsnemachine.Three)
				state.scat.drawn = true;
			}
		})
		vectors.splice(vectorsnumber,state.data.stacenters.length+vectorsnumber)
		console.log("---------------tSNE complite---------------")
	},
	get_tsne:function(vectors){
		return getnew_tsnesolution({
		    reqType: "tsne",
		    matrixProjection:true,
		    vectors: vectors,
		    dimension: 2,
		  })
	},
	get_to_tsne_with_data: function(regionid,change,kmeans, reflect){
		let normalizedata = $.extend(true, [], state.data.vectors);

		for(let i=0;i<change.length;i++){
			normalizedata[regionid][i] += change[i]
		}
		if ($('#norm-input').prop('checked'))
			normalizedata = DM.normalize(normalizedata,state.maxmin)



		let vectors025 = []
		if(normalizedata[0].length==6){
			for(let ob of normalizedata){
				vectors025.push([ob[0],ob[2],ob[5]])
			}
			normalizedata = vectors025
		}

		TM.show_tsne_map(normalizedata,kmeans,reflect,regionid)
	},
	get_to_original_tsne:function (){
		// let normalizedata = $.extend(true, [], state.data.vectors);
		// if ($('#norm-input').prop('checked'))
		// 	normalizedata = DM.normalize(normalizedata,state.maxmin)

		
		// let vectors025 = []
		// if(normalizedata[0].length==6){
		// 	for(let ob of normalizedata){
		// 		vectors025.push([ob[0],ob[2],ob[5]])
		// 	}
		// normalizedata = vectors025
		// }

		// TM.show_tsne_map(normalizedata,state.data.kmeans)

		if ($('#projectiondimention').prop('checked')) {
			SP.ScatterPlot(state.tsnemachine.Two, state.data.kmeans);
			SP.highlightCircle()
		}else{
			TDSP.ScatterPlot("divPlot", state.data.kmeans, state.tsnemachine.Three);
		}
	},
	show_tsne_map(data,kmeans,reflect,id){
		if(reflect!=undefined){
			if ($('#projectiondimention').prop('checked')) {
				TM.stepwithdata(data, 2,state.tsnemachine.Two).then(thisproj => {
					// console.log(reflect,id)
					SP.ScatterPlot(thisproj, kmeans, reflect);
					SP.highlightCircle(id)
				})
			} else {
				TM.stepwithdata(data, 3,state.tsnemachine.Three).then(thisproj => {
					TDSP.ScatterPlot("divPlot", kmeans, thisproj, reflect);
				})
			}
		}else{
			if ($('#projectiondimention').prop('checked')) {
				TM.stepwithdata(data, 2,state.tsnemachine.Two).then(thisproj => {
					SP.ScatterPlot(thisproj, kmeans);
					SP.highlightCircle(id)
				})
			} else {
				TM.stepwithdata(data, 3,state.tsnemachine.Three).then(thisproj => {
					TDSP.ScatterPlot("divPlot", kmeans, thisproj)
				})
			}
		}
	},
	stepwithdata(vectors , dimension,Y){
		let vectorsnumber=vectors.length*1
		vectors = vectors.concat(state.data.stacenters)
		// console.log(vectors)
		return getnew_tsnesolution({
		    reqType: "tsne",
		    isnew:false,
		    vectors: vectors,
		    Y:Y,
		    dimension: dimension
		  })
	}
	// Threestepwithdata(data){
	// 	let tsne =  $.extend(true, {}, state.tsnemachine.Two);


	// 	tsne.initDataDist(data)
	// 	for (var k = 0; k < 40; k++) {
	// 		tsne.step(); // every time you call this, solution gets better
	// 	}
	// 	return tsne.getSolution()
	// }
}



function distanceto(point1,point2){
    let sum=0;
    for(let i=0;i<point1.length;i++){
        sum += (point1[i]-point2[i]) * (point1[i]-point2[i])
    }
    return sum
}

function getnew_tsnesolution(data){
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
 

module.exports = TM








		// let Twotsne=null;
		// for(let run=0;run<1;run++){
		// 	// console.log("runtsne")
		// 	// create a tSNE instance
		// 	// epsilon is learning rate (10 = default)
		// 	// roughly how many neighbors each point influences (30 = default)
		// 	// dimensionality of the embedding (2 = default)

		// 	let time = (new Date()).getTime()
		// 	let thisTwotsne = new tsnejs.tSNE({
		// 		epsilon: 30,
		// 		perplexity: 10,
		// 		dim: 2
		// 	});
		// 	thisTwotsne.initDataRaw(vectors);
		// 	for (var k = 0; k < 300; k++) {
		// 		thisTwotsne.step(); // every time you call this, solution gets better
		// 	}
		// 	let thistsneP=thisTwotsne.getSolution()

		// 	let thisdistortion=0
  //           for (let i=0;i<state.data.kmeans.length;i++){
  //               let thisdist=0
  //               for (let m=0;m<state.data.kmeans[i].length;m++){
  //                   thisdist+=distanceto(thistsneP[i+vectorsnumber], thistsneP[state.data.kmeans[i][m]])
  //               }
  //               thisdistortion+=thisdist/state.data.kmeans[i].length
  //           }
  //           if(Twotsne==null||Twotsne.distortion>thisdistortion){
  //               Twotsne={distortion:thisdistortion, tsnemachine:thisTwotsne}
  //           }
		// 	// console.log(thisdistortion,Twotsne.distortion)
		// }


		// let time = (new Date()).getTime()
		// let Threetsne = new tsnejs.tSNE({
		// 	epsilon: 10,
		// 	perplexity: 30,
		// 	dim: 3
		// });
		// Threetsne.initDataRaw(vectors);
		// for (var k = 0; k < 500; k++) {
		// 	Threetsne.step(); // every time you call this, solution gets better
		// }