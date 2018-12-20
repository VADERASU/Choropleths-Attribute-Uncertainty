require("../css/LineChart.scss");
var state = require("./state.js");

export class LineC {
    constructor(container, options, data) {
        this.options = {
            bin: 20,
            attributename: "",
            width: 240,
            height: 70,
            xlabel: "",
            ylabel: ""
        }
        $.each(options, d => this.options[d] = options[d]);
        this.container = container


        // let data = []
        // for (let i = 0; i < state.data.vectors.length; i++) {
        //     data.push(state.data.vectors[i][state.selectedFeatures.indexOf(this.options.attributename)])
        // }
        this.data = data

        this.init()
    }
    init() {
        let data  = this.data
        let statisticval = calstep(data, this.options.bin)
        let ob = caldistribution(statisticval, data)

        this.container.selectAll("g").remove()
        this.container.datum([ob])
            .call(d3_xy_chart()
                .width(this.options.width)
                .height(this.options.height)
                .xlabel(this.xlabel)
                .ylabel(this.ylabel)
                .origindata(data));
        this.max = statisticval.max
        this.min = statisticval.min
        this.step = statisticval.step
    }
    show() {
        this.container.style("display", "block")
    }
    hide() {
        this.container.style("display", "none")
    }
    getmin(){ 
        return this.min
    }
    getmax(){
        return this.max
    }

}

function calstep(data, bin) {
    let max = Math.max(...data),
        min = Math.min(...data)
    return {
        max: max,
        min: min,
        step: (max - min) / bin
    }
}

function caldistribution(sta, data) {
    let result = []
    for (let i = sta.min; i <= sta.max; i += sta.step) {
        result.push(0)
    }
    for (let i = 0; i < data.length; i++) {
        result[Math.floor((data[i] - sta.min) / sta.step)]++;
    }

    let ob = {
        label: "Data Set 1",
        x: [],
        y: []
    }
    for (let i = sta.min; i <= sta.max; i += sta.step) {
        ob.x.push(i)
        ob.y.push(result[Math.floor((i - sta.min) / sta.step)] /  data.length)
    }
    return ob
}

function drawcoreLine(container, data, containerrange, domain, containerheight, maxval) {
    let statisticval = calstep(data, 20)
    data = [caldistribution(statisticval, data)]

    var x_scale = d3.scaleLinear()
        .range(containerrange)
        .domain(domain);

    var y_scale = d3.scaleLinear()
        .range([containerheight, 0])
        .domain([0, maxval]);



    var draw_line = d3.line()
        .curve(d3.curveBundle.beta(0.5))
        .x(function(d) {
            return x_scale(d[0]);
        })
        .y(function(d) {
            return y_scale(d[1]);
        });

    var svg = container.append("g").classed("corestatistic", true)

    console.log(data)
    var data_lines = svg.selectAll(".d3_xy_chart_line")
        .data(data.map(function(d) {
            return d3.zip(d.x, d.y);
        }))
        .enter().append("g")
        .attr("class", "d3_xy_chart_line");

    var color_scale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(d3.range(data.length));
    data_lines.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
            return draw_line(d);
        })
        .attr("stroke", function(_, i) {
            return color_scale(i);
        });

}


function d3_xy_chart() {
    var width = 570,
        height = 480,
        xlabel = "X Axis",
        ylabel = "Y Axis",
        origindata = []

    function chart(selection) {
        selection.each(function(datasets) {
            //
            // Create the plot. 
            //
            var margin = {
                    top: 10,
                    right: 20,
                    bottom: 20,
                    left: 30
                },
                innerwidth = width - margin.left - margin.right,
                innerheight = height - margin.top - margin.bottom;

            var x_scale = d3.scaleLinear()
                .range([0, innerwidth])
                .domain([d3.min(datasets, function(d) {
                        return d3.min(d.x);
                    }),
                    d3.max(datasets, function(d) {
                        return d3.max(d.x);
                    })
                ]);

            var y_scale = d3.scaleLinear()
                .range([innerheight, 0])
                .domain([d3.min(datasets, function(d) {
                        return d3.min(d.y);
                    }),
                    d3.max(datasets, function(d) {
                        return d3.max(d.y);
                    })
                ]);

            var color_scale = d3.scaleOrdinal(d3.schemeCategory10)
                .domain(d3.range(datasets.length));

            var draw_line = d3.line()
                .curve(d3.curveBundle.beta(0.5))
                .x(function(d) {
                    return x_scale(d[0]);
                })
                .y(function(d) {
                    return y_scale(d[1]);
                });

            let MapManager = require("./Map/MapManager.js");
            let SP = require("./ScatterPlot.js");
            var svg = d3.select(this)
                .attr("width", width)
                .attr("height", height)
                .call(d3.drag()
                    .on("start", function() {
                        d3.select("#ADRect").remove()
                        d3.select(this).append("rect")
                            .attr("originalx", pix2roundpix(d3.mouse(this)[0]))
                            .attr("x", pix2roundpix(d3.mouse(this)[0]))
                            .attr("y", margin.top)
                            .attr("width", 0)
                            .attr("height", innerheight)
                            .style("fill", "#2323233d")
                            .attr("id", "ADRect")
                        state.ADhighlightlist = [];
                        for (let i = 0; i < origindata.length; i++) {
                            SP.unSelectCircle(i);
                            MapManager.unhighlightregion(i)
                        }
                    })
                    .on("drag", function() {
                        let flag = false

                        let thisx = Math.min(d3.select("#ADRect").attr("originalx") * 1, pix2roundpix(d3.mouse(this)[0]))
                        let thiswidth = Math.abs(pix2roundpix(d3.mouse(this)[0]) - d3.select("#ADRect").attr("originalx") * 1)

                        if (d3.select("#ADRect").attr("width") * 1 != thiswidth) {
                            d3.select("#ADRect").attr("width", thiswidth)
                            flag = true
                        }
                        if (d3.select("#ADRect").attr("x") * 1 != thisx) {
                            d3.select("#ADRect").attr("x", thisx)
                            flag = true
                        }
                        if (flag) {
                            let range = [pix2round(d3.select("#ADRect").attr("x") * 1),
                                pix2round(d3.select("#ADRect").attr("x") * 1 + d3.select("#ADRect").attr("width") * 1)
                            ]

                            state.ADhighlightlist = [];
                            for (let i = 0; i < origindata.length; i++) {
                                if (origindata[i] >= range[0] && origindata[i] <= range[1]) {
                                    state.ADhighlightlist.push(i)
                                    SP.selectCircle(i);
                                    MapManager.selectregion(i)
                                } else {
                                    SP.unSelectCircle(i);
                                    MapManager.unhighlightregion(i)
                                }
                            }
                        }

                    })
                    .on("end", function() {}))
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            function pix2roundpix(positionX) {
                let round = Math.round(x_scale.invert(positionX - margin.left))
                if (round < x_scale.domain()[0])
                    round = x_scale.domain()[0]

                if (round > x_scale.domain()[1])
                    round = x_scale.domain()[1]

                round = x_scale(round) + margin.left
                return round
            }

            function pix2round(positionX) {
                let round = Math.round(x_scale.invert(positionX - margin.left))
                if (round < x_scale.domain()[0])
                    round = x_scale.domain()[0]
                if (round > x_scale.domain()[1])
                    round = x_scale.domain()[1]
                return round
            }

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + innerheight + ")")
                .call(d3.axisBottom(x_scale).ticks(5))
                .append("text")
                .attr("dy", "-.71em")
                .attr("x", innerwidth)
                .style("text-anchor", "end")
                .style("fill", "black")
                .text(xlabel);

            svg.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y_scale).ticks(3))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .style("text-anchor", "end")
                .style("fill", "black")
                .text(ylabel);

            svg.select(".y").selectAll(".tick").select("text").text(function (){return d3.select(this).text()*100+"%"})


            var data_lines = svg.selectAll(".d3_xy_chart_line")
                .data(datasets.map(function(d) {
                    return d3.zip(d.x, d.y);
                }))
                .enter().append("g")
                .attr("class", "d3_xy_chart_line");

            data_lines.append("path")
                .attr("class", "line")
                .attr("d", function(d) {
                    return draw_line(d);
                })
                .attr("stroke", function(_, i) {
                    return color_scale(i);
                });

            // data_lines.append("text")
            //     .datum(function(d, i) { return {name: datasets[i].label, final: d[d.length-1]}; }) 
            //     .attr("transform", function(d) { 
            //         return ( "translate(" + x_scale(d.final[0]) + "," + 
            //                  y_scale(d.final[1]) + ")" ) ; })
            //     .attr("x", 3)
            //     .attr("dy", ".35em")
            //     .attr("fill", function(_, i) { return color_scale(i); })
            //     .text(function(d) { return d.name; }) ;
        });
    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };
    chart.xlabel = function(value) {
        if (!arguments.length) return xlabel;
        xlabel = value;
        return chart;
    };

    chart.ylabel = function(value) {
        if (!arguments.length) 
            return ylabel;
        ylabel = value;
        return chart;
    };
    chart.origindata = function(value) {
        if (!arguments.length) return origindata;
        origindata = value;
        return chart;
    };


    return chart;
}