var echarts=require("echarts")


var RS={
	container: d3.select("#RegionStatistic"),
	processdata:function(data){
		let result = []
		for (let i=0;i<12;i++){
			result.push([`2014/${i+1}`,0,'BURGLARY'])
			result.push([`2014/${i+1}`,0,'DISTURBANCES'])
			result.push([`2014/${i+1}`,0,'DOMESTIC'])
			result.push([`2014/${i+1}`,0,'DRUNKNESS'])
			result.push([`2014/${i+1}`,0,'NOISE'])
			result.push([`2014/${i+1}`,0,'ROBBERY'])
			result.push([`2014/${i+1}`,0,'BATTERY'])
			result.push([`2014/${i+1}`,0,'THEFT'])
		}
		console.log(result.length)
		var format = d3.timeFormat("%Y/%m/%d");
		// incident_date
		for (let crime of data){
			switch(crime.category){
					case "BURGLARY":
						result[(crime.incident_date.split("-")[1]*1-1)*8][1]++
						break;
					case "DISTURBANCES":
						result[(crime.incident_date.split("-")[1]*1-1)*8+1][1]++
						break;
					case "DRUNKNESS":
						result[(crime.incident_date.split("-")[1]*1-1)*8+3][1]++
						break;
					case "NOISE":
						result[(crime.incident_date.split("-")[1]*1-1)*8+4][1]++
						break;
					case "ROBBERY":
						result[(crime.incident_date.split("-")[1]*1-1)*8+5][1]++
						break;
					case "BATTERY":
						result[(crime.incident_date.split("-")[1]*1-1)*8+6][1]++
						break;
					case "THEFT":
						result[(crime.incident_date.split("-")[1]*1-1)*8+7][1]++
						break;
					default://DOMESTIC DISTURBANCE
						result[(crime.incident_date.split("-")[1]*1-1)*8+2][1]++
				}
		}
		console.log(result)
		return result;
	},
	Rendering: function(data){
		console.log(data)
		let chartdata=RS.processdata(data)
		var myChart = echarts.init(document.getElementById('RegionStatistic'));

        // specify chart configuration item and data
        
		option = {
			title: {
	            text: 'Crime River',
	            left: 'center'
			},
		    tooltip: {
		        trigger: 'axis',
		        axisPointer: {
		            type: 'line',
		            lineStyle: {
		                color: 'rgba(0,0,0,0.2)',
		                width: 1,
		                type: 'solid'
		            }
		        }
		    },
		    legend: {
		        top: 25,
		        data: ['BURGLARY', 'DISTURBANCES', 'DOMESTIC', 'DRUNKNESS', 'NOISE', 'ROBBERY', 'BATTERY', 'THEFT']
		    },

		    singleAxis: {
		        top: 75,
		        bottom:  35,
		        axisTick: {},
		        axisLabel: {},
		        type: 'time',
		        axisPointer: {
		            animation: true,
		            label: {
		                show: true
		            }
		        },
		        splitLine: {
		            show: true,
		            lineStyle: {
		                type: 'dashed',
		                opacity: 0.2
		            }
		        }
		    },

		    series: [
		        {
		            type: 'themeRiver',
		            itemStyle: {
		                emphasis: {
		                    shadowBlur: 20,
		                    shadowColor: 'rgba(0, 0, 0, 0.8)'
		                }
		            },
		            data:chartdata
		        }
		    ]
		};

        // use configuration item and data specified to show chart
        myChart.setOption(option);
	}
}
module.exports = RS