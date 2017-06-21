var PADDING = 50;
var GRAPH_RADIUS = 400;
var CANVAS_WIDTH = GRAPH_RADIUS * 2 + PADDING;
var CANVAS_HEIGHT = GRAPH_RADIUS * 2 + PADDING;


var levels = d3.range(0, 11, 1);
console.log(levels);

var radius = d3.scaleLinear()
    .domain([0,10])
    .range([0,GRAPH_RADIUS]);


var getAreaTitle = function (area) { return area.title; };
var areaTitles = data.map(getAreaTitle);

var areaColor = d3.scaleOrdinal(d3.schemeCategory20)
    .domain(areaTitles);

// I'm too lazy to calculate the startAngle and endAngle for areas
var areasPie = d3.pie()
    .sort(null) // default sort was by value descending. (?! WTF)
    .value(1);

var maxRadius = radius(d3.max(levels));

var areaHighlightSector = d3.arc()
    .innerRadius(0)
    .outerRadius(maxRadius); // generalized max radius of the highlight sector

// console.debug(maxRadius);
// console.debug(areasPie(data));
// console.debug(areaHighlightSector(areasPie(data)[0]));

var areaColorFromData = function (data) { return areaColor(getAreaTitle(data.data)); };

var areaAchievedSector = d3.arc()
    .innerRadius(0)
    .outerRadius(function (data) { return radius(data.data.level); });

var circleAroundGraph = d3.arc()
    .innerRadius(0)
    .outerRadius(maxRadius)
    .startAngle(0)
    .endAngle(Math.PI * 2);

var topHalfOfCircleAroundGraph = d3.arc()
    .innerRadius(0)
    .outerRadius(maxRadius)
    .startAngle(-(Math.PI) / 2)
    .endAngle(Math.PI / 2);

var bottomHalfOfCircleAroundGraph = d3.arc()
    .innerRadius(0)
    .outerRadius(maxRadius)
    .startAngle(Math.PI * 3/2)
    .endAngle(Math.PI / 2);

var canvas = d3
    .select('body')
    .append('svg')
    .attr('width', CANVAS_WIDTH)
    .attr('height', CANVAS_HEIGHT);

var graph = canvas.append('g')
    .attr('transform', 'translate(' + (GRAPH_RADIUS + PADDING / 2) + ',' + (GRAPH_RADIUS + PADDING / 2) + ')');

// The next gradient will be used for pieces inside `g` defined above, which was translated by GRAPH_RADIUS / 2 pixels
// down and right. This means that the _origin point_ is now at (425, 425) inside the `<svg></svg>` viewport.
var gradient = canvas.append('defs')
    .append('radialGradient')
    .attr('id', 'AchievedHighlight')
    .attr('cx', '0%')
    .attr('cy', '0%')
    .attr('r', '100%')
    .attr('gradientUnits', 'userSpaceOnUse'); // use the same global gradient for all elements referencing it.

gradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', 'violet');

gradient
    .append('stop')
    .attr('offset', '50%')
    .attr('stop-color', 'gold');

graph.selectAll('.radial-ruler')
    .data(levels)
    .enter()
    .append('circle')
    .attr('class', function (data) { return data < d3.max(levels) ? 'radial-ruler' : 'radial-ruler radial-ruler--max-level'; })
    .attr('r', radius);

graph.append('path')
    .attr('class', 'invisible-text-path')
    .attr('d', circleAroundGraph)
    .attr('id', 'OuterTextPath');

graph.append('path')
    .attr('class', 'invisible-text-path')
    .attr('d', topHalfOfCircleAroundGraph)
    .attr('id', 'TopHalfOfCircleTextPath');

graph.append('path')
    .attr('class', 'invisible-text-path')
    .attr('d', bottomHalfOfCircleAroundGraph)
    .attr('id', 'BottomHalfOfCircleTextPath');

var areaAngle = function (data) {
    return data.startAngle + (data.endAngle - data.startAngle) / 2;
};

var sectors = graph.selectAll('g.sector')
    .data(areasPie(data))
    .enter()
    .append('g')
    .attr('class', 'sector');

sectors
    .append('path')
    .attr('class', 'area-highlight-sector')
    .style('fill', areaColorFromData)
    .attr('d', areaHighlightSector);

sectors
    .append('path')
    .attr('class', 'area-achieved-sector')
    .style('fill', 'url(#AchievedHighlight)') // use the gradient defined above.
    .attr('d', areaAchievedSector);

sectors
    .append('text')
    .attr('class', 'area-level-label')
    .attr('x', function (data) { return areaAchievedSector.centroid(data)[0]; })
    .attr('y', function (data) { return areaAchievedSector.centroid(data)[1]; })
    .attr('dy', '0.4em') // shift downwards by half its effective glyph height, centering it around the (x,y) point.
    .attr('text-anchor', 'middle') // position the center of the baseline of this text at the (x,y) point.
    .text(function (data) { return data.data.level; });


var isOnBottomHalfOfGraph = function (data) {
    console.debug(data.data.title);
    console.debug('Start: ' + data.startAngle + '; Pi/2: ' + Math.PI / 2);
    console.debug('End: ' + data.endAngle + '; 3Pi/2: ' + Math.PI * 3/2);
    var angle = areaAngle(data);
    return (angle > Math.PI / 2) && (angle < Math.PI * 3/2);
};

var areaLabelShiftOnItsTextPath = function (data) {
    var sourceAngle = areaAngle(data);
    var targetAngle;
    if (isOnBottomHalfOfGraph(data)) { // II and III quadrants
        targetAngle = Math.PI - (sourceAngle - Math.PI / 2);
    } else {
        if (sourceAngle > 0 && sourceAngle < Math.PI / 2) { // I quadrant
            targetAngle = Math.PI / 2 + sourceAngle;
        } else { // IV quadrant
            targetAngle = sourceAngle - Math.PI * 3/2;
        }
    }
    return targetAngle * GRAPH_RADIUS; // circumference length is 2 * Math.PI * r, and it's the max shift. from this I can infer that any angle on the circumference gives us the (angle * radius) shift.
};

var areaLabelTextPathIdRef = function (data) {
    // return '#OuterTextPath';
    return isOnBottomHalfOfGraph(data)
        ? '#BottomHalfOfCircleTextPath'
        : '#TopHalfOfCircleTextPath';
};

var areaLabelShiftFromBaseline = function (data) {
    return isOnBottomHalfOfGraph(data)
        ? '1.5em'
        : '-1em';
};

sectors
    .append('text')
    .attr('class', 'area-label')
    .attr('dx', areaLabelShiftOnItsTextPath) // shift of the text base point by this amount of units.
    .attr('dy', areaLabelShiftFromBaseline)
    .attr('text-anchor', 'middle')
    .append('textPath')
        .attr('xlink:href', areaLabelTextPathIdRef)
        .text(function (data) { return data.data.title; });

var statsRadialLine = d3.lineRadial()
    .angle(areaAngle)
    .radius(function (data) { return radius(data.data.level); })
    .curve(d3.curveLinearClosed);

graph
    .append('path')
    .attr('class', 'stats-radial-line')
    .attr('d', statsRadialLine(areasPie(data)));

var levelPointX = function (data) {
    return Math.cos(areaAngle(data) - (Math.PI / 2)) * radius(data.data.level);
};

var levelPointY = function (data) {
    return Math.sin(areaAngle(data) - (Math.PI / 2)) * radius(data.data.level);
};

sectors
    .on('mouseover', function () {
        d3.select(this).select('.level-point')
            .transition()
            .duration(300)
            .attr('r', 7);
    })
    .on('mouseout', function () {
        d3.select(this).select('.level-point')
            .transition()
            .duration(300)
            .attr('r', 3.5);
    });

sectors
    .append('circle')
    .attr('class', 'level-point')
    .attr('cx', levelPointX)
    .attr('cy', levelPointY)
    .attr('r', 3.5);

