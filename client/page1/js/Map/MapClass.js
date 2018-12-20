export class MapClass {
	constructor(container, options) {
		//load options
		this.options = {
			
			// center: [39.5296, -119.8138],
			center: [41.8781, -87.6298],
			minZoom: 2,
			maxZoom: 20,
			zoom: 0,
			tileSize: 256,
			noWrap: true,
			 url: `https://api.mapbox.com/styles/v1/zhaosong/cjf1is65m72mn2smykzyevmv0/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiemhhb3NvbmciLCJhIjoiY2pmMWlyb3BzMGJueTJ6cTd2eGpqZjZwdCJ9.ahNyvzEQ9ZlnK8hcBLQyvg`
			// url: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
		}
		$.each(options, d => this.options[d] = options[d]);
		this.container = container;
		this.layer = null

		//init
		this.Init();
	}
	Init() {
		this.map = L.map(this.container, {
			center: this.options.center,
			minZoom: this.options.minZoom,
			zoom: this.options.zoom
		});
		this.high_shadow=[]
		L.tileLayer(
			this.options.url, {
				maxZoom: this.options.maxZoom,
				minZoom: this.options.minZoom,
				tileSize: this.options.tileSize,
				noWrap: this.options.noWrap,
				bounds: this.options.bounds
			}).addTo(this.map);
	}
	setUHL(id) {
		this.high_shadow.forEach(o=>{
			this.map.removeLayer(o)
		})
		this.high_shadow=[]
		this.getLayers()[id].setStyle({
			color: 'white',
			weight: 1,
			fillOpacity: 1
		});
	}
	setHL(id) {
		this.getLayers()[id].setStyle({
			color: 'red',
			weight: 1,
			fillOpacity: 1
		}).bringToFront();
	}
	setischange(id,stripes,thispath) {
		// this.
		this.getLayers()[id].setStyle({
			color: 'rgb(95, 95, 95)',
			weight: 1,
			fillOpacity: 1
		}).bringToFront();

		//stripes
		stripes.addTo(this.map);
        this.high_shadow.push(L.geoJson({
            "type": "Feature",
            "properties": {
                "name": "GeoJson Example Area"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [thispath]
            }
        }, {style: {
                fillPattern: stripes,
            fillOpacity: 1,
			weight: 0
            }
        }).addTo(this.map))
	}

	setSel(id) {
		this.getLayers()[id].setStyle({
			color: 'rgb(95, 95, 95)',
			weight: 1,
			fillOpacity: 1
		}).bringToFront();
	}
	getLayers() {
		return this.layer.getLayers()
	}
	setnormal(id){
		this.getLayers()[id].setStyle({
			color: 'white',
			weight: 1,
			fillOpacity: 1
		});
	}
	SetLayer(geojson, color, events, reflectset) {
		if (this.layer)
			this.map.removeLayer(this.layer);
		this.layer = L.geoJson(geojson, {
			style: function(feature) {
				return {
					fillColor: reflectset!=undefined ? color(reflectset[feature.properties.FeatureIndex]) :"none",
					weight: 1,
					opacity: 1,
					color: 'white',
					fillOpacity: 1
				}
			},
			onEachFeature: events
		}).addTo(this.map);
	}
	removeLayer() {
		if (this.layers)
			this.map.removeLayer(this.layers);
	}
	getMap() {
		return this.map
	}

}