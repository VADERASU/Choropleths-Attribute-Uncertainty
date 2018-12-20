var SilH={}

function getSilArray(){
	var temp = new Array(state.silhouettes.length);
	for(var i = 0; i < state.silhouettes.length; i++){
		temp[i] = state.silhouettes[i].value;
	}
	return temp;
}

function resetAllSelected(state){
	var layers = state.map.layer.getLayers();
	if(state.selectedList && state.selectedList.length){
		for (var i = 0; i < state.selectedList.length; i++) {
			 state.map.layer.resetStyle(layers[state.selectedList[i]]);
		};
	}
}

function convertAllSelected(state,type){
	if(state.selectedList){
		for (var i = 0; i < state.selectedList.length; i++) {
			convertPoint(state.selectedList[i], type);
		};
	}
}

function highlightAllSelected(state){
	var layers = state.map.layer.getLayers();
	if(state.selectedList){
		for (var i = 0; i < state.selectedList.length; i++) {
			layers[state.selectedList[i]].setStyle(highlightStyle());
		};
	}
}
function highlightStyle(){
	// return {
	// 	color: 'black',
	// 	fillOpacity: 0.9
	// }
}

function convertPoint(num, type){
	var point = d3.select('#point' + num);
	
	if(point.attr("class") == "dot" && type == "square"){
		var r = parseFloat(point.attr('r'));
		var width = r * 2,
			x = parseFloat(point.attr('cx')) - r,
			y = parseFloat(point.attr('cy')) - r,
			fill = point.style('fill');
		point.remove();
		
		d3.select('#points').append("rect")
			.attr("class", "square")
			.attr("x", x)
			.attr("y", y)
			.attr("width", width)
			.attr("height", width)
			.style("fill", fill)
			.attr("id", 'point' + num);
	}
	else if(point.attr("class") == "square" && type == "dot"){
		var r = point.attr('width') / 2;
		var cx = parseFloat(point.attr('x')) + r,
			cy = parseFloat(point.attr('y')) + r,
			fill = point.style('fill');
//		console.log(r, cx, cy);
		point.remove();
		
		d3.select('#points').append("circle")
			.attr("class", "dot")
			.attr("cx", cx)
			.attr("cy", cy)
			.attr("r", r)
			.style("fill", fill)
			.attr("id", 'point' + num);
	}
	else{
		console.log('Do nothing. class: ' + point.attr("class") + ', type: ' + type);
	}
}
SilH.silFilterValueChanged=function(minSilValue, maxSilValue,state){
	if(minSilValue == maxSilValue || !state.silhouettes){
		return;
	}
//	console.log(minSilValue, maxSilValue)

	var currentFilterV = state.silhouettes;

	resetAllSelected(state);
	convertAllSelected(state,'dot');
	state.selectedList = [];

	//for here, need to add the filter such that only the units that can change cluster will be highlighted.
	for(var i = 0; i < currentFilterV.length; i++){

		// ui.showChangeableCheckBox->isChecked()
		// Assume true unless it is useful to add the checkbox
		if(true){
			if(currentFilterV[i].clusters.length <= 1)
				continue;
		}

		if(currentFilterV[i].value >= minSilValue && currentFilterV[i].value <= maxSilValue)
			state.selectedList.push(i);
	}
	// console.log('state.selectedList: ', state.selectedList);
	highlightAllSelected(state);
	convertAllSelected(state,'square');

	calcVisualAppearancePQ(currentFilterV, state.data.adjList,state);

	/*var layers = state.map.layer.getLayers();
	for (var i = 0; i < state.selectedList.length; i++) {
		layers[state.selectedList[i]].setStyle(highlightStyle());
	};*/
}

function calcDistance(obj0, obj1, weight){
	return Math.sqrt( ( obj0[0] - obj1[0] ) * (obj0[0] - obj1[0] ) * weight
		+ ( obj0[1] - obj1[1] ) * ( obj0[1] - obj1[1] ) * weight); 
}

function calcDistanceProper(obj0, obj1, weight){
	var tempDist = 0;
	for(var i = 0; i < obj0.length; i++){
		tempDist += (obj0[i] - obj1[i]) * (obj0[i] - obj1[i]) * weight;
	}
	
	return Math.sqrt(tempDist);
}

function calcDistanceComplete(obj0, obj1, weight,state){
	var tempDist = 0;
	for(var i = 0; i < state.data.vectors[obj0].length; i++){
		tempDist += (state.data.vectors[obj0][i] - state.data.vectors[obj1][i]) *
			(state.data.vectors[obj0][i] - state.data.vectors[obj1][i]) * weight;
	}
	
	return Math.sqrt(tempDist); 
}
function getClusterIndex(state,index){
			if(!state.test)
				return state.map.geojson.features[index].properties.KMeansCluster;
			else{
				var kmeans = state.data.kmeans;
				for(var ki = 0; ki < kmeans.length; ki++){
					for(var kj = 0; kj < kmeans[ki].length; kj++){
						if(kmeans[ki][kj] == index)
							return ki;
					}
				}
			}
		}
SilH.calcSilhouette=function (kData, pcaData,state){
	var silhouettes = new Array(pcaData.length);

	for(var silIndex = 0; silIndex < pcaData.length; silIndex++) {
		var dissimilarity = new Array(kData.length),
		cluster = getClusterIndex(state,silIndex),
		minDis = undefined;

		silhouettes[silIndex] = {
			value: -1,
			clusters: [],
			dissimilarity: dissimilarity,
			cluster: cluster
		};

		for(var clusterIndex = 0; clusterIndex < kData.length; clusterIndex++) {
			dissimilarity[clusterIndex] = 0,
			objCount = kData[clusterIndex].length;

			// Check with Yifan to make sure his calculation excludes the current unit from it's own dissimilarity calculation
			for(var objIndex = 0; objIndex < kData[clusterIndex].length; objIndex++) {
				if(clusterIndex != cluster){
					dissimilarity[clusterIndex] += calcDistanceComplete(silIndex, kData[clusterIndex][objIndex], 1,state);
				}
				else if(kData[clusterIndex][objIndex] == silIndex){
					// console.log('cluster: ', cluster, ', ', clusterIndex);
					objCount--;
				}
				else{
					dissimilarity[clusterIndex] += calcDistanceComplete(silIndex, kData[clusterIndex][objIndex], 1,state);
				}
			};

			if (objCount > 0){
				dissimilarity[clusterIndex] /= objCount;
			}
			else{
				dissimilarity[clusterIndex] = 0;
			}

			if((minDis === undefined || minDis > dissimilarity[clusterIndex]) && clusterIndex != cluster){
				minDis = dissimilarity[clusterIndex];
			}
		};

		silhouettes[silIndex].value = (minDis - dissimilarity[cluster]) / Math.max(minDis, dissimilarity[cluster]);
		/*if(dissimilarity[cluster] > minDis)
		{
			silhouettes[silIndex].value = minDis / dissimilarity[cluster] - 1;
		}
		else if(dissimilarity[cluster] == minDis)
			silhouettes[silIndex].value = 0;
		else
			silhouettes[silIndex].value = 1 - dissimilarity[cluster] / minDis;*/		
		
		silhouettes[silIndex].minDis = minDis;

		for(var clusterIndex = 0; clusterIndex < dissimilarity.length; clusterIndex++) {
//			if(dissimilarity[clusterIndex] <= dissimilarity[cluster] * 1.2){
			if(dissimilarity[clusterIndex] <= dissimilarity[cluster] * 1.15){
				silhouettes[silIndex].clusters.push(clusterIndex);
			}
		}
	};
	return silhouettes;
}

//This is the core code for the paper. Here we first calculate the possible cluster that filtered units
// (in myDataHelper->currentLevelData->selectedList) can change to and return them in the 
//possibleClusterIndexList (Outter vector is the corresponding index of the unit and the inner vector 
//store the possible cluster list such as [1,3] means that unit can be changed into cluster 1 or cluster 3). 
//The adjacentList is the similar structure pre-calculated where the outter vector is the corresponding index 
//of the unit and the inner vector store the index for adjacent units. Meanwhile, we find the minimum and maximum 
//impact and store them as well.
function calcVisualAppearancePQ(possibleClusterIndexList, adjacentList,state)
{
	//pqContainer is to store the p and q value as referenced in the paper for each unit
	var pqContainer = {};
	if(adjacentList.length == 0)
		return;
	state.visualAppearanceEffectList = {};
	state.caseTypes = {};

	for(var i=0; i < state.selectedList.length; i++)
	{
		//first we need to find out the count of the adjacent regions in each cluster
		var clusterCount = new Array(state.data.kmeans.length).fill(0),
		index = state.selectedList[i];
		
		for(var j = 0; j < adjacentList[index].length; j++)
		{
			var adjCluster = getClusterIndex(state,adjacentList[index][j]);

			/*if(clusterCount[adjCluster])
				clusterCount[adjCluster]++;
			else
				clusterCount[adjCluster] = 1;*/

			clusterCount[adjCluster]++;

		}
		pqContainer[index] = clusterCount;

		//then we need to distinguish the p,q (identify the effects) by using the possibleClusterIndexList
		//possibleClusterIndexList is for the all the global regions
		state.visualAppearanceEffectList[index] = 0;
		state.caseTypes[index] = 0;
		for(var j = 0; j < possibleClusterIndexList[index].clusters.length; j++)
		{
			//this is the case of q>p, where there will be positive effect
			if(clusterCount[possibleClusterIndexList[index].clusters[j]] > clusterCount[getClusterIndex(state,index)])
			{
				if(clusterCount[getClusterIndex(state,index)] == 0)
					state.caseTypes[index] += 0x0001; //type 1
				else
					state.caseTypes[index] += 0x1000; //type 4

				state.visualAppearanceEffectList[index] = state.visualAppearanceEffectList[index] | 0x02;
			}
			//this is the case of p==q, where there will be non effect
			else if(clusterCount[possibleClusterIndexList[index].clusters[j]] == getClusterIndex(state,index))
			{
				if(getClusterIndex(state,index) == 0)
					state.caseTypes[index] += 0x0100; //type 3
				else
					state.caseTypes[index] += 0x1000; //type 4
				state.visualAppearanceEffectList[index] = state.visualAppearanceEffectList[index] | 0x01;
			}
			//this is the case of the negative effect
			else
			{
				if(clusterCount[possibleClusterIndexList[index].clusters[j]] == 0)
					state.caseTypes[index] += 0x0010; //type 2
				else
					state.caseTypes[index] += 0x1000; //type 4
				state.visualAppearanceEffectList[index] = state.visualAppearanceEffectList[index] | 0x04;
			}
		}
		//below is to find the maximum digit position to determine the case
		var maxDigit = 0;
		var shiftV = state.caseTypes[index];
		for(var shiftI = 1; shiftI <= 4; shiftI++)
		{
			if((shiftV & 0x000F) > maxDigit)
			{
				maxDigit = (shiftV & 0x000F);
				state.caseTypes[index] = shiftI;
			}
			shiftV = shiftV >>> 4;
		}
	}

	//now below is to work on the adjacent regions
	//first transfer the selectList to selectVector
	var selectedVector = new Array(state.data.pca.length);
	//consider initializing to false

	for(var i = 0; i < state.selectedList.length; i++)
		selectedVector[state.selectedList[i]] = true;

	//now using breadth first search for the contiguous regions
	var searchQueue;
	var minMoran, maxMoran;
	var contiguousComponentList = [],
	componentConnectivityList = [],
	singleContiguousComponent = [];
	state.totalMaxClassPair = 0;
	state.totalMinClassPair = 0;
	state.maxClassConfiguration = {};
	state.minClassConfiguration = {};
	//find connected/contiguous component
	for(var i=0; i < selectedVector.length;i++)
	{
		if(selectedVector[i]) //find one selected region, now start searching for its adjacent list
		{
			singleContiguousComponent = [];
			searchQueue = new Queue();
			searchQueue.enqueue(i);
			selectedVector[i] = false; //such that it will not show up in the contiguousComponentList twice
			while (!searchQueue.isEmpty())
			{
				var currentIndex = searchQueue.dequeue();
				singleContiguousComponent.push(currentIndex); //when ever the search queue dequeue, store the entry in the contiguous list
				for(var j = 0; j < adjacentList[currentIndex].length; j++)
				{
					if(selectedVector[adjacentList[currentIndex][j]]) //find a contiguous region
					{
						searchQueue.enqueue(adjacentList[currentIndex][j]); //store the index to the search queue
						selectedVector[adjacentList[currentIndex][j]] = false; //clear its entry in the vector cause if it is in the search queue, it will be in the contiguous list
					}
				}
			}
			contiguousComponentList.push(singleContiguousComponent); //finish contiguous search of a region
		}
	}
	//finding the minimum and maximum configuration
	//first need to set up the brute force loop
	//one thing need to notice, for the simplicity, we unify the possible cluster index to contain its own cluster label such that computation becomes easier
	/*for(int i=0;i<possibleClusterIndexList.size();i++)
	{
	possibleClusterIndexList[i].push(getClusterIndex(state,i));
	}*/
	//for each contiguous component, we calculate the join count pairs of the same class
	state.pqContainer = pqContainer;
	state.potentialEOCRange = {};
	for(var i = 0; i < contiguousComponentList.length; i++)
	{
		//if it is a singular item, just add the effect
//		console.log('contiguousComponentList: ', contiguousComponentList[i])
		if(contiguousComponentList[i].length == 1)
		{
			var dataIndex = contiguousComponentList[i][0];
			var maxClassPair = pqContainer[dataIndex][getClusterIndex(state,dataIndex)],//the cluster of its own class
			minClassPair = pqContainer[dataIndex][getClusterIndex(state,dataIndex)];
//			console.log('getClusterIndex(state,dataIndex): ', getClusterIndex(state,dataIndex))

//			console.log('dataIndex, maxClassPair, minClassPair: ', dataIndex, maxClassPair, minClassPair);

			for(var j = 0; j < possibleClusterIndexList[dataIndex].clusters.length; j++)
			{
				if(pqContainer[dataIndex][possibleClusterIndexList[dataIndex].clusters[j]] > maxClassPair)
				{
					maxClassPair = pqContainer[dataIndex][possibleClusterIndexList[dataIndex].clusters[j]];
					state.maxClassConfiguration[dataIndex] = possibleClusterIndexList[dataIndex].clusters[j];
				}
				if(pqContainer[dataIndex][possibleClusterIndexList[dataIndex].clusters[j]] < minClassPair)
				{
					minClassPair = pqContainer[dataIndex][possibleClusterIndexList[dataIndex].clusters[j]];
					state.minClassConfiguration[dataIndex] = possibleClusterIndexList[dataIndex].clusters[j];
				}
			}
			state.potentialEOCRange[dataIndex] = maxClassPair - minClassPair;
			state.totalMaxClassPair += maxClassPair;
			state.totalMinClassPair += minClassPair;
//			console.log('singular minClassPair, maxClassPair: ', minClassPair, maxClassPair);
		}
		else //it is a contiguous regions
		{
			//first compute the connectivity list
			componentConnectivityList = [];
			var pointIndex,otherPointIndex;
			var sameClassPair = 0, maxClassPair = undefined, minClassPair = undefined;
			var pointsHash = {}; //used for detect connectivity, transform the list into a hash table
			for(var j = 0; j < contiguousComponentList[i].length; j++)
			{
				pointsHash[contiguousComponentList[i][j]] = j;			
			}
			for(var j = 0; j < contiguousComponentList[i].length; j++)
			{
				var dataIndex=contiguousComponentList[i][j];
				for(var h =0 ; h < adjacentList[dataIndex].length; h++)
				{
					pointIndex = adjacentList[dataIndex][h];
					if(pointsHash[pointIndex] != undefined) 
					{
						if(pointIndex > dataIndex) //ensure the connectivity/edge is in order and no duplicate
							componentConnectivityList.push({first: pointsHash[dataIndex], second: pointsHash[pointIndex]});
						//adjust/update the clusterCount based on the connectivity
						pqContainer[dataIndex][getClusterIndex(state,pointIndex)]--;
					}

				}
			}

			var loopIndex = new Array(contiguousComponentList[i].length).fill(0);
			var endflag = false;

			while (!endflag)
			{
				sameClassPair = 0;
				//this is for the single effect for contiguous component
				for(var j = 0; j < contiguousComponentList[i].length; j++)
				{
					var dataIndex = contiguousComponentList[i][j];
					sameClassPair += pqContainer[dataIndex][possibleClusterIndexList[dataIndex].clusters[loopIndex[j]]];
				}
				//this is for the co-effect
				for(var j = 0; j < componentConnectivityList.length; j++)
				{
					pointIndex = componentConnectivityList[j].first; //hash index
					otherPointIndex = componentConnectivityList[j].second; //hash index
					//if two nodes have the same class, edge of weight 2 is added!!!!update not weight 2 but 1
					if(possibleClusterIndexList[contiguousComponentList[i][pointIndex]].clusters[loopIndex[pointIndex]] ==possibleClusterIndexList[contiguousComponentList[i][otherPointIndex]].clusters[loopIndex[otherPointIndex]])
					{
						sameClassPair += 1; //!!!!update, not doubled co-effect anymore, it should be just normal 1 based on join count
					}
				}
				//compare the maximum/min and store the configuration
				if(sameClassPair > maxClassPair || maxClassPair === undefined)
				{
					maxClassPair = sameClassPair;
					for(var j = 0; j < loopIndex.length; j++)
						state.maxClassConfiguration[contiguousComponentList[i][j]] = possibleClusterIndexList[contiguousComponentList[i][j]].clusters[loopIndex[j]];
				}
				if(sameClassPair < minClassPair || minClassPair === undefined)
				{
					minClassPair = sameClassPair;
					for(var j = 0; j < loopIndex.length; j++)
						state.minClassConfiguration[contiguousComponentList[i][j]] = possibleClusterIndexList[contiguousComponentList[i][j]].clusters[loopIndex[j]];
				}
				//generate next one configuration at once, considering it as a number system to do brute force
				var k = 0;
				loopIndex[k]++;
				while (k < contiguousComponentList[i].length)
				{
					if(loopIndex[k] >= possibleClusterIndexList[contiguousComponentList[i][k]].clusters.length)
					{
						if(k == contiguousComponentList[i].length - 1) //come to the last number
						{
							endflag = true;
							break;
						}
						else //need to carry when it reaches the limit
						{
							loopIndex[k] = 0;
							loopIndex[k+1]++;
							k++;
						}
					}
					else break;
				}

			}
			for(var j = 0; j < contiguousComponentList[i].length; j++)
				state.potentialEOCRange[contiguousComponentList[i][j]] = maxClassPair - minClassPair;
//			console.log('contiguous minClassPair, maxClassPair: ' , minClassPair, maxClassPair)
			state.totalMaxClassPair += maxClassPair;
			state.totalMinClassPair += minClassPair;
		}
	}
}

function calcSpatialAssociation()
{
	//the spatial weight matrix originally need to be divided by 2, but since the dispersion part also doubled, thus no need to divide 2
	var moranI = 0, spatialWeight = 0, correlation = 0, autoCorrelation = 0;
	var clusterNumber = state.data.kmeans.length;
	var avgMeanVector = new Array(clusterNumber);
	
	for(var i = 0; i < clusterNumber; i++)
	{
		avgMeanVector[i] = state.data.kmeans[i].length;
	}

	//calculating the average vector for as x_bar, but may also replaced just with normalized (1/k,1/k....,1/k)
	//compute the possible cases of dotproduct for z_i*z_j
	for(var i = 0; i < clusterNumber; i++)
		avgMeanVector[i] = avgMeanVector[i] / state.data.pca.length;

	var correlatedClusterProduct = new Array(clusterNumber);

	for(var i = 0; i < clusterNumber; i++) //this is the target unit cluster index
	{
		correlatedClusterProduct[i] = new Array(clusterNumber).fill(0);

		for(var j = 0; j < clusterNumber; j++) //this is the adjacent unit cluster index
		{
			for(var k = 0; k < clusterNumber; k++)
			{
				var leftV, rightV;

				if(k == i)
					leftV = 1 - avgMeanVector[k];
				else
					leftV = -avgMeanVector[k];

				if(k==j)
					rightV = 1 - avgMeanVector[k];
				else
					rightV = -avgMeanVector[k];

				correlatedClusterProduct[i][j] += leftV * rightV;
			}
		}
	}

	for(var index = 0; index < state.data.pca.length; index++)
	{
		spatialWeight += state.data.adjList[index].length;

		var targetClusterIndex = getClusterIndex(state,index);
		for(var i = 0; i < state.data.adjList[index].length; i++)
		{
			var adjClusterIndex = getClusterIndex(state,state.data.adjList[index][i]);
			correlation += correlatedClusterProduct[targetClusterIndex][adjClusterIndex];
		}
		autoCorrelation += correlatedClusterProduct[targetClusterIndex][targetClusterIndex];
	}
	moranI = (state.data.pca.length / spatialWeight) * (correlation / autoCorrelation);
	// ui.MoranILineEdit->setText(QString::number(moranI,'f',5));
//	console.log('Moran I: ', moranI);
}

module.exports=SilH