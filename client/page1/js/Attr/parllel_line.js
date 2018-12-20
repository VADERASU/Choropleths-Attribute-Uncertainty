let state = require("../state.js");

const PL = {
	renderingline(kmeans, vectors) {
		// poly
		let allline = d3.select("#PLine").selectAll(".Parallel_g").data(function() {
			let data = []
			for (let label = 0; label < kmeans.length; label++) {
				for (let i = 0; i < kmeans[label].length; i++) {
					let line = {
						id: kmeans[label][i],
						label: label,
						data: vectors[kmeans[label][i]],
						path: ""
					}
					let path = []
					state.data.attrlist.forEach(thisattr => {
						let point = thisattr.getpositionofpoint(vectors[kmeans[label][i]][thisattr.getid()])
						path[thisattr.getrank()] = `${point[0]},${point[1]} `

					})
					path.forEach(o => {
						line.path += o
					})
					data.push(line)
				}
			}
			return data
		})
		allline.exit().remove()

		let addline = allline.enter().append("g").classed("Parallel_g", true)
		addline.append("polyline").classed("Parallel_line", true)

		let mergeline = addline.merge(allline)
		mergeline.select(".Parallel_line").attr("points", d => {
				return d.path
			}).attr("id", d => "parallel" + d.id)
			.style("stroke", d => state.color(d.label))
	},
	highlightlist : [],
	highlight(list) {
		PL.highlightlist = list
		if (list.length == 0)
			d3.select("#PLine").selectAll(".Parallel_g").select("polyline").style("opacity", 0.2)

		else {
			d3.select("#PLine").selectAll(".Parallel_g").each(function(d) {
				if (list.indexOf(d.id) != -1) {
					d3.select(this).select("polyline").style("opacity", 0.8)
				} else {
					d3.select(this).select("polyline").style("opacity", 0.08)
				}
			})
		}
	},
	drawline(changelist,id,kmeans,reflect){
		let thiskmeans =[] 
		for(let i = 0;i<kmeans.length;i++){
			thiskmeans[reflect[i]] = kmeans[i]
		}
		let thisvector = $.extend(true, [], state.data.vectors);
		for(let i=0;i<changelist.length;i++){
			thisvector[id][i]+=changelist[i]
			thisvector[id][i]<0? thisvector[id][i]=0:null
		}
		PL.renderingline(thiskmeans, thisvector)

		d3.select("#PLine").selectAll(".Parallel_g").each(function(d) {
			d3.select(this).select("polyline").style("opacity", 0.08)
		})

		 d3.select("#PLine").append("polyline").classed("Parallel_change", true).attr("points", function() {
		 			let result =""
					let path = []
					state.data.attrlist.forEach(thisattr => {
						let point = thisattr.getpositionofpoint(state.data.vectors[id][thisattr.getid()])
						path[thisattr.getrank()] = `${point[0]},${point[1]} `

					})
					path.forEach(o => {
						result += o
					})
					return result
				})
		 	.style("stroke", function(){
				let label;
				for(let i=0;i<state.data.kmeans.length;i++){
					if(state.data.kmeans[i].indexOf(id) != -1){
						label=i
					}
				}
				return state.color(label)
			}).style("stroke-width", "3px")


		//
		 d3.select("#PLine").append("polyline").classed("Parallel_change", true).attr("points", function() {
		 			let result =""
					let path = []
					state.data.attrlist.forEach(thisattr => {
						let point = thisattr.getpositionofpoint(thisvector[id][thisattr.getid()])
						path[thisattr.getrank()] = `${point[0]},${point[1]} `

					})
					path.forEach(o => {
						result += o
					})
					return result
				})
		 	.style("stroke-width","8px")
		 	.style("stroke", "rgba(144, 144, 144, 0.53)")

		 d3.select("#PLine").append("polyline").classed("Parallel_change", true).attr("points", function() {
		 			let result =""
					let path = []
					state.data.attrlist.forEach(thisattr => {
						let point = thisattr.getpositionofpoint(thisvector[id][thisattr.getid()])
						path[thisattr.getrank()] = `${point[0]},${point[1]} `

					})
					path.forEach(o => {
						result += o
					})
					return result
				})
		 	.style("stroke", function(){
				let label;
				for(let i=0;i<thiskmeans.length;i++){
					if(thiskmeans[i].indexOf(id) != -1){
						label=i
					}
				}
				return state.color(label)
			}).style("stroke-width", "3px")

	},
	undrawline (){
		d3.select("#PLine").selectAll(".Parallel_change").remove()
		PL.renderingline( state.data.kmeans,  state.data.vectors)
		PL.highlight(PL.highlightlist)
	}
}
module.exports = PL