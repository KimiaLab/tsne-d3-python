// settings below

var xCat = "x",
    yCat = "y",
    nameCat = "image_name";

// rest of logic below

var margin = { top: 0, right: 0, bottom: 0, left: 0 },
    outerWidth = window.innerWidth - 20,
    outerHeight = window.innerHeight - 100,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .range([0, width]).nice();

var y = d3.scaleLinear()
    .range([height, 0]).nice();

d3.csv(CSV_FILE, function(data) {
    var xMax = d3.max(data, function(d) { return d[xCat]; }) * 1.05,
        xMin = d3.min(data, function(d) { return d[xCat]; }),
        xMin = xMin > 0 ? 0 : xMin,
        yMax = d3.max(data, function(d) { return d[yCat]; }) * 1.05,
        yMin = d3.min(data, function(d) { return d[yCat]; }),
        yMin = yMin > 0 ? 0 : yMin;

    data.map(e => {
        e[xCat] = parseFloat(e[xCat]),
        e[yCat] = parseFloat(e[yCat]);
    });

    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    var xAxis = d3.axisBottom(x)
        .ticks(20)
        .tickSize(-height)
        .tickFormat("");

    var yAxis = d3.axisLeft(y)
        .ticks(20)
        .tickSize(-width)
        .tickFormat("");

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            html_tip = "<div class=\"image\"><img src=\"" + IMAGES_FOLDER + d[nameCat] + "\" alt=\"" + d[nameCat] + "\" /></div>";
            html_tip += "<p class=\"caption\">" + d[nameCat] + "</p>";
            return html_tip;
        });

    var zoomBeh = d3.zoom()
    // .x(x)
    // .y(y)
        .scaleExtent([0, 500])
        .on("zoom", zoom);

    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoomBeh);

    svg.call(tip);

    svg.append("rect")
        .attr("width", width)
        .attr("height", height);

    gX = svg.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    //.append("text")
    //  .classed("label", true)
    //  .attr("x", width)
    //  .attr("y", margin.bottom - 10)
    //  .style("text-anchor", "end")
    //  .text(xCat);

    gY = svg.append("g")
        .classed("y axis", true)
        .call(yAxis);
    //.append("text")
    //  .classed("label", true)
    //  .attr("transform", "rotate(-90)")
    //  .attr("y", -margin.left)
    //  .attr("dy", ".71em")
    //  .style("text-anchor", "end")
    //  .text(yCat);

    var objects = svg.append("g")
        .classed("objects", true)
        .attr("width", width)
        .attr("height", height);

    objects.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .classed("dot", true)
    	  .attr("cx", function(d){ return x(d[xCat]); })
	      .attr("cy", function(d){ return y(d[yCat]); })
	      .attr("r", function(d){ return x(0.7); })
        .style("fill", function(d){ return d.color; })
        .attr("width", 50)
        .attr("height", 50)
        .attr("xlink:href", function(d) { return IMAGES_FOLDER + d[nameCat]; })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);


    function zoom() {
        gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
        gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
        objects.attr("transform", d3.event.transform);
    }

    function transform(d) {
        return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
    }
});
