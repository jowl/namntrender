d3 = require('d3')

seriesLink = (scope, element, attrs) ->
  element = d3.select(element[0])
  update = () ->
    element.selectAll('*').remove()
    return unless d3.keys(scope.series).length > 0
    margin = {top: 20, right: 100, bottom: 30, left: 50}
    parentRect = element[0][0].parentNode.getBoundingClientRect()
    width = parentRect.width - margin.left - margin.right
    height = 500 - margin.top - margin.bottom
    x = d3.time.scale().range([0, width])
    y = d3.scale.linear().range([height, 0]).domain([0, 0.1])
    xAxis = d3.svg.axis().scale(x).orient("bottom")
    line = d3.svg.line()
      .x((d) -> x(d[scope.seriesX]))
      .y((d) -> y(d[scope.seriesY]))
    svg = element
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("class", "graph")
      .attr("transform", "translate(#{margin.left},#{margin.top})")
    allMetrics = scope.series.reduce(((arr, d) -> arr.concat(d.series)), [])
    x.domain(d3.extent(allMetrics, (d) -> d[scope.seriesX]))
    y.domain(d3.extent(allMetrics, (d) -> d[scope.seriesY]))
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0,#{height})")
      .call(xAxis)

    color = d3.scale.category10().domain(scope.series.map((entry) -> entry.id))

    slice = svg.selectAll(".slice")
      .data(scope.series)
      .enter().append("g")
      .attr("class", "slice")

    slice.append("path")
      .attr("class", "line")
      .attr("d", (d) -> line(d.series))
      .style("stroke", (d) -> color(d.id))

    slice.append("text")
      .datum((d) -> {name: d.meta.name, value: d.series[d.series.length - 1]})
      .attr("transform", (d) -> "translate(#{x(d.value[scope.seriesX])},#{y(d.value[scope.seriesY])})")
      .attr("x", 3)
      .attr("dy", ".35em")
      .text((d) -> d.name)

  scope.$watch((() -> scope.series), update, true)
  d3.select(window).on('resize', update)

seriesChart = () ->
  restrict: 'E'
  scope:
    series: '='
    seriesX: '@'
    seriesY: '@'
  link: seriesLink

angular.module('namntrender').directive('seriesChart', seriesChart)
