var module = angular.module('names');

module.controller("NamesController", ["$scope", "$http", '$q', '$timeout', 'scb', function($scope, $http, $q, $timeout, scb) {
  $scope.filterValues = []
  $scope.loadNames = function(query) {
    return scb.names.meta().then(function(meta){
      var names = meta.variables.Tilltalsnamn;
      var matches = [];
      for ( var id in names ) {
        var name = names[id];
        if ( name.toLowerCase().indexOf(query.toLowerCase()) > -1  ) {
          matches.push({id: id, name: name});
        }
      }
      return matches;
    });
  };
  $scope.$watch('filterValues.length', function(size) {
    scb.names.data($scope.filterValues.map(function(item){return item.id})).then(function(data){
      scb.names.meta().then(function(meta){
        scb.births.data().then(function(births){
          var margin = {top: 20, right: 100, bottom: 30, left: 50},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;
          var x = d3.time.scale().range([0, width]);
          var y = d3.scale.linear().range([height, 0]).domain([0, 0.1]);
          var xAxis = d3.svg.axis().scale(x).orient("bottom");
          var line = d3.svg.line().x(function(d) { return x(d.date); }).y(function(d) { return y(d.ratio); });
          d3.selectAll(".graph").remove()
          var svg = d3.select("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("class", "graph")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          var minDate, maxDate, minRatio, maxRatio;
          var parseDate = d3.time.format("%Y").parse;
          var series = data.reduce(function(series, d) {
            var year = d.key["Tid"]
            var id = d.key["Tilltalsnamn"];
            var serie = series[id] || [];
            var entry = {date: parseDate(year), ratio: d.value / births[id[0]][year]};
            serie.push(entry);
            if ( typeof minRatio == "undefined" || minRatio > entry.ratio ) { minRatio = entry.ratio }
            if ( typeof maxRatio == "undefined" || maxRatio < entry.ratio ) { maxRatio = entry.ratio }
            if ( typeof minDate == "undefined" || minDate > entry.date ) { minDate = entry.date }
            if ( typeof maxDate == "undefined" || maxDate < entry.date ) { maxDate = entry.date }
            series[id] = serie;
            return series;
          }, {})
          x.domain([minDate, maxDate]);
          y.domain([minRatio, maxRatio]);
          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

          var color = d3.scale.category10().domain(d3.keys(data));

          var slice = svg.selectAll(".slice")
              .data(d3.entries(series))
              .enter().append("g")
              .attr("class", "slice");

          slice.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.value); })
            .style("stroke", function(d) { return color(d.key); });

          slice.append("text")
            .datum(function(d) { return {name: d.key, value: d.value[d.value.length - 1]}; })
            .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.ratio) + ")"; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function(d) { return meta.variables.Tilltalsnamn[d.name]; });
        })
      })
    });
  });
}]);
