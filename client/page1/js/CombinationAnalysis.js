var state = require("./state.js");
var OF=require("./OrderFinder.js");
var DM = require("./DataManager.js");

var CA={
	data:[],
	changedata:{visualChange:0,changeval:0},
	changelist:new Map(),
	container: d3.select("#COviews"),
	ReRenderingList : function(){
    var DAB = require("./DrawAttrBar.js");
		var MapManager = require("./Map/MapManager.js");

		console.log(CA.changedata)
    CA.container.select("#resultval").select("#Clusteringval").text( `${CA.changedata.changeval}`)
    
    d3.selectAll(".eachimpact").on("mouseover",function(d,i){
                        MapManager.drawRegions(state.map.rightMap, CA.changedata.clusterdata,CA.changedata.reflect)
                        
                      })
                      .on("mouseout",function(){
                        MapManager.drawRegions(state.map.rightMap)
                      })
    CA.container.select("#resultval").select("#Visualizationval").text( `${CA.changedata.visualChange.toFixed(2)}`)

    let EachRegion = CA.container.select("svg").attr("height",`${170*CA.changelist.size}px`)
				.selectAll(".region").data([...CA.changelist])

    EachRegion.exit().remove()      


          let thiselement = EachRegion.enter().append("g").attr("class","region").attr("id",data=>`regionspecify${data[0]}`)

          let updateelement = thiselement.merge(EachRegion)
                            .on("mouseover",function(d){
                              MapManager.highlightregion(d[0])})
                            .on("mouseout",function(d){
                              MapManager.unhighlightregion(d[0])})
                            .attr(`transform`, (d,i)=>{
                              return `translate(0 ${170*i})`});

             thiselement.append("rect")
                      .attr("class","brect")
                      .attr("x",0)
                      .attr("y",0)
                      .attr("width","100%")
                      .attr("height",170)
            //regionname
            addtext(thiselement, "regionname",10,85)
            updateelement.select(".regionname").text(d=>{ return `Region ${d[0]}`})

            //oribarchart
            let ori = updateelement.selectAll(".orisvg").data(o=>{
                    let maxattr = DAB.findmaxattr(state.map.geojson.features[o[0]].properties)*1.5
                    return [{data:state.map.geojson.features[o[0]].properties,maxattr:maxattr}]
                  })
            ori.exit().remove() 
            let thisbarchart = ori.enter().append("g").attr("class","orisvg")
            let updatechart = thisbarchart.merge(ori).attr(`transform`, `translate(100 0)`)


            console.log(state.eventattrname)

            let thisbarchartg = updatechart.selectAll("g").data(data=>{
              let result =[];
              state.eventattrname.forEach((o,i)=>{
                result.push({text:o,data:data.data[o],max:data.maxattr,y:20*i})
              })
              return result
            });
            DAB.DrawOriBar(thisbarchartg)

            //arrow
            let polygon = thiselement.append("polygon").attr("points","0,10 0,25 25,25 25,35 45,17.5 25,0 25,10 0,10")
                          .attr(`transform`, `translate(360 60)`)
                          .attr(`style`, `fill: #ffcf9c;
                                  stroke-width: 1;
                                  stroke: #ffad00`);

            //changement
            let changementMap = updateelement.selectAll(".changementMap").data(data=>{
              return [{ID:data[0]}]
            })
            changementMap.exit().remove() 
            let thischangebarchart = changementMap.enter().append("g").attr("class","changementMap")
            let updatethischangebarchart = thischangebarchart.merge(changementMap).attr(`transform`, `translate(450 0)`)
            DAB.DrawAttrBar(updatethischangebarchart)

            // runsimula(1000,0,10)

	},
  specify:function (ID,text,finalval){
    var CC = require("./compare.js");
      /************
      *   Vectors
      ************/
    let order =OF.findSelectOrder(text)
    if(order != null)
    CA.data[ID][order] = finalval;

    /*************
      *   Features
      *************/
    changeObjAttr(text,CA.features[ID].properties,finalval)
    //changelist
    if(returnObjAttr(text,CA.features[ID].properties) !=
      returnObjAttr(text,state.map.geojson.features[ID].properties)){
        if(!CA.changelist.has(ID)){
          CA.changelist.set(ID,new Map())
        }
        let changevalue = null ;
        if(order!=null){
          let thistempvectors = $.extend(true, [], state.data.vectors)
          thistempvectors[ID][order]=finalval
          changevalue = CC.ErrorAnalysis(thistempvectors, state.data.kMeansK)
        }
          
        CA.changelist.get(ID).set(text,{val:finalval,
          // means:$( "#Gaussian-slider-range" ).slider( "values", 0 ),
          // standard:$( "#Gaussian-slider-range" ).slider( "values", 1 ),
          changevalue: changevalue})
      }else{
        if(CA.changelist.has(ID)){
          if(CA.changelist.get(ID).has(text)){
            CA.changelist.get(ID).delete(text)
            if(CA.changelist.get(ID).size==0){
              CA.changelist.delete(ID)
            }
          }
        }
      }
      console.log(CA.changelist)
  }

}

function changeObjAttr(text, Obj, val){
    Obj[text]=val
}
function returnObjAttr(text,Obj){
  return Obj[text]
}
CA.returnObjAttr = function (text,Obj){
  return returnObjAttr(text,Obj)
}

var ClusterAl = require("./ClusterAl.js");
var LineC = require("./LineChart.js");

function runsimula(loop,means, standard){
	var CC = require("./compare.js");
	let change=[]
	let result = []
	let sum = 0;

  let simula=[]

	for( let i=0;i<loop;i++){
		let thischange = [];
		let data = $.extend(true, [], state.data.vectors)
  		for( let ob of [...CA.changelist]){
        ob[1].forEach((o,i)=>{
          let order = OF.findSelectOrder(i)
          thischange.push(d3.randomNormal(o.means,o.standard)())
          
          if (order!=null){
            data[ob[0]][order] += thischange[thischange.length-1]
            if(data[ob[0]][order]<0){
                data[ob[0]][order]=0;
            }
          }
        })
      }
    if($('#norm-input').prop('checked')){
      data = DM.normalize(data)
    }
		result.push(CC.ErrorAnalysis(data,$('#kMeans-input').val()*1).changeval)
		sum += result[result.length-1]
    simula.push(thischange)
	}
  console.log(simula)

  console.log(result)

    let max=result[0],min=result[0]
        for(let i=0;i<result.length;i++){
            if(max<result[i])
                max=result[i]
            if(min>result[i])
                min=result[i]
        }

	LineC.draw(result, d3.select("#Distributionofresult"),max-min)

  // LineC.draw(data, d3.select("#SetDis"),20)
}

function addtext(container, classa,x,y){
    container.append("text").attr("class",classa)
                      .attr("x",x)
                      .attr("y",y)
}
function addrect(container, classa,x,y){
  container.append("rect").attr("class",classa)
                        .attr("x",x)
                        .attr("y",y)
                        .attr("height",15)
                        .attr("rx",5)
                        .attr("ry",5)
}

module.exports = CA;
