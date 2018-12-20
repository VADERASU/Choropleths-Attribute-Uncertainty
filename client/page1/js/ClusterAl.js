const state = require("./state.js");
const Kmeans= require("./Kmeans/Kmeans.js")

const ClusterAl = {
	Cluster : function(k, vectors, type) {
		let clusterdata ={}

		let dimension = vectors[0].length*1

		switch(type){
			case "Kmeans":
			console.log(vectors, k)
				clusterdata = ClusterAl.SKmeans(vectors, k);
				break;
			case "Jenks":
				clusterdata = ClusterAl.jenks(vectors, k);
				break;
			case "quantile":
				clusterdata = ClusterAl.quantile(vectors, k);
				break;
			default:
		}
		console.log(clusterdata)

		//order
		if(dimension==1){
			let order = []
			for(let i =0;i<clusterdata.centroids.length;i++){
				order.push({id:i,value:clusterdata.centroids[i][0]})
			}
			order.sort(function(a, b) {return a.value - b.value;});
			// console.log(order)

			// let colors =['#fee391','#fec44f','#fe9929','#ec7014','#cc4c02','#993404','#662506']
			let colors =["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#756bb1","#54278f"]

			order.forEach((o,i)=>{
				o.color = colors[i]
			})
			order.sort(function(a, b) {return a.id - b.id;});
			state.classificationcolor = $.extend(true, [], order)
			state.color=function(value) {
				let thiscolor=[]
				order.forEach(o=>{
					thiscolor.push(o.color)
				})
				return thiscolor[value];
			}
		}else{
			let order = []
			console.log(state.data)
			for(let i =0;i<clusterdata.centroids.length;i++){
				order.push({id:i,value:clusterdata.clustersnormal[i].length})
			}
			order.sort(function(a, b) {return a.value - b.value;});

			// let colors =['#fee391','#fec44f','#fe9929','#ec7014','#cc4c02','#8c2d04']
		 	// let colors=['#8dd3c7','#bebada','#80b1d3','#fdb462','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f','#fb8072','#ffffb3','#b3de69']
		 	let colors=['#8dd3c7','#ffffb3','#b3de69','#d9d9d9','#bc80bd','#ccebc5','#ffed6f','#fccde5']

			order.forEach((o,i)=>{
				o.color = colors[i]
			})
			order.sort(function(a, b) {return a.id - b.id;});
			state.classificationcolor = $.extend(true, [], order)
			state.color=function(value) {
				let thiscolor=[]
				order.forEach(o=>{
					thiscolor.push(o.color)
				})
				return thiscolor[value];
			}
		}
		updateFeaturesWithClusters(clusterdata.clustersnormal);
		state.data.kmeans = clusterdata.clustersnormal;
		state.data.stacenters = clusterdata.centroids;
	},
	quantile:function (vectors , k){
		let result = {centroids:[],clusters:[],clustersnormal:[]}
		let dataV = []
		for(let i = 0 ;i<vectors.length;i++){
			dataV[i]=vectors[i][0]*1
		}
		let groupString =[Math.min(...dataV)]
		for(let i = 1;i<k;i++){
			groupString.push(ss.quantile(dataV,i/k))
		}
		groupString.push(Math.max(...dataV))
		
		for(let k=1;k<groupString.length;k++){
   				result.centroids.push([(groupString[k]+groupString[k-1])/2])
		}

   		for(let j=1;j<groupString.length;j++){
   			result.clustersnormal.push([])
   		}

		for(let i=0;i<dataV.length;i++){
			if(dataV[i]==groupString[0]){
				result.clusters.push(0)
				result.clustersnormal[0].push(i)
			}else{
				if(dataV[i]>groupString[groupString.length-1]){
					result.clusters.push(groupString.length-2)
					result.clustersnormal[groupString.length-2].push(i)
				}else{
   				for(let j=1;j<groupString.length;j++){
   					if(dataV[i]>groupString[j-1]&&dataV[i]<=groupString[j]){
   						result.clusters.push(j-1)
							result.clustersnormal[j-1].push(i)
   					}
   				}
				}
			}
		}
		return result
	},
	jenks : function(vectors,k){
		let result = {centroids:[],clusters:[],clustersnormal:[]}
		let dataV = []
		for(let i = 0 ;i<vectors.length;i++){
			dataV[i]=vectors[i][0]*1
		}
		// let serie = new geostats(dataV);
		// serie.setPrecision(6);
		// let groupString = serie.getClassJenks(k);
		let groupString = ss.jenks(dataV,k)

   			for(let k=1;k<groupString.length;k++){
   				result.centroids.push([(groupString[k]+groupString[k-1])/2])
   			}

	   		for(let j=1;j<groupString.length;j++){
	   			result.clustersnormal.push([])
	   		}

   			for(let i=0;i<dataV.length;i++){
   				if(dataV[i]==groupString[0]){
   					result.clusters.push(0)
   					result.clustersnormal[0].push(i)
   				}else{
   					if(dataV[i]>groupString[groupString.length-1]){
	   					result.clusters.push(groupString.length-2)
	   					result.clustersnormal[groupString.length-2].push(i)
	   				}else{
		   				for(let j=1;j<groupString.length;j++){
		   					if(dataV[i]>groupString[j-1]&&dataV[i]<=groupString[j]){
		   						result.clusters.push(j-1)
	   							result.clustersnormal[j-1].push(i)
		   					}
		   				}
	   				}
   				}
   			}
		return result
	},
	SKmeans:function(data, k) {
		Kmeans.Init(k,data)
		return Kmeans.Scluster(300);
	},
	Kmeansincerter:function(data, k,centers) {
		Kmeans.Init(k,data)
	    Kmeans.setcenters(centers)
		return Kmeans.cluster(100);
	}
}

function updateFeaturesWithClusters(data) {
	var features = state.map.geojson.features;
	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < data[i].length; j++) {
			features[data[i][j]].properties.KMeansCluster = i;
			features[data[i][j]].properties.FeatureIndex = data[i][j];
		};
	}
}
module.exports = ClusterAl;