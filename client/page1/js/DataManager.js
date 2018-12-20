const math = require("./Math/mathmatic.js");

var state = require("./state.js");
const DM={
	normalize:function(data,maxmin) {
		let result = []
		let thismaxmin
		if(maxmin == undefined){
			thismaxmin = math.FindSetBoundary(data)
			state.maxmin = thismaxmin
		}else{
			thismaxmin = maxmin
		}
		for( let i=0; i<data.length;i++){
			result.push([])
			for (let m=0;m<data[i].length;m++){
				if(thismaxmin[m].max<=0){
					result[i].push(0)
				}else{
					result[i].push(data[i][m]/thismaxmin[m].max)
				}
			}
		}
		return result
	}
}

module.exports = DM;