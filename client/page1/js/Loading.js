const Loading = {
	elementwidth:20 ,
	add:function (){
		d3.select("body").append("div").attr("id","loading")
		d3.select("#loading").append("div").attr("id", "loadingborder")
		d3.select("#loading").append("div").attr("id","loadingbar")
	},
	set:function (value){
		d3.select("#loadingbar")
			.style("width",`${value}%`)
	},
	remove:function (){
		d3.select("#loading").remove()
	}
}
module.exports = Loading