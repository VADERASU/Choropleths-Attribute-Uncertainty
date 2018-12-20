
let {
	AttrRS
} = require("./newattr.js");
let state = require("../state.js");
let PL = require("./parllel_line.js");

const Attrmanager = {
	Refresh: function() {
		state.data.attrlist=[]
		cleanlist();

		d3.select("#AttrInput").style("width",225*state.selectedFeatures.length+"px")
		d3.select("#PLine").style("width",225*state.selectedFeatures.length+"px")

		state.selectedFeatures.forEach(o => {
			state.data.attrlist.push(new AttrRS({
				father: d3.select("#AttrInput"),
				rank: state.data.attrlist.length + 1,
				attrname: o
			}))
		})
		PL.renderingline(state.data.kmeans,state.data.vectors)
	},
	getrangeset() {
		let result = []
		state.data.attrlist.forEach((o) => {
			if (o.ischeck())
				result.push({
					rank: o.getrank() ,
					name: o.getname(),
					id: o.getid(),
					range: o.getrange(),
					step: o.getstep()
				})
		})
		result.sort(function(a,b){
			return a.rank - b.rank
		})
		return result
	}
}

function cleanlist() {
	state.data.attrlist = []
	d3.select("#AttrInput").selectAll(".attrinput").remove()
}

module.exports = Attrmanager