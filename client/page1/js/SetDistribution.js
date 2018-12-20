
var LineC = require("./LineChart.js");


var SD={
	container: d3.select("SetDis"),
	rendering:function( means, standard){
		let data =[]
		for (let i =0;i<100000;i++){
	       data.push(d3.randomNormal(means,standard)())
	    }

    	LineC.drawcoreLine(d3.select("#SetDis"),data,[100,200],[-40,40],33,20000)
	    
	}
}



   

module.exports = SD