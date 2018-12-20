var state = require("./state.js");
var CA = require("./CombinationAnalysis.js");
var OF=require("./OrderFinder.js");
var LineC = require("./LineChart.js");
var ClusterAl = require("./ClusterAl.js");

var DAB={
	DrawAttrBar:function(container){
		let thisbarchart = container.selectAll("g").data(data=>{
				console.log(data)
				let ID = data.ID
				let properties = CA.features[ID].properties
				let maxattr = DAB.findmaxattr(state.map.geojson.features[ID].properties)*1.5
				let result = []
				state.eventattrname.forEach((o,i)=>{
					result.push({text:o,val:properties[o],max:maxattr,top:20*i,ID:ID})
				})
				return result
			})
		drawInteractiveBar(thisbarchart)
	},
	DrawOriBar: function(container){
			      container.exit().remove()
			  let thisbarchart = container.enter().append("g").attr("class","orisvg")
			  let updatechart = thisbarchart.merge(container).attr(`transform`, `translate(100 0)`)

			  //text
			  thisbarchart.append("text").classed("barcharttext",true)
			  updatechart.select(".barcharttext").text(data=>data.text)
			              .attr("x",0)
			              .attr("y",15)
			                .classed("notselect",data=>{
			                	if (OF.findSelectOrder(data.text)==null)
			                	 return true
			                	return false
			                })
			  //bar
			  thisbarchart.append("rect").classed("barchartbar",true)


			  updatechart.select(".barchartbar")
			                .attr("x","100px")
			                .attr("y",2)
			                .attr("width",data=>{
			                	let width = data.data*100/data.max
			                	if( width==0)
			                		return 0
			                	return `${width}px`
			                })
			                .attr("height",16)
			                .attr("rx",2)
			                .attr("ry",2)
			                .classed("notselect",data=>{
			                	if (OF.findSelectOrder(data.text)==null)
			                	 return true
			                	return false
			                })
			  //valuetext
			  thisbarchart.append("text").attr("class","valtext")
			  updatechart.select(".valtext")
			              .text(data=>data.data)
			              .attr("x",210)
			              .attr("y",15)
			                .classed("notselect",data=>{
			                	if (OF.findSelectOrder(data.text)==null)
			                	 return true
			                	return false
			                })

			  updatechart.attr("transform",data=>`translate(0,${data.y})`)
			},
	findmaxattr:function(object){
		let max = 0
		for (ob of state.eventattrname){
			max = Math.max(max , object[ob])
		}
		return max
	}
}
//addRectTo(svg,text,val,max,top,ID)
function drawInteractiveBar(container){
	container.exit().remove()
  	let thisbarchart = container.enter().append("g").attr("class","orisvg")
  	let updatechart = thisbarchart.merge(container)
				  .attr("attrname",data=>data.text)
				  .attr("transform",data=>`translate(0,${data.top})`)




	thisbarchart.append("text").classed("barcharttext",true)
	updatechart.select(".barcharttext")
              .text(data=>data.text)
              .attr("x",0)
              .attr("y",15)
	            .classed("notselect",data=>{
	            	if (OF.findSelectOrder(data.text)==null)
	            	 return true
	            	return false
	            })

    thisbarchart.append("rect").classed("barchartbar",true)
	updatechart.select(".barchartbar")
				.attr("x","100px")
                .attr("y",2)
                .attr("width",data=>`${data.val/data.max*100}px`)
                .attr("height",16)
                .attr("rx",2)
                .attr("ry",2)
                .style("pointer-events","all")
                .style("fill",data=>{
                	if (OF.findSelectOrder(data.text)==null){
                		return "#d2d2d2"
                	}
                	let attrval = data.text[state.map.geojson.features[data.ID].properties]
                	if(data.val>attrval)
                		return "#fb7979"
                	if(data.val<attrval)
                		return "rgb(77, 175, 74)"
                	if(data.val==attrval)
                		return "#ffcf9c"
                })
                .style("stroke",data=>{
                	if (OF.findSelectOrder(data.text)==null){
                		return "#d2d2d2"
                	}
                	let attrval = data.text [ state.map.geojson.features[data.ID].properties]
                	if(data.val>attrval)
                		return "#ff1c34"
                	if(data.val<attrval)
                		return "rgb(77, 175, 74)"
                	if(data.val==attrval)
                		return "#ffad00"
                })

	thisbarchart.append("rect").classed("interactive_rect",true)
	updatechart.select(".interactive_rect")
				.attr("x",data=>`${100+data.val/data.max*100-2}px`)
                .attr("y",2)
                .attr("height",16)
                .attr("rx",2)
                .attr("ry",2)
                .style("pointer-events","all")
            	.call(d3.drag()
				    .on("drag", function(){
				    	let data = d3.select(this).data()[0]
                		let attrval = data.text[state.map.geojson.features[data.ID].properties]
				    	// console.log(d3.select(this).data())
				    	if(Math.floor((d3.event.x-98)/100*data.max+0.5)>=0&&
				    		Math.floor((d3.event.x-98)/100*data.max+0.5)<=data.max){
				    		d3.select(this.parentNode).select(".barchartbar")
				    			.attr("width",`${Math.floor((d3.event.x-98)/100*data.max+0.5)/data.max*100}px`)
				    		d3.select(this).attr("x",`${98+Math.floor((d3.event.x-98)/100*data.max+0.5)/data.max*100}px`)
				    		d3.select(this.parentNode).select(".valtext").text(Math.floor((d3.event.x-98)/100*data.max+0.5))
							 if (OF.findSelectOrder(data.text)!=null){
				                if(Math.floor((d3.event.x-98)/100*data.max+0.5)>attrval){
					    			d3.select(this.parentNode).select(".barchartbar").style("fill","#fb7979")
					    			d3.select(this.parentNode).select(".barchartbar").style("stroke","#ff1c34")
					    		}if(Math.floor((d3.event.x-98)/100*data.max+0.5)<attrval){
					    			d3.select(this.parentNode).select(".barchartbar").style("fill","rgb(77, 175, 74)")
					    			d3.select(this.parentNode).select(".barchartbar").style("stroke","rgb(77, 175, 74)")
					    		}if(Math.floor((d3.event.x-98)/100*data.max+0.5)==attrval){
					    			d3.select(this.parentNode).select(".barchartbar").style("fill","#ffcf9c")
					    			d3.select(this.parentNode).select(".barchartbar").style("stroke","#ffad00")
					    		}
			                }
				    	}
				    })
				    .on("end", function(){
					    let tempvectors = CA.data
				    	let data = d3.select(this).data()[0]
				    	let finalval = d3.select(this.parentNode).select(".valtext").text()*1

				    	CA.specify(data.ID,data.text,finalval)

						var CC = require("./compare.js");
						CC.RunCombineAnalysis($('#kMeans-input').val()*1)
				    })
				
			    );

	thisbarchart.append("text").classed("valtext",true)
	updatechart.select(".valtext")
              .text(data=>data.val)
              .attr("x",210)
              .attr("y",15)
                .classed("notselect",data=>{
                	if (OF.findSelectOrder(data.text)==null)
                	 return true
                	return false
                })


	thisbarchart.append("text").classed("valtexta",true)
	updatechart.select(".valtexta")
              .text(data=>{
              	if(CA.changelist.has(data.ID)){
              		if(CA.changelist.get(data.ID).has(data.text)){
              			if(CA.changelist.get(data.ID).get(data.text).changevalue!=null)
              			return CA.changelist.get(data.ID).get(data.text).changevalue.changeval
              		}
              	}
              	return "0"
              })
              .attr("x",250)
              .attr("y",15)
                .classed("notselect",data=>{
                	if (OF.findSelectOrder(data.text)==null)
                	 return true
                	return false
                })
}

module.exports = DAB