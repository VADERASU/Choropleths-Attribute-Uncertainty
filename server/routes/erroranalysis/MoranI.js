
var extend = require('node.extend');

let MI={
	CalcLMI:function(req, res, next){
		let clusterdata = req.body.clusterdata
		let featureslength = req.body.featureslength
		let adjList = req.body.adjList
		let dataset = []
		for(let i=0;i<clusterdata.length;i++){
			for(let m=0;m<clusterdata[i].length;m++){
				dataset[clusterdata[i][m]] = CreateVector(clusterdata.length, i)
			}
		}
		let MeanV = CalcMean(dataset)

		let MI = []
		for(i=0;i<dataset.length;i++){
			MI.push (CalcByi(i,2,MeanV,dataset,featureslength, adjList))
		}

        let resj = JSON.stringify(MI);
        res.send(resj);
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
function CalcMean(vectors){
	let result=null;
	for (let i=0;i<vectors.length;i++){
		if(result==null)
			result = extend( [], vectors[i])
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

function CalcByi(id,adjnum,Mean,dataset,featureslength, adjList){
	let result=0;
	let list = getadjlist(adjnum, 1, new Map(), [id], adjList)
	list.forEach( (weight,thisid)=>{
		result = plusV(result, VmultiN(weight,minusV(dataset[thisid],Mean)))
	})
	result = multiV( result,minusV(dataset[id],Mean))

	//something start
	let something = 0 
	for(let i=0;i<featureslength;i++){
		if ( i != id)
			something += multiV(minusV(dataset[i],Mean), minusV(dataset[i],Mean))
	}
	something = something / (featureslength-1)
	result = result / something
	//something end

	//weight norm
	let weightsum=0
	list.forEach( (weight,thisid)=>{
		weightsum += weight
	})
	result = result / weightsum
	return result
}

function getadjlist(adjnum, weight,result, ids, adjList){
	if (adjnum==1){
		ids.forEach(id=>{
			for(let i=0;i<adjList[id].length;i++){
				if(!result.has(adjList[id][i])) {
					result.set(adjList[id][i],weight)
				}
			}
		})
	}else{
		ids.forEach(id=>{
			for(let i=0;i<adjList[id].length;i++){
				if(!result.has(adjList[id][i])) {
					result.set(adjList[id][i],weight)
				}
			}
			getadjlist(adjnum-1, weight/2,result, adjList[id], adjList)
		})
	}
	return result
}
function VmultiN(n,v){
	let result = extend( [], v)
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
	let result = extend( [], v1)
	for(let i=0 ; i < result.length;i++){
		result[i] = result[i]-v2[i]*1
	}
	return result
}
function plusV(v1,v2){
	if(v1==0){
		return v2;
	}
	let result = extend( [], v1)
	for(let i=0 ; i < result.length;i++){
		result[i] = result[i]+v2[i]*1
	}
	return result;
}



module.exports = MI