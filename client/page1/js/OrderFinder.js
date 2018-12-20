var state = require("./state.js");

var OF={
	findSelectOrder: function (text){
	  var ThisAttrID=null
	  for(let i=0;i<state.selectedFeatures.length;i++){
	    if(state.selectedFeatures[i]==text)
	      ThisAttrID=i;
	  }
	  return ThisAttrID
	}
}

module.exports = OF