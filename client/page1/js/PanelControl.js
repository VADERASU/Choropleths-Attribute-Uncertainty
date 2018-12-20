var PC={
	init:function(){
      PC.OverviewAnalysis();
      d3.select("#SACbutton").on("click",function(){
        PC.OverviewAnalysis();
      })
      d3.select("#CObutton").on("click",function(){
        PC.SpecificationAnalysis();
      })
      d3.select("#Uncertainbutton").on("click",function(){
        PC.UncertaintyAnalysis();
      })
  },
  OverviewAnalysis:function(){
	    showOverview(true)
	    showSpecification(false)
	    showUncertainty(false)
  },
  SpecificationAnalysis:function(){
	    showOverview(false)
	    showSpecification(true)
	    showUncertainty(false)
  },
  UncertaintyAnalysis:function(){
	    showOverview(false)
	    showSpecification(false)
	    showUncertainty(true)
  },
  muiltAttrAnalysis:function(){
	    $("#errorlistsingle").hide()
	    $("#Riverlegend").hide()
	    $("#Rmatrixs").show()
	    $("#Matrixlegend").show()
	    d3.select("#map_pcabotton").style("display","block")
  },
  SingleAttrAnalysis:function(){
	    $("#Rmatrixs").hide()
	    $("#Matrixlegend").hide()
	    $("#errorlistsingle").show()
	    $("#Riverlegend").show()
	    d3.select("#map_pcabotton").style("display","none")
  }

}

function showOverview(flag){
	if(flag){
	    $("#SACContainer").show()
	    $("#errorlist").show()
    	d3.select("#SACbutton").classed("changeOptionButtonactive",true)
	}else{
	    $("#SACContainer").hide()
	    $("#errorlist").hide()
    	d3.select("#SACbutton").classed("changeOptionButtonactive",false)
	}
}
function showSpecification(flag){
	if(flag){
	    $("#COContainer").show()
	    $("#COviews").show()
    	d3.select("#CObutton").classed("changeOptionButtonactive",true)
	}else{
	    $("#COContainer").hide()
	    $("#COviews").hide()
    	d3.select("#CObutton").classed("changeOptionButtonactive",false)
	}
}
function showUncertainty(flag){
	if(flag){
	    $("#UncertainContainer").show()
	    $("#Distributionviews").show()
    	d3.select("#Uncertainbutton").classed("changeOptionButtonactive",true)
	}else{
	    $("#UncertainContainer").hide()
	    $("#Distributionviews").hide()
    	d3.select("#Uncertainbutton").classed("changeOptionButtonactive",false)
	}
}

module.exports = PC