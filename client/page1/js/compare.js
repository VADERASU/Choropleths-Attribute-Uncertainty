var ClusterAl = require("./ClusterAl.js");
//data manager
var state = require("./state.js");
var CA = require("./CombinationAnalysis.js");

var PC = require("./PanelControl.js");
var DM = require("./DataManager.js");



var munkres = require('munkres-js');

var CC = {

  compare: function(Old, New) {
    let matrix = []
    for (let i = 0; i < Old.length; i++) {
      matrix.push([])
      for (let m = 0; m < New.length; m++) {
        matrix[i].push(0)
      }
    }
    for (let i = 0; i < Old.length; i++) {
      for (let m = 0; m < New.length; m++) {
        for (let n = 0; n < Old[i].length; n++) {
          if (New[m].indexOf(Old[i][n]) != -1)
            matrix[i][m]--
        }
      }
    }

    let reflect = munkres(matrix)
    for (let i = 0; i < reflect.length; i++) {
      reflect[i] = reflect[i][1]
    }
    let sum = 0;
    for (let i = 0; i < Old.length; i++) {
      sum = sum + Old[i].length - (-matrix[i][reflect[i]])
    }

    // console.log(reflect);
    // console.log({sum:sum, reflect:reflect})
    return {
      sum: sum,
      reflect: reflect
    };
  }
}

var TsneM = require("./Tsne/TsneManager.js");


CC.RunErrorAnalysis = function(min, max, k) {
  PC.OverviewAnalysis()
  var AttrId = state.selectedFeatures.indexOf($("#AttrInput").val())
  SAC.data = []
  for (let VectorsID = 0; VectorsID < state.data.vectors.length; VectorsID++) {
    let tempvectors = $.extend(true, [], state.data.vectors)
    tempvectors[VectorsID][AttrId] = tempvectors[VectorsID][AttrId] * 1 + max * 1;
    let pluschange = CC.ErrorAnalysis(tempvectors, k)
    // let plustsne = TsneM.stepwithdata(tempvectors);

    tempvectors = $.extend(true, [], state.data.vectors)
    tempvectors[VectorsID][AttrId] = tempvectors[VectorsID][AttrId] * 1 + min * 1;
    if (tempvectors[VectorsID][AttrId] < 0)
      tempvectors[VectorsID][AttrId] = 0;
    let minuschange = CC.ErrorAnalysis(tempvectors, k)
    // let minustsne = TsneM.stepwithdata(tempvectors);

    let element = {
      name: VectorsID,
      id: VectorsID,
      data: [pluschange.changeval, minuschange.changeval],
      reflect: [pluschange.reflect, minuschange.reflect],
      // plustsne:plustsne,
      // minustsne:minustsne,
      Kmeans: [pluschange.kmeans, minuschange.kmeans],
      ChangePClass: pluschange.clusterdata,
      ChangeMClass: minuschange.clusterdata,
      visualChangeP: pluschange.visualChange,
      visualChangeM: minuschange.visualChange,
    }
    SAC.data.push(element)
  }
  SAC.ReRenderingList()
}

CC.RunCombineAnalysis = function(k) {
  PC.SpecificationAnalysis()
  let tempvectors = $.extend(true, [], CA.data)
  CA.changedata = CC.ErrorAnalysis(tempvectors, k)

  CA.ReRenderingList()
}


let MI = require("./MoranI/MoranI.js");


let starttime,
    time=[0,0,0,0,0]

CC.ErrorAnalysis = function(cluster, regionID) {
  let data
  if ($('#norm-input').prop('checked'))
    data = DM.normalize(cluster,state.maxmin)
  else
    data = cluster

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length; j++) {
      if (data[i][j] < 0)
        data[i][j] = 0
    }
  }
 // result.Changelist.forEach((ob) => {
      //   result.visualChange += CacVisualChange(result.clusterdata, ob)
      // })
     
  let result = {}
  let tempC

  // console.log(data)
  switch( $('#clusterType').val()){
      case "Kmeans":
        tempC = ClusterAl.Kmeansincerter(data, state.data.kMeansK, state.data.stacenters)
        break;
      case "Jenks":
        tempC = ClusterAl.jenks(data, state.data.kMeansK)
        break;
      case "quantile":
        tempC = ClusterAl.quantile(data, state.data.kMeansK)
        break;
      default:
  }
  let change = CC.compare(state.data.kmeans, tempC.clustersnormal)

  let string = ""
  for( let i=0;i<tempC.clustersnormal.length;i++){
    string += `${tempC.clustersnormal[change.reflect.indexOf(i)].toString()};`
  }
  if (change.sum == 0) {
      result.reflect = change.reflect
      result.kmeans = tempC.clustersnormal
      result.clusterdata = CC.featurelist(tempC.clustersnormal)
      result.Changelist = [];
      result.changeval = 0
      result.visualChange = 0;
  }
  else{
      result.reflect = change.reflect
      result.kmeans = tempC.clustersnormal
      result.clusterdata = CC.featurelist(tempC.clustersnormal)
      result.Changelist = FindChangeRegion(result.clusterdata, change.reflect)
      result.changeval = quantify_change(change.sum, state.data.kmeans, tempC.clustersnormal, change.reflect)
      result.changenumber = change.sum
      if (!state.data.existdata.has(string)) {
        state.data.existMIdata.set(string,MI.CalcLMI(tempC.clustersnormal,change.reflect))
        state.data.existdata.set(string,compareMoranI(state.data.existMIdata.get(string)))
      }
      result.visualChange = state.data.existdata.get(string)
      result.MIdata = state.data.existMIdata.get(string)
  }
  // if(change.sum!=0){
  //   console.log(regionID,change.sum,change.reflect)
  // }
  // if(result.visualChange!=0){
  //   console.log(result.visualChange)
  // }
  return result
}

function quantify_change(sum, K1,K2,reflect){
  let Cdata = []
  let n = state.data.vectors.length
  let reK2 = []
  for(let i =0;i<K2.length;i++){
    reK2[reflect.indexOf(i)] = K2[i]
  }

  for(let i =0;i<K1.length;i++){
    Cdata.push({K1:K1[i].length/n ,K2:reK2[i].length/n})
  }
  let HC = 0 
  for(let i =0;i<Cdata.length;i++){
    HC -= (Cdata[i].K1 * Math.log(Cdata[i].K1) + Cdata[i].K2 * Math.log(Cdata[i].K2))
  }
  let Pkk=[]
  for(let i =0;i<Cdata.length;i++){
    Pkk[i]=[]
    for(let j =0;j<Cdata.length;j++){
      Pkk[i][j]= K1[i].filter(v => reK2[j].includes(v)).length/n
    }
  }

  let ICC  =0
  for(let i =0;i<Cdata.length;i++){
    for(let j =0;j<Cdata.length;j++){
      if(Pkk[i][j]!=0)
      ICC += Pkk[i][j] * Math.log(Pkk[i][j]/(Cdata[i].K1*Cdata[j].K2))
  }}
  let result = (HC - 2*ICC) *(1/(2*Math.log(K1.length)))

  return result
}

function compareMoranI(thisMi) {
  let count = 0;
  for (let i = 0; i < state.data.LMI.length; i++) {
    if (state.data.LMI[i] != thisMi[i]) {
      count += (thisMi[i] - state.data.LMI[i])*(thisMi[i] - state.data.LMI[i])
      // console.log(i, "old :",state.data.LMI[i] ,"new : ", thisMi[i])
    }
  }
  count= Math.sqrt(count/ state.data.vectors.length)
  return count
}


function CacVisualChange(Cluster, id) {
  let Adjlist = []
  state.data.PolygonAdjList[id].forEach((o, i) => {
    if (o && id != i) {
      Adjlist.push(i)
    }
  })
  //ori
  let orival = 0
  //new
  let newval = 0

  for (let adjid of Adjlist) {
    if (state.map.geojson.features[adjid].KMeansCluster != state.map.geojson.features[id].KMeansCluster) {
      orival += (1 / Adjlist.length)
    }
    if (Cluster[adjid] != Cluster[id]) {
      newval += (1 / Adjlist.length)
    }
  }
  //bijiao
  return Math.abs(newval - orival)
}

function FindChangeRegion(Cluster, reflect) {
  let result = [];
  let OldC = state.map.geojson.features
  Cluster.forEach((ob, i) => {
    if (reflect.indexOf(ob) != OldC[i].properties.KMeansCluster) {
      result.push(i)
    }
  })
  return result
}

CC.featurelist = function(data) {
  var result = new Array(state.data.vectors.length)

  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].length; j++) {
      result[data[i][j]] = i;
    };
  }
  return result
}


module.exports = CC



// let A = [[1,2,3],[4],[6,7],[8,9,5]]
// let B = [[4,6,7],[1,2,3],[5],[8,9]]
// console.log(CC.compare(A, B))


  // compare:function(Old, New) {
  //         const record = new Map();
  //         // record every ele's pre group Id
  //         for (let i = 0; i < Old.length; ++ i) {
  //           for (let j = 0; j < Old[i].length; ++ j) {
  //             record.set(Old[i][j], i);
  //           }
  //         }
  //         const proportionInNewGroup = [];
  //         for (let i = 0; i < Old.length; ++ i) {
  //           proportionInNewGroup.push([]);
  //           for (let j = 0; j < Old.length; ++ j)
  //             proportionInNewGroup[i].push(0);
  //         }
  //         for (let i = 0; i < New.length; ++ i) {
  //           for (let j = 0; j < New[i].length; ++ j) {
  //             const preGroup = record.get(New[i][j]);
  //             proportionInNewGroup[preGroup][i] ++;
  //           }
  //         }
  //         const vis = new Map(),
  //             reflect = [];
  //         let sum = 0;
  //         for (let i = 0; i < proportionInNewGroup.length; ++ i) {
  //           let maxV = -1, maxP = -1;
  //           for (let j = 0; j < proportionInNewGroup[i].length; ++ j) {
  //             if (vis.has(j)) continue;
  //             if (maxV < proportionInNewGroup[i][j]) {
  //               maxV = proportionInNewGroup[i][j];
  //               maxP = j;
  //             } else if (maxV == proportionInNewGroup[i][j]) {
  //               let p0 = maxV / New[j].length,
  //                   p1 = maxV / New[maxP].length;
  //               if (p0 - p1 > 0) {
  //                 maxV = proportionInNewGroup[i][j];
  //                 maxP = j;
  //               }
  //             }
  //           }
  //           reflect[i] = maxP;
  //           sum += Old[i].length - maxV;
  //           vis.set(maxP, true);
  //         }
  //         // console.log(reflect);
  //         console.log({sum:sum, reflect:reflect})
  //         return {sum:sum, reflect:reflect};
  //       }