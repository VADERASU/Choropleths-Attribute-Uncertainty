var Plotly=require("./plotly-latest.min.js");
var state = require("../state.js");
const TDSP={};


TDSP.ScatterPlot=function(container,group,data,reflect){
  var margin = {top: 20, right: 20, bottom: 20, left: 30},
    padding = {top: 20,  right: 20,  bottom: 10,  left: 10},
    width = $('#scat').width(),
    height = $('#scat').height() - margin.top;
    d3.select("#divPlot").style("height",height+"px").style("width",width+"px")

   let groupdata=[]

  var getcolor=function(k){
    if(reflect==undefined)
      return state.color(k)
    else
      return state.color(reflect[k])
  }

   for(let k=0;k<group.length;k++){
      groupdata.push({
        x:[],  y:[], z:[], 
          mode: 'markers',
          marker: {
            color: getcolor(k),
            size: 5,
            symbol: 'circle',
            line: {
              color: 'rgba(217, 217, 217, 0.14)',
              width: 0.5
            },
            opacity: 0.8
          },
          type: 'scatter3d'
      })

      for(let i=0;i<group[k].length;i++){
         groupdata[k].x.push( data[group[k][i]][0] )
         groupdata[k].y.push( data[group[k][i]][1] )
         groupdata[k].z.push( data[group[k][i]][2] )
      }
   }

  var layout = {margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0}};
   Plotly.newPlot(container, groupdata, layout);
}


module.exports = TDSP;
