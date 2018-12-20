const state = {
	listresult: [],
	ADhighlightlist: [],
	event:{},
	scat: {
		drawn: false,
		obj: null
	},
	map: {
		refreshed: false,
		layer: false
	},
	layers: {},
	activeView: '#og-map',
	/* color: d3.scale.category10(), */
	color: function(value) {
		// let colors = d3.schemeSet2
		//let colors = ['#ffffe5','#fff7bc','#fee391','#fec44f','#fe9929','#ec7014','#cc4c02','#8c2d04']
		 let colors=['#8dd3c7','#bebada','#80b1d3','#fdb462','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f','#fb8072','#ffffb3','#b3de69']
		// let colors = ['rgb(228,26,28)','rgb(55,126,184)','rgb(77,175,74)','rgb(152,78,163)','rgb(255,127,0)','rgb(255,255,51)','rgb(166,86,40)','rgb(247,129,191)','rgb(153,153,153)'];
		return colors[value];
	},
	data: {
		existMIdata: new Map(),
		existdata: new Map()
	},
	tsnemachine:{},
	moranIAdjN: 1,
	useClustering: true,
	test: false,
	selectedFeatures: [],
	loadingText: ["", "L", "o", "a", "d", "i", "n", "g", ".", "."],
	eventattrname: []
};
module.exports = state;


