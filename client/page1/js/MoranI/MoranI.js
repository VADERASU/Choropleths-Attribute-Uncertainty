let map = require("../Map/MapManager.js");
let state = require("../state.js");

let MI={
	adjnum : state.moranIAdjN,
	get_GMoranI:function(clusterdata){
		let dataset = []
		for(let i=0;i<clusterdata.length;i++){
			for(let m=0;m<clusterdata[i].length;m++){
				dataset[clusterdata[i][m]] = CreateVector(clusterdata.length, i)
			}
		}
		let Mean = CalcMean(dataset)

		let result = 0
		let something = 0
		let Wsum = 0
		for(let i=0;i<dataset.length;i++){
			something+=multiV(minusV(dataset[i],Mean),minusV(dataset[i],Mean))
			for(let j=0;j<dataset.length;j++){
				if(i!=j&&state.data.adjList.get(i).has(j)){
					result += state.data.adjList.get(i).get(j)/state.data.adjList.get(i).get(i)*
						multiV(minusV(dataset[i],Mean),minusV(dataset[j],Mean))
					Wsum += state.data.adjList.get(i).get(j)/state.data.adjList.get(i).get(i)
				}
			}
		}
		// console.log(result/something)
		return result*dataset.length/(Wsum*something)
	},
	CalcLMI:function(clusterdata,reflect){
		// console.log(clusterdata)
		let dataset = []

		if(reflect!=undefined){
			for(let i=0;i<clusterdata.length;i++){
				for(let m=0;m<clusterdata[i].length;m++){
					dataset[clusterdata[i][m]] = CreateVector(clusterdata.length, reflect.indexOf(i))
				}
			}
		}else{
			for(let i=0;i<clusterdata.length;i++){
				for(let m=0;m<clusterdata[i].length;m++){
					dataset[clusterdata[i][m]] = CreateVector(clusterdata.length, i)
				}
			}
		}
		let MeanV = CalcMean(dataset)

		let MIset = []
		for(i=0;i<dataset.length;i++){
			MIset.push(CalcByi(i,2,MeanV,dataset))
		}
		// console.log(MIset)
		return MIset
	},
	setslide:function(MI,clusterdata){
		// console.log(MI)
		state.data.LMI = $.extend(true, [], MI);
	    $( "#thisismorani" ).slider({
	      range: true,
	      min: Math.min(...state.data.LMI),
	      max: Math.max(...state.data.LMI),
	      step:0.1,
	      values: [ Math.min(...state.data.LMI),Math.max(...state.data.LMI) ],
	      slide: function( event, ui ) {
	        $( "#amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
	        MIH(ui.values[ 0 ],ui.values[ 1 ],clusterdata, MI.adjnum)
	      }
	    });
		 $( "#amount" ).val( $( "#thisismorani" ).slider( "values", 0 ) +
		    " - " + $( "#thisismorani" ).slider( "values", 1 ) );
	}
	//, Optim:function(id, clusterdata){
	// 	let dataset = []
	// 	for(let i=0;i<clusterdata.length;i++){
	// 		for(let m=0;m<clusterdata[i].length;m++){
	// 			dataset[clusterdata[i][m]] = CreateVector(clusterdata.length, i)
	// 		}
	// 	}
	// 	let MI = []
	// 	for(i=0;i<clusterdata.length;i++){
	// 		dataset[id] = CreateVector(clusterdata.length, i)
	// 		let MeanV = CalcMean(dataset)
	// 		MI.push (CalcByi(id,2,MeanV,dataset))
	// 	}
	// 	return MI.indexOf(Math.max(...MI))
	// }
}

function MIH(min,max,clusterdata){
	if(state.data.LMI!=undefined){
		for(let i=0;i<state.data.LMI.length;i++){
			if(state.data.LMI[i]>min&&state.data.LMI[i]<max){
				map.highlightregion(i)
				// let maxMoranG = MI.Optim(i,clusterdata,MI.adjnum)
				// CalcNeedtochange(i,maxMoranG,clusterdata)
			}
			else
				map.unhighlightregion(i)
		}
	}
}

// function CalcNeedtochange(id,maxMoranG,clusterdata){
// 	let thisG = null
// 	for(let i=0;i<clusterdata.length;i++){
// 		if(clusterdata[i].indexOf(id)!=-1)
// 			thisG=i
// 	}
// 	let thiscenter =[]
// 	let maxMoranGcenter =[]
// 	for(let i=0;i<state.data.stacenters[thisG].length;i++){
// 		thiscenter.push( state.data.stacenters[thisG][i]*state.data.normalizevector[i].max)
// 		maxMoranGcenter.push( state.data.stacenters[maxMoranG][i]*state.data.normalizevector[i].max)
// 	}
// }

function CreateVector(length,lebal){
	let a=[]
	for(let i=0;i<length;i++){
		if(i==lebal)
			a.push(1)
		
		else
			a.push(0)
	}
	return a;
}
function CalcMean(vectors){
	let result=null;
	for (let i=0;i<vectors.length;i++){
		if(result==null)
			result = $.extend(true, [], vectors[i])
		else{
			for(let m=0;m<vectors[i].length;m++){
				result[m]+=vectors[i][m]
			}
		}
	}
	for(let m=0;m<result.length;m++){
		result[m] = result[m]/vectors.length
	}
	return result
}

function CalcByi(id,adjnum,Mean1,dataset){
	let result=0;
	// let list = getadjlist(adjnum, 1, new Map(), [id])
	let list = get_bound_weight(id)

	let thisvectors = []
	list.forEach( (weight,thisid)=>{
	 	thisvectors.push(dataset[thisid])
	})
	let Mean = CalcMean(dataset)

	// console.log(list)
	list.forEach( (weight,thisid)=>{
		result = plusV(result, VmultiN(weight,minusV(dataset[id],Mean)))
	})
	result = multiV( result,minusV(dataset[id],Mean))


	//something start
	let something = 0 
	state.map.geojson.features.forEach( (ob, i)=>{
		if ( i != id){
			let minusVector = minusV(dataset[i],Mean)
			something += multiV(minusVector, minusVector)
		}
	})
	something = something / (state.map.geojson.features.length-1)
	result = result / something
	//something end
  

	//weight norm
	let weightsum=0
	list.forEach( (weight,thisid)=>{
		weightsum += weight
	})
	result = result / weightsum

	if(weightsum==0)
		return 0


	return result
}

function get_bound_weight(id){

	let thisid = state.map.geojson.features[id].id

	let result =new Map()
	let thisvector = state.data.adjList.get(thisid)

	thisvector.forEach((d,i)=>{
		if(i!=thisid)
		result.set(i, thisvector.get(i)/thisvector.get(thisid))
	})
	// if(result.size<1)
	// 	console.log(thisid,id)

	return result
}

function getadjlist(adjnum, weight,result, ids){
	if (adjnum==1){
		ids.forEach(id=>{
			for(let i=0;i<state.data.adjList[id].length;i++){
				if(!result.has(state.data.adjList[id][i])) {
					result.set(state.data.adjList[id][i],weight)
				}
			}
		})
	}else{
		ids.forEach(id=>{
			for(let i=0;i<state.data.adjList[id].length;i++){
				if(!result.has(state.data.adjList[id][i])) {
					result.set(state.data.adjList[id][i],weight)
				}
			}
			getadjlist(adjnum-1, weight/2,result, state.data.adjList[id])
		})
	}
	return result
}
function VmultiN(n,v){
	let result = $.extend(true, [], v)
	for(let i=0 ; i < result.length;i++){
		result[i]*=n
	}
	return result
}

function multiV(v1,v2){
	let result = 0;
	for(let i=0;i<v1.length;i++){
		result += v1[i]* v2[i]
	}
	return result
}
function minusV(v1,v2){
	let result = $.extend(true, [], v1)
	for(let i=0 ; i < result.length;i++){
		result[i] = result[i]-v2[i]*1
	}
	return result
}
function plusV(v1,v2){
	if(v1==0){
		return v2;
	}
	let result = $.extend(true, [], v1)
	for(let i=0 ; i < result.length;i++){
		result[i] = result[i]+v2[i]*1
	}
	return result;
}



module.exports = MI