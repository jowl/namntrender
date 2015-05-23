d3 = require('d3')

seriesLink = (scope, element, attrs) ->
  element = d3.select(element[0])
  margin = {top: 20, right: 100, bottom: 30, left: 50}
  width = 960 - margin.left - margin.right
  height = 500 - margin.top - margin.bottom
  x = d3.time.scale().range([0, width])
  y = d3.scale.linear().range([height, 0]).domain([0, 0.1])
  xAxis = d3.svg.axis().scale(x).orient("bottom")
  line = d3.svg.line().x((d) -> x(d.date)).y((d) -> y(d.ratio))

  update = () ->
    series = scope.series
    element.selectAll('*').remove()
    return unless d3.keys(series.metrics).length > 0
    svg = element
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("class", "graph")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    x.domain(series.meta.dateRange)
    y.domain(series.meta.valueRange)
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

    color = d3.scale.category10().domain(d3.keys(series.metrics))

    slice = svg.selectAll(".slice")
      .data(d3.entries(series.metrics))
      .enter().append("g")
      .attr("class", "slice")

    slice.append("path")
      .attr("class", "line")
      .attr("d", (d) -> line(d.value))
      .style("stroke", (d) -> color(d.key))

    slice.append("text")
      .datum((d) -> {name: d.key, value: d.value[d.value.length - 1]})
      .attr("transform", (d) -> "translate(" + x(d.value.date) + "," + y(d.value.ratio) + ")")
      .attr("x", 3)
      .attr("dy", ".35em")
      .text((d) -> series.meta.names[d.name])

  scope.$watch((() -> scope.series), update, true)

series = () ->
  restrict: 'E'
  scope:
    series: '='
  link: seriesLink

angular.module('names').directive('nameSeries', series)
