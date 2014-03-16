var restaurant = { label: 'Restaurant', pct: [0, 1, 1, 2, 3, 5] },
    buffet = { label: 'Buffet',   pct: [1, 1, 1, 1, 1, 1] },
    date = { label: 'Date',   pct: [1, 1, 0, 0, 0, 0] },
    bigBertha = { label: 'Big Bertha',     pct: [ 88, 1, 1, 2, 3, 5] },

    data = restaurant;

var labels = ['Diner #1', 'Diner #2', 'Diner #3', 'Diner #4', 'Diner #5', 'Diner #6'];

var w = 600,                       // width and height, natch
    h = 600,
    r = Math.min(w, h) / 2,        // arc radius
    dur = 1000,                     // duration, in milliseconds
    color = d3.scale.category10(),
    donut = d3.layout.pie().sort(null),
    arc = d3.svg.arc().innerRadius(0).outerRadius(r - 20);

// ---------------------------------------------------------------------
var svg = d3.select("#sixth-pie").append("svg:svg")
    .attr("width", w).attr("height", h);

var arc_grp = svg.append("svg:g")
    .attr("class", "arcGrp")
    .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

var label_group = svg.append("svg:g")
    .attr("class", "lblGroup")
    .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

// GROUP FOR CENTER TEXT
var center_group = svg.append("svg:g")
    .attr("class", "ctrGroup")
    .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

/*// CENTER LABEL
var pieLabel = center_group.append("svg:text")
    .attr("dy", ".35em").attr("class", "chartLabel")
    .attr("text-anchor", "middle")
    .text(data.label);*/

// DRAW ARC PATHS
var arcs = arc_grp.selectAll("path")
    .data(donut(data.pct));
arcs.enter().append("svg:path")
    .attr("stroke", "white")
    .attr("stroke-width", 0.5)
    .attr("fill", function(d, i) {return color(i);})
    .attr("d", arc)
    .each(function(d) {this._current = d});

// DRAW SLICE LABELS
var sliceLabel = label_group.selectAll("text")
    .data(donut(data.pct));
sliceLabel.enter().append("svg:text")
    .attr("class", "arcLabel")
    .attr("x", r-100)
    .attr("y", 0)
    .attr("transform", function(d) {
            var coordinates = arc.centroid(d);
            var rotationangle = Math.atan(coordinates[1]/coordinates[0])*180/3.1415926;
            if(coordinates[0] < 0) { rotationangle = rotationangle-180; }
            return "rotate(" + rotationangle + ")"; })
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("style", function(d) {
                    if(d.data == 0) { return "font-size: 0;"}
                    else { return "font-size: 32px;"};})
    .text(function(d, i) {return labels[i]; });

// --------- "PAY NO ATTENTION TO THE MAN BEHIND THE CURTAIN" ---------

// Store the currently-displayed angles in this._current.
// Then, interpolate from this._current to the new angles.
function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
        return arc(i(t));
    };
}

// update chart
function updateChart(model) {
    data = eval(model); // which model?

    arcs.data(donut(data.pct)); // recompute angles, rebind data
    arcs.transition().ease("elastic").duration(dur).attrTween("d", arcTween);

    sliceLabel.data(donut(data.pct));
    sliceLabel.transition().ease("elastic").duration(dur)
    .attr("x", r-100)
    .attr("y", 0)
    .attr("transform", function(d) {
            var coordinates = arc.centroid(d);
            var rotationangle = Math.atan(coordinates[1]/coordinates[0])*180/3.1415926;
            if(coordinates[0] < 0) { rotationangle = rotationangle-180; }
            return "rotate(" + rotationangle + ")"; })
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("style", function(d) {
                    if(d.data == 0) { return "font-size: 0;"}
                    else { return "font-size: 32px;"};})
    .text(function(d, i) {return labels[i]; });
        
    //pieLabel.text(data.label);
}

// click handler
$("#options a").click(function() {
    updateChart(this.href.slice(this.href.indexOf('#') + 1));
});


// ----------Spinner Button-----------------------------


var wheel = document.querySelector('svg');
var wheelposition = 0;

wheel.addEventListener('click', onClick, false);



function onClick() {

    this.removeAttribute('style');

    wheelposition = wheelposition + 720 + Math.random()*360;
    //console.log(wheelposition);
    var css = '-webkit-transform: rotate(' + wheelposition + 'deg);'
            + 'transform: rotate(' + wheelposition + 'deg);';

    this.setAttribute(
        'style', css
    );
}