var state = require("./state.js");
var MA= require("./Math/mathmatic.js");
var CA = require("./CombinationAnalysis.js");

function geticon(type){
	return myIcon = L.icon({
	    iconUrl: 'crime.png',
	    iconSize: [20, 20],
	    // iconAnchor: [10, 20],
	    popupAnchor: [-3, -76],
	    // shadowUrl: 'my-icon-shadow.png',
	    // shadowSize: [68, 95],
	    // shadowAnchor: [22, 94]
	});
}


const CrimeList={
	container:d3.select("#CrimeList").select(".list"),
	crimemarkers:[],
	oldmarker:null,
	nowid:null,
	Rendering: function(data){
		let thislist = CrimeList.container.selectAll(".crimeevent")
						.data(data)
		
	  	CrimeList.crimemarkers.forEach(o=>{
		  state.map.obj.removeLayer(o)
	  	})
	  	CrimeList.crimemarkers =[]
	  	data.forEach((d,i)=>{
	  		console.log()
	  		if(d.nowposition!=undefined){
	  			let thismarker = L.marker(d.nowposition,{draggable:true, riseOnHover:true, icon:geticon("sometype")})
	  			thismarker.on({
	  				mouseover:function(){
		  				$('#crimelistdiv').animate({  
					        scrollTop: $(`#crimeevent${d.id}`).offset().top-$('#crimelistdiv div').offset().top
					    },50);
					    d3.selectAll(".crimeevent").classed("isselected",false)
					    d3.selectAll(`#crimeevent${d.id}`).classed("isselected",true)

					    CrimeList.oldmarker = L.marker([d.latitude,d.longitude],{ icon:geticon("sometype")})
					    state.map.leftMap.getMap().addLayer(CrimeList.oldmarker)
			    	},
			    	mouseout:function(){
			    		state.map.leftMap.getMap().removeLayer(CrimeList.oldmarker)
			    	}
			    })
	  			CrimeList.crimemarkers.push(thismarker)	
	  		}
	  		
	  		else{
	  			let thismarker = L.marker([d.latitude,d.longitude],{draggable:true, riseOnHover:true, icon:geticon("sometype")})
	  			thismarker.on({mouseover:function(e){
		    		$('#crimelistdiv').animate({  
				        scrollTop: $(`#crimeevent${d.id}`).offset().top-$('#crimelistdiv div').offset().top
				    },50);
				    d3.selectAll(".crimeevent").classed("isselected",false)
				    d3.selectAll(`#crimeevent${d.id}`).classed("isselected",true)
			    	}})
	  			CrimeList.crimemarkers.push(thismarker)	
	  		}

		  	CrimeList.crimemarkers[CrimeList.crimemarkers.length-1].on({
		  		dragstart:function(e){
			    		console.log(d.latitude,d.longitude)
			    	},
		    	dragend:function(e){

		    		let nowID=null;
		    		let nowposition =[d.latitude,d.longitude]
		    		if(d.nowposition!=undefined){
						nowposition = d.nowposition
		    		}

		    		state.map.geojson.features.forEach((area,nowid)=>{
		    			if(MA.IsPointInArea([nowposition[1],nowposition[0]],area.geometry.bbox)){
		    				let areacoor=[]
							for (let thiscoor of area.geometry.coordinates[0]){
								areacoor.push({x:thiscoor[0],y:thiscoor[1]})
							}
							if(MA.checkPP({x:nowposition[1],y:nowposition[0]}, areacoor)){
								nowID=nowid
							}
						}})


		    		state.map.geojson.features.forEach((area,newid)=>{
		    			if(MA.IsPointInArea([e.target._latlng.lng,e.target._latlng.lat],area.geometry.bbox)){
		    				let areacoor=[]
							for (let thiscoor of area.geometry.coordinates[0]){
								areacoor.push({x:thiscoor[0],y:thiscoor[1]})
							}
							if(MA.checkPP({x:e.target._latlng.lng,y:e.target._latlng.lat}, areacoor)){
								console.log(i,"find",nowID)
								CA.specify(nowID,d.category,CA.returnObjAttr(d.category,CA.features[nowID].properties)*1-1)
								CA.specify(newid,d.category,CA.returnObjAttr(d.category,CA.features[newid].properties)*1+1)
								var CC = require("./compare.js");
								CC.RunCombineAnalysis($('#kMeans-input').val()*1)
							}
		    			}
		    		})


		    			d.nowposition=[e.target._latlng.lat,e.target._latlng.lng]
			    		CrimeList.crimemarkers[i].on({
				  				mouseover:function(){
					  				$('#crimelistdiv').animate({  
								        scrollTop: $(`#crimeevent${d.id}`).offset().top-$('#crimelistdiv div').offset().top
								    },50);
								    d3.selectAll(".crimeevent").classed("isselected",false)
								    d3.selectAll(`#crimeevent${d.id}`).classed("isselected",true)

								    CrimeList.oldmarker = L.marker([d.latitude,d.longitude],{ icon:geticon("sometype")})
								    state.map.leftMap.getMap().addLayer(CrimeList.oldmarker)
						    	},
						    	mouseout:function(){
						    		if(CrimeList.oldmarker)
						    		state.map.leftMap.getMap().removeLayer(CrimeList.oldmarker)
						    	}
						    })
			    	}
			    });
		  	state.map.leftMap.getMap().addLayer(CrimeList.crimemarkers[CrimeList.crimemarkers.length-1])
	  	})


		let thisevent = thislist.enter().append("div")
		  .attr("class", "crimeevent")

		updateevent = thisevent.merge(thislist)
		  .attr("id", (d, i)=> `crimeevent${d.id}`)
		  .on("mouseover",function(d, i){
		  	// console.log(d.id,i)
		  })
		thisevent.append("div").classed("eventid",true)
		updateevent.select(".eventid").text(function(d){return d.id})

		thisevent.append("div").classed("eventcategory",true)
		updateevent.select(".eventcategory").text(d=>d.category)

		thisevent.append("div").classed("eventdate",true)
		updateevent.select(".eventdate").text(function(d){return d.incident_date})

		thislist.exit().remove()
	}
}





module.exports= CrimeList