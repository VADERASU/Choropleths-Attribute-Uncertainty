export class WeightB{
	constructor(container, options){
		this.container = container

		this.options = {left:0 , width:100, height:13, max:1, elementweight:[1,1],  
			elementname:["element1","element2"],
			color:["rgb(255, 173, 76)","rgb(87, 183, 255)"]}
		$.each(options, d => this.options[d] = options[d]);


		this.drawweightbar(this.options)
	}
	getweight(){
		return this.options.elementweight
	}
	drawweightbar(options){
		  let that = this
		  let container = this.container
		  container.selectAll(".weightbar").remove()

		  let bar1 = addrect(container,
		  	{classname:"weightbar",x:options.left,y:20,height:options.height,width:options.width,
		  		fill:options.color[0]})
		  container.append("text").classed("weightbar",true).attr("x",options.left+options.height+11).attr("y",13).text(options.elementname[0])
		  addrect(container,{classname:"weightbar",x:options.left,y:2,height:options.height,width:20,
		  		fill:options.color[0]})
		  container.append("text").attr("id","clusterweight").attr("x",options.left).attr("y",13).text(1)
		  .style("fill","#ffffff").style("font-weight","100")


		  let bar2 = addrect(container,
		  	{classname:"weightbar",x:bar1.attr("width")*1+options.left,y:20,height:options.height,
		  		width:options.width,fill:options.color[1]})
		  container.append("text").classed("weightbar",true).attr("x",bar1.attr("width")*1+options.left+options.height+11).attr("y",13).text(options.elementname[1])
		  addrect(container,{classname:"weightbar",x:bar1.attr("width")*1+options.left,y:2,height:options.height,width:20,
		  		fill:options.color[1]})
		  container.append("text").attr("id","visweight").attr("x",bar1.attr("width")*1+options.left).attr("y",13).text(1)
		  .style("fill","#ffffff").style("font-weight","100")

		  let bar1resize = addrect(container,
		  	{classname:"weightbar",x:options.left+options.width-5,y:20,height:options.height,width:10})
		                .attr("cursor","e-resize")
		                .call(d3.drag().on("drag",function(){
		                	let thisx = d3.event.x-options.left
		                	thisx = thisx <0 ? 0 : thisx > options.width ? options.width : thisx

			                  bar1.attr("width",thisx)
			                  bar2.attr("x",thisx + options.left)
			                  bar1resize.attr("x",thisx+bar1.attr("x")*1-5)
			                  bar2resize.attr("x",bar2.attr("width")*1+bar2.attr("x")*1-5)
			                  options.elementweight[0] = bar1.attr("width")/options.width*options.max
			                  options.dragevent()
			                 container.select("#clusterweight").text(that.getweight()[0].toFixed(1))
		                }))

		  let bar2resize = addrect(container,
		  	{classname:"weightbar",x:options.left+options.width*2-5,y:20,height:options.height,width:10})
		                .attr("cursor","e-resize")
		                .call(d3.drag().on("drag",function(){
		                	let thisx = d3.event.x-options.left-bar1.attr("width")
		                	thisx = thisx <0 ? 0 : thisx > options.width ? options.width : thisx
			                  bar2.attr("width",thisx)
			                	bar2resize.attr("x",thisx+bar2.attr("x")*1-5)
			                  options.elementweight[1] = bar2.attr("width")/options.width*options.max
			                options.dragevent()

			                 container.select("#visweight").text(that.getweight()[1].toFixed(1))

		                }))
	}
}

function addrect(container,option){
	return container.append("rect")
                .classed(option.classname,true)
                .attr("y", option.y)
                .attr("x", option.x)
                .attr("height",option.height)
                .attr("width",option.width)
                .style("fill",option.fill==undefined ? "transparent":option.fill)
                .style("stroke",option.stroke==undefined ? "transparent":option.stroke)
}