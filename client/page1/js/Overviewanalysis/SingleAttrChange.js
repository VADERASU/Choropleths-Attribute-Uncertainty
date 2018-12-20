var state = require("../state.js");
var MapManager = require("../Map/MapManager.js");
var {
  WeightB
} = require('./weightbar.js');

var SP = require("../ScatterPlot.js");
var TDSP = require("../chart/3dScatterPlot.js");
let PL = require("../Attr/parllel_line.js");

var CVSP = require("../chart/CV_ScatterPlot.js");
// fccde5
// let visualbarcolor = "rgb(87, 183, 255)"
// let visualbarcolor = "rgb(87, 183, 255)"
let visualbarcolor = "rgb(46, 117, 182)",
    classificolor = 'rgb(237,125,49)'
const SAC = {
  data: [],
  colorscale: d3.scaleLinear()
    .domain([1, 50])
    .range([d3.rgb("rgb(255, 255, 255)"), d3.rgb(classificolor)]),
  visualcolorscale: d3.scaleLinear()
    .domain([1, 50])
    .range([d3.rgb("rgb(255, 255, 255)"), d3.rgb(visualbarcolor)]),
  negativevisualcolorscale: d3.scaleLinear()
    .domain([1, 50])
    .range([d3.rgb("rgb(255, 255, 255)"), d3.rgb('rgb(77, 175, 74)')]),
  barwidth: 750,

  container: d3.select("#errorlistsingle"),
  ReRenderingList: function() {
    drawerrorline()
    drawaxis()
    SAC.RanderingList()
    MapManager.drawRegions(state.map.leftMap);
  },
  moveto: function(id) {
    d3.selectAll(".regionline").each(function() {
      if (d3.select(this).select("g").attr("regionid") * 1 == id) {
        let top = Number.parseInt(d3.select(this).attr("transform").split(" ")[1])
        if (top - $('#SACLISTSCROLL').scrollTop() > d3.select("#SACLISTSCROLL").node().getBoundingClientRect().width ||
          top - $('#SACLISTSCROLL').scrollTop() < 0) {
          $('#SACLISTSCROLL').animate({
            scrollTop: top
          }, 50);
        }
      }
    })
    SAC.highlightSAC(id)
  },
  highlightSAC: function(id) {
    d3.selectAll(".regionline").each(function() {
      if (d3.select(this).select("g").attr("regionid") * 1 == id) {
        d3.select(this).select(".regiontitle").select(".background").style("fill", "#ececec")
      }
    })
  },
  unhighlightSAC: function(id) {
    d3.selectAll(".regionline").each(function() {
      if (d3.select(this).select("g").attr("regionid") * 1 == id) {
        d3.select(this).select(".regiontitle").select(".background").style("fill", "white")
      }
    })
  },
  RanderingList: function() {
    // console.log(SAC.data)
    //sort
    sortdata()

    //find max
    let maxclustersum = 0,
      maxcluster = 0,
      maxvisualsum = 0,
      maxvisual = 0

    let MImin = 0,
      Mimax = 0
    SAC.data.forEach((data, i) => {
      let clustersum = 0,
        visualsum = 0
      data.data.forEach(o => {
        if (!o.underzero) {
          maxcluster = Math.max(maxcluster, o.changeval)
          maxvisual = Math.max(maxvisual, Math.abs(o.visualChange))
          clustersum += o.changeval
          visualsum += Math.abs(o.visualChange)

          if (o.MIdata != undefined) {
            for (let i = 0; i < state.data.LMI.length; i++) {
              MImin = Math.min((o.MIdata[i] - state.data.LMI[i]), MImin)
              Mimax = Math.max((o.MIdata[i] - state.data.LMI[i]), Mimax)
            }
          }
        }
        o.regionid = i
      })
      maxclustersum = Math.max(maxclustersum, clustersum)
      maxvisualsum = Math.max(maxvisualsum, visualsum)
    })
    MImin = MImin.toFixed(2) * 1
    Mimax = Mimax.toFixed(2) * 1 + 0.01
    console.log(MImin, Mimax)
    $("#slider-moranIrange").slider({
      min: MImin,
      max: Mimax,
      values: [MImin, Mimax]
    })
          $( "#moranIrangeamountmin" ).val( $( "#slider-moranIrange" ).slider( "values", 0 ))
          $( "#moranIrangeamountmax" ).val( $( "#slider-moranIrange" ).slider( "values", 1 ))
    MapManager.showMoranIlegend(MImin, Mimax)

    SAC.colorscale.domain([0, maxcluster])
    SAC.visualcolorscale.domain([0, maxvisual])
    SAC.negativevisualcolorscale.domain([0, maxvisual])
    addRiverLegend(SAC.colorscale,SAC.visualcolorscale)

    let sacgnumber = 0
    SAC.data.forEach(o => {
      if(o!=undefined)
        sacgnumber++
    })
    //data element
    let errorlist = SAC.container.select("div").select("svg").attr("height", `${66*sacgnumber}px`)
    let EachRegion = errorlist.selectAll(".regionline").data(function() {
      let data = []
      SAC.data.forEach(o => {
        data.push(o)
      })
      return data
    })
    EachRegion.exit().remove()
    let thiselement = EachRegion.enter().append("g").classed("regionline", true)
    // chart
    let addchart = thiselement.append("g").classed("clusterchart", true)
    // title
    let regiontitle = thiselement.append("g").classed("regiontitle", true)
    regiontitle.append("rect").attr("class", "background").attr("height", 66).attr("width", 320).style("fill", "white")
    addtext(regiontitle, "regionname", 10, 40)
    regiontitle.append("rect").attr("class", "statisticcluster")
    regiontitle.append("rect").attr("class", "statisticvisual")
    regiontitle.append("rect").attr("class", "brect").attr("height", 66).attr("width", 320).style("cursor", "pointer")


    //CVSP
    let CVSPdata = []
    SAC.data.forEach((regiondatasac, id) => {
      regiondatasac.data.forEach(o => {
        if (!o.underzero) {
          if (o.changeval != 0)
            CVSPdata.push([o.changeval, o.visualChange, o])
        }
      })
    })
    CVSP.ScatterPlot(CVSPdata)


    /*********************************
     *            update              *
     *********************************/
    let updateelement = thiselement.merge(EachRegion)

    updateelement.select(".clusterchart").attr("regionid", d => d.id)



    updateelement.attr(`transform`, d => `translate(0 ${66*d.order})`)
      .attr("regionid", d => d.id)
      .on("mouseover", function(d) {
        CVSP.highlightregion(d.id)
      }).on("mouseout", function(d) {
        CVSP.refreshregion()
      }).on("click", function(d) {
        if (CVSP.hightregionlist.has(d.id)) {
          CVSP.hightregionlist.delete(d.id)
          d3.select(this).select(".regiontitle").select(".background").style("fill", "white")
        } else {
          CVSP.hightregionlist.set(d.id, d.id)
          d3.select(this).select(".regiontitle").select(".background").style("fill", "#ececec")
        }
        CVSP.refreshregion()
      })

    /********************************
                title
    *****************************/
    updateelement.select(".regiontitle").on("mouseover", function(d) {
        SP.highlightCircle(d.id);
        MapManager.highlightregion(d.id)
      })
      .on("mouseout", function(d) {
        SP.unhighlightCircle(d.id);
        MapManager.unhighlightregion(d.id)
      }).attr("regionid", d => d.id)
    updateelement.select(".regionname").classed("transition", true).text(d => {
      return `Region ${d.id}`
    })

    let bothmax = Math.max(maxclustersum,maxvisualsum)

    //cluster
    updateelement.select(".statisticcluster")
      .attr("x", 100)
      .attr("y", 28)
      .attr("height", 13)
      .style("fill", classificolor)
      // .style("stroke", "#f69c33")
      .attr("width", d => {
        let sum = 0
        d.data.forEach(o => {
          if (!o.underzero)
            sum += o.changeval
        })
        return sum / bothmax * 100 * SAC.WB.getweight()[0]
      })
    //visual
    updateelement.select(".statisticvisual")
      .attr("y", 28)
      .attr("height", 13)
      .style("fill", visualbarcolor)
      // .style("stroke", "#f69c33")
    updateelement.select(".statisticvisual").attr("width", d => {
      let sum = 0
      d.data.forEach(o => {
        if (!o.underzero)
          sum += Math.abs(o.visualChange)
      })
      return sum / bothmax * 100 * SAC.WB.getweight()[1]
    }).attr("x", d => {
      let sum = 0
      d.data.forEach(o => {
        if (!o.underzero)
          sum += o.changeval
      })
      return 100 + sum / bothmax * 100 * SAC.WB.getweight()[0]
    })


    /********************************
                chart
    *****************************/

    let ThisCC = updateelement.select(".clusterchart").selectAll("g").data(d => {
      for (let i = 0; i < d.data.length; i++) {
        d.data[i].regionid = d.id
      }
      return d.data
    })
    addmatrix(ThisCC, maxcluster, maxvisual)


  }
}

function addRiverLegend(change,visual){
  let container = d3.select("#River_legendrect")
  container.selectAll("div").remove()

  container.append("div")
    .attr("style", `height: 20px;width: 20px;    font-size: 12px;line-height: 20px;background: transparent;color: #777777;
          position: absolute;left:0; top:5px`).text(change.domain()[0].toFixed(2) * 1)
  for (let i = 0; i < 10; i++) {
    container.append("div")
      .attr("style", `height: 20px;
          width: 20px;
          position: absolute;`)
      .style("left", 20 + i * 20 + "px")
      .style("top", "5px")
      .style("background", function() {
        return change(change.domain()[0] + (change.domain()[1] - change.domain()[0]) / 9 * i)
      })

  }
  container.append("div")
    .attr("style", `height: 20px;width: 20px;    font-size: 12px;line-height: 20px;background: transparent;color: #777777;
          position: absolute;left:220px; top:5px`).text(change.domain()[1].toFixed(2) * 1)


  container.append("div")
    .attr("style", `height: 20px; width: 20px;    font-size: 12px; line-height: 20px;background: transparent;color: #777777;
          position: absolute;left:250px; top:5px`).text(visual.domain()[0].toFixed(2) * 1)
  for (let i = 0; i < 10; i++) {
    container.append("div")
      .attr("style", `height: 20px; width: 20px;position: absolute;`)
      .style("left", 250 + 20 + i * 20 + "px")
      .style("top", "5px")
      .style("background", function() {
        return visual(visual.domain()[0] + (visual.domain()[1] - visual.domain()[0]) / 9 * i)
      })
  }
  container.append("div")
    .attr("style", `height: 20px;
          width: 20px;    font-size: 12px;background: transparent;color: #777777;
          line-height: 20px;
          position: absolute;left:470px; top:5px`).text(visual.domain()[1].toFixed(2) * 1)
}

function sortdata() {
  SAC.data.sort(Compare_ab);

  let nozero = []
  SAC.data.forEach(o => {
    let isnotzero = false
    o.data.forEach(eachsimulation => {
      if (!eachsimulation.underzero) {
        if (eachsimulation.changeval != 0) {
          isnotzero = true
        }
      }
    })
    if (isnotzero)
      nozero.push(o)
  })
  SAC.data = nozero

  SAC.data.forEach((o, i) => {
    o.order = i
  })
  let a = []
  for (let ob of SAC.data) {
    a[ob.id] = ob
  }
  SAC.data = a
}

function Compare_ab(a, b) {
  let avalue = 0,
    bvalue = 0;
  a.data.forEach(o => {
    if (!o.underzero)
      avalue += o.changeval * SAC.WB.getweight()[0] + Math.abs(o.visualChange) * SAC.WB.getweight()[1]
  })
  b.data.forEach(o => {
    if (!o.underzero)
      bvalue += o.changeval * SAC.WB.getweight()[0] + Math.abs(o.visualChange) * SAC.WB.getweight()[1]
  })
  return bvalue - avalue;
}


function drawaxis() {
  let data = []


  for (let i = SAC.range[0]; i <= SAC.range[1]; i += SAC.step) {
    data.push(i)
  }
  d3.select("#scaleaxis_g").attr(`transform`, `translate(0, 0)`)
    .attr(`x`, 0)


  let all_axisrect = d3.select("#scaleaxis_g").selectAll(".axiselement").data(data)
  all_axisrect.exit().remove()
  let add_axiselement = all_axisrect.enter().append("g").classed("axiselement", true)
  add_axiselement.append("rect").attr("x", 0).attr("y", 10)
    .attr("width", 25)
    .attr("height", 25)
    .attr("fill", "#b2bac1")
  add_axiselement.append("text").attr("y", 27).attr("style", "font-size: 12px;font-weight: 100;fill: white;")

  let update_axiselement = add_axiselement.merge(all_axisrect)
  update_axiselement.attr(`transform`, d => `translate(${25*(d-SAC.range[0])/SAC.step}, 0)`);
  update_axiselement.select("text").text(d => {
      if (d < 0)
        return d +"%"
      return `+${d}`+"%"
    })
    .attr("x", function() {
      return 12.5 - d3.select(this).node().getBoundingClientRect().width / 2
    })

  d3.select("#scaleaxis_g").call(d3.drag()
    .on("start", function() {
      SAC.panx = d3.event.sourceEvent.pageX
    })
    .on("drag", function() {
      d3.select(this).attr(`transform`, `translate(${ d3.select(this).attr(`x`)*1 +d3.event.sourceEvent.pageX - SAC.panx}, 0)`)
      d3.selectAll(".clusterchart")
        .attr(`transform`, `translate(${ d3.select(this).attr(`x`)*1 +d3.event.sourceEvent.pageX - SAC.panx}, 0)`)

    })
    .on("end", function() {
      let thatx = d3.select(this).attr(`x`) * 1 + d3.event.sourceEvent.pageX - SAC.panx
      d3.select(this).attr(`transform`, `translate(${thatx }, 0)`)
      d3.selectAll(".clusterchart").attr(`transform`, d3.select(this).attr(`transform`))
      d3.select(this).attr(`x`, thatx)

      // let min = 0
      // d3.select(this).selectAll(".axiselement").each(function(){
      //     let thisx = d3.select(this).attr("transform").split(",")[0].split("(")[1]*1 +thatx
      //     if(thisx>-25&&thisx<=0){
      //       min=d3.select(this).select("text").text()*1
      //       // rerun(d3.select(this).select("text").text()*1)
      //     }
      // })
      // console.log(min)
      // rerun(min)

    })
  )

  d3.selectAll(".clusterchart").attr(`transform`, d3.select("#scaleaxis_g").attr(`transform`))
}


const CC = require("../compare.js");

function rerun(min) {
  SAC.range[0] = min
  SAC.range[1] = SAC.range[0] + Math.ceil(d3.select("#scaleaxis").node().getBoundingClientRect().width / 25)
  SAC.data = []
  for (let VectorsID = 0; VectorsID < state.data.vectors.length; VectorsID++) {
    let thisregionresult = {
      id: VectorsID,
      data: []
    }
    for (let thischange = SAC.range[0]; thischange <= SAC.range[1]; thischange++) {
      let tempvectors = $.extend(true, [], state.data.vectors)

      tempvectors[VectorsID][SAC.AttrId] = tempvectors[VectorsID][SAC.AttrId] * 1 + thischange * 1;
      if (tempvectors[VectorsID][SAC.AttrId] < 0)
        tempvectors[VectorsID][SAC.AttrId] = 0;

      let change = CC.ErrorAnalysis(tempvectors)
      thisregionresult.data.push({
        changeval: change.changeval,
        reflect: change.reflect,
        kmeans: change.kmeans,
        clusterdata: change.clusterdata,
        visualChange: change.visualChange,
        change: thischange,
        changelist: change.Changelist
      })
    }
    SAC.data.push(thisregionresult)
  }
  SAC.ReRenderingList()
}

function drawerrorline() {
  SAC.WB = new WeightB(d3.select("#weightbar"), {
    left: 100,
    width: 100,
    height: 13,
    max: 1,
    elementweight: [1, 1],
    elementname: ["Changes of VI", "Changes of Spatial autocorrelation"],
    color: [classificolor, visualbarcolor],
    dragevent: function() {
      SAC.RanderingList()
    }
  });
}

function addmatrix(ThisVC, maxcluster, maxvisual) {

  ThisVC.exit().remove()
  let thisrect = ThisVC.enter().append("g")
  let updaterect = thisrect.merge(ThisVC)
    .attr(`transform`, (d, i) => `translate(${320 + 25*i} 0)`)

  //cluster
  thisrect.append("rect").classed("transition", true).classed("cluster", true).attr("x", 0)
    .attr("width", 25)
  updaterect.select(".cluster").style("fill", d => {
      return d.underzero ? "rgb(232, 232, 232)" : SAC.colorscale(d.changeval)
    })
    .attr("y", d => d.underzero ? 5 : maxcluster == 0 ? 0 : 30 - d.changeval / maxcluster * 25)
    .attr("height", d => d.underzero ? 25 : maxcluster == 0 ? 0 : d.changeval / maxcluster * 25)
  addtext(thisrect, "changevalT", 10, 25)
  updaterect.select(".changevalT")
    .text(d => {
      if (!d.underzero) {
        return d.changeval == 0 ? "" : d.changeval.toFixed(2) * 1
      } else {
        return null
      }
    })
    .style("font-size", "11px")
    .attr("x", function() {
      12.5 - this.getBoundingClientRect().width / 2
    })
  //visual
  thisrect.append("rect").classed("transition", true).classed("visual", true).attr("x", 0)
    .attr("width", 25)
  updaterect.select(".visual").style("fill", d => {
      if (d.underzero)
        return "rgb(232, 232, 232)"
      if (d.visualChange > 0)
        return SAC.visualcolorscale(d.visualChange)
      else
        return SAC.negativevisualcolorscale(Math.abs(d.visualChange))
    })
    .attr("y", 30)
    .attr("height", d => d.underzero ? 25 : maxvisual == 0 ? 0 : Math.abs(d.visualChange) / maxvisual * 25)
  addtext(thisrect, "visualvalT", 10, 55)
  updaterect.select(".visualvalT")
    .text(d => d.underzero ? null : d.visualChange == 0 ? "" : d.visualChange.toFixed(2) * 1)
    .style("font-size", "11px")
    .attr("x", function() {
      12.5 - this.getBoundingClientRect().width / 2
    })

  thisrect.append("rect").classed("transition", true)
    .attr("class", "brect").attr("x", 0).attr("y", 0)
    .attr("width", 25)
    .attr("height", 66)


  updaterect.select(".brect").on("mouseover", function(d, i) {
      if (!d.underzero) {
        MapManager.drawRegions(state.map.leftMap, d.clusterdata, d.reflect);

        let changebalabala = []
        for (let i = 0; i < state.data.attrlist.length; i++) {
          if (i == SAC.AttrId)
            changebalabala.push(d.change)
          else
            changebalabala.push(0)
        }
        PL.drawline(changebalabala, d.regionid, d.kmeans, d.reflect)

        state.data.attrlist.forEach(thisattr => {
          if (thisattr.getid() == SAC.AttrId) {
            thisattr.shownochangeregion(findnochange(d.regionid), SAC.step )
            thisattr.add_original_value(state.data.vectors[d.regionid][thisattr.getid()])
            thisattr.add_now_value(state.data.vectors[d.regionid][thisattr.getid()]+d.change)
          }
        })

        MapManager.highlightregion(d.regionid)
        MapManager.drawchangeregions(d.changelist, d.clusterdata, d.reflect)
        //visualization Map
        if (d.MIdata != undefined) {
          let vischangelist = []
          for (let i = 0; i < state.data.LMI.length; i++) {
            vischangelist.push(d.MIdata[i] - state.data.LMI[i])
          }
          MapManager.drawvisualchange(state.map.rightMap, vischangelist)
        }

        //tsne
        let TsneM = require("../Tsne/TsneManager.js");
        let thischange = [] ;
        for(let i =0;i<state.data.vectors[0].length;i++){
          if(i==SAC.AttrId){
            thischange[i] = d.change
          }else{
            thischange[i] = 0
          }
        }
        TsneM.get_to_tsne_with_data(d.regionid,thischange,d.kmeans,d.reflect)

      }

    })
    .on("mouseout", function(d) {
      if (!d.underzero) {
        PL.undrawline()
        state.data.attrlist.forEach(thisattr => {
          if (thisattr.getid() == SAC.AttrId) {
            thisattr.hidenochangeregion()
            thisattr.remove_nowandOri_value()
          }
        })
        SP.unhighlightCircle(d.regionid);
        // d3.select(this.parentNode).selectAll(".highlightinfor").remove()
        MapManager.drawRegions(state.map.leftMap);
        MapManager.drawvisualchange(state.map.rightMap)
        MapManager.Un_drawchangeregions(d.changelist)
        MapManager.unhighlightregion(d.regionid)
        // if ($('#projectiondimention').prop('checked')) {
        //   SP.ScatterPlot(state.tsnemachine.Two, state.data.kmeans);
        // } else {
        //   TDSP.ScatterPlot("divPlot", state.data.kmeans, state.tsnemachine.Three)
        // }
      }
    })

}

        function findnochange(id) {
          let min = 0;
          max = 0
          let list = []

          for (let i = 0; i < SAC.data[id].data.length; i++) {
            if (SAC.data[id].data[i].changeval == 0) {
              if (SAC.data[id].data[i].change + state.data.vectors[id][SAC.AttrId] * 1 >= 0)
                list.push(SAC.data[id].data[i].change + state.data.vectors[id][SAC.AttrId] * 1)
            }
          }
          return list
        }

function addtext(container, classa, x, y) {
  container.append("text").attr("class", classa)
    .attr("x", x)
    .attr("y", y)
}

function addrect(container, classa, x, y) {
  container.append("rect").attr("class", classa)
    .attr("x", x)
    .attr("y", y)
    .attr("height", 15)
    .attr("rx", 5)
    .attr("ry", 5)
}


module.exports = SAC;