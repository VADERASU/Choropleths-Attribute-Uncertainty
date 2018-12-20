let map = require("../Map/MapManager.js");
let state = require("../state.js");
let GOGi={
	CalcLGOGi:function(clusterdata, adjnum){
		let dataset = []
		for(let i=0;i<clusterdata.length;i++){
			for(let m=0;m<clusterdata[i].length;m++){
				dataset[clusterdata[i][m]] = CreateVector(clusterdata.length, i)
			}
		}
		// console.log(dataset)

		let GOGiset = []
		for(i=0;i<dataset.length;i++){
			GOGiset.push(CalcByi(i,1,dataset))
		}
		// console.log(GOGiset)
		state.data.GOGiset=GOGiset

	    $( "#thisisGetis" ).slider({
	      range: true,
	      min: -1,
	      max: 1,
	      step:0.01,
	      values: [ -2,2 ],
	      slide: function( event, ui ) {
	        $( "#Getisamount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
	        GOGisetH(ui.values[ 0 ],ui.values[ 1 ])
	      }
	    });
		    // $( "#amount" ).val( $( "#thisismorani" ).slider( "values", 0 ) +
		    //   " - " + $( "#thisismorani" ).slider( "values", 1 ) );
	}
}
function GOGisetH(min,max){
	if(state.data.GOGiset!=undefined){
		for(let i=0;i<state.data.GOGiset.length;i++){
			if(state.data.GOGiset[i][0]>min&&state.data.GOGiset[i][0]<max)
				map.highlightregion(i)
			else
				map.unhighlightregion(i)
		}
	}
}

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

function CalcByi(id,adjnum,dataset){
	let list = getadjlist(adjnum, 1, new Map(), [id],dataset.length)
	// console.log(list)
			
	let MeanV = CalcMean(dataset,list)
	// console.log(MeanV)

	let thisS = CalcS(dataset,list,MeanV)

	let Weightsum = 0,
	    thisvectors = null
	list.forEach((ob,id)=>{
		Weightsum += ob
		if(thisvectors==null)
			thisvectors = VmultiN(ob,dataset[id])
		else
			thisvectors = plusV( VmultiN(ob,dataset[id]),thisvectors)
	})

	thisvectors = minusV(thisvectors,VmultiN(Weightsum,MeanV))


	for(let i=0;i<thisvectors.length;i++){
		thisvectors[i] = thisvectors[i]/thisS
	}

	// console.log(thisvectors,thisS)
	return thisvectors
}

function CalcS(vectors,list,mean){
	let result=0
	list.forEach((ob,id)=>{
		result += multiV(vectors[id],vectors[id])
	})
	result = Math.sqrt(result / list.size - multiV(mean,mean))
	let Weight = 0,
		Weight2 = 0;
	list.forEach((ob,id)=>{
		Weight += ob
		Weight2 += ob*ob
	})
	result = result * Math.sqrt((list.size*Weight2-Weight*Weight)/(list.size-1))

	if(result==0)
		result = 0.00001
	return result
}


function CalcMean(vectors,list){
	let result=null;
	list.forEach((ob,id)=>{
		if(result==null)
			result = $.extend(true, [], vectors[id])
		else
			result = plusV(result,vectors[id])
	})
	for(let m=0;m<result.length;m++){
		result[m] = result[m]/list.size
	}
	return result
}

function getadjlist(adjnum, weight,result, ids, totalsize){
	if (adjnum==1){
		let thisids=[]
		ids.forEach(id=>{
			for(let i=0;i<state.data.adjList[id].length;i++){
				if(!result.has(state.data.adjList[id][i])) {
					if(weight<0.04)
						result.set(state.data.adjList[id][i],0)
					else
						result.set(state.data.adjList[id][i],weight)
					thisids.push(state.data.adjList[id][i])
				}
			}
		})
		if(result.size != totalsize){
			getadjlist(1, weight/5, result, thisids, totalsize)
		}
	}else{
		ids.forEach(id=>{
			for(let i=0;i<state.data.adjList[id].length;i++){
				if(!result.has(state.data.adjList[id][i])) {
					if(weight<0.04)
						result.set(state.data.adjList[id][i],0)
					else
						result.set(state.data.adjList[id][i],weight)
				}
			}
			getadjlist(adjnum-1, weight/5,result, state.data.adjList[id],totalsize)
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
		return $.extend(true, [], v2);
	}
	let result = $.extend(true, [], v1)
	for(let i=0 ; i < result.length;i++){
		result[i] = result[i]+v2[i]*1
	}
	return result;
}



module.exports = GOGi