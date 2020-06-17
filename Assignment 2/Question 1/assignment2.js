/**
 * Introduction to Information Visualization: Assignment 2
 * @author Jasmine Cronin   Due: Oct. 28, 2019
 * Webpage to display a stacked bar chart visualizing death rates from
 * female-specific causes in a number of countries.
 * Code from https://bl.ocks.org/LemoNode/5a64865728c6059ed89388b5f83d6b67
 * was used as a base starting point and integrated into code
 * taken from tutorial examples.
 */

/**
 * Call our functions on window load event
 */
window.onload = function() {
    loadData("WomensHealthData.csv");
}

/**
 * Loads data from a given CSV file path
 * @param path - string location of the CSV data file
 */
function loadData(path) {
    d3.csv(path).then(d => chart(d))
}

/**
 * Creates, formats, and displays the stacked bar chart
 * @param csv
 */
function chart(csv) {

    // Transform data into usable subset
    var keys = csv.columns.slice(2); // Second column = countries
    var data = csv.filter(f => f.Year == "2010") // Only select data from 2010

    // Chart setup
    var svg = d3.select("#chart"),
        margin = {top: 40, left: 60, bottom: 60, right: 180},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    // Add chart title
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", margin.top /2)
        .attr("font-weight", "bold")
        .style("text-anchor", "middle")
        .text("Countries");

    // Setup axis scales
    var xAxisScale = d3.scaleBand()
        .range([margin.left, width - margin.right])
        .domain(data.map(d => d.Country))
        .padding(0.2);

    var yAxisScale = d3.scaleLinear()
        .rangeRound([height - margin.bottom, margin.top])
        .domain([0, 1200]);

    // Setup y-axis
    var yAxis = d3.axisLeft(yAxisScale)
        .tickSize(-width + margin.left)
        .ticks(10)
        .tickPadding(10);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);

    // Label y-axis
    svg.append("text")
        .attr("x", margin.left)
        .attr("y", (height / 2))
        .attr("transform", `rotate(-90, ${margin.left / 3}, ${height / 2})`)
        .style("text-anchor", "middle")
        .text("Number of Deaths (per 100,000)");

    // Set color palette
    var colors = d3.scaleOrdinal()
        .range(["#2EC4B6", "#E71D36", "#FF9F1C"])
        .domain(keys);

    // Create groups for data
    var group = svg.selectAll("g.layer")
        .data(d3.stack().keys(keys)(data), d => d.key)

    group.exit().remove()

    // Color the groups according to color palette
    group.enter().append("g")
        .classed("layer", true)
        .attr("fill", d => colors(d.key));

    // Create stacked bars
    var bars = svg.selectAll("g.layer").selectAll("rect")
        .data(d => d, e => e.data.Country);

    bars.exit().remove()

    bars.enter().append("rect")
        .attr("width", xAxisScale.bandwidth())
        .merge(bars)
        .attr("x", d => xAxisScale(d.data.Country))
        .attr("y", d => yAxisScale(d[1]))
        .attr("height", d => yAxisScale(d[0]) - yAxisScale(d[1]))
        .append("svg:title")
        .text(d => d[1] - d[0] + " deaths")

    // Label the bars on x-axis
    var text = svg.selectAll(".text")
        .data(data, d => d.Country);

    text.exit().remove()

    text.enter().append("text")
        .attr("class", "text")
        .attr("text-anchor", "middle")
        .merge(text)
        .attr("x", d => xAxisScale(d.Country) + xAxisScale.bandwidth() / 2)
        .attr("y", height - (margin.top))
        .text(d => d.Country)

    // Setup title for color legend
    svg.append("text")
        .attr("x", width + margin.top)
        .attr("y", margin.top)
        .attr("font-weight", "bold")
        .style("text-anchor", "start")
        .text("Causes of Death");

    // Setup legend
    // Code used for reference:
    // http://bl.ocks.org/mstanaland/6100713
    // https://bl.ocks.org/flacoman91/050cb74d729c97ae75139673222269f7
    var legend = svg.selectAll(".legend")
        .data(keys.slice())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(30," + i * 20 + ")";
        });

    // Create color swatches
    legend.append("rect")
        .attr("x", width - 18)
        .attr("y", margin.top + 15)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d, i) {
            switch (i) {
                case 0:
                    return "#2EC4B6";
                case 1:
                    return "#E71D36";
                case 2:
                    return "#FF9F1C";
            }
        });

    // Label color swatches
    legend.append("text")
        .attr("x", width + 5)
        .attr("y", margin.top + 23)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d, i) {
            switch (i) {
                case 0:
                    return "Maternal Deaths";
                case 1:
                    return "Cervical Cancer Deaths";
                case 2:
                    return "Breast Cancer Deaths";
            }
        });
}