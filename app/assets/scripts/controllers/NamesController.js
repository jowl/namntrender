var NamesController = function($scope, $http, $q, $timeout, scb) {
  $scope.series = {};
  $scope.filterValues = [];
  $scope.loadNames = function(query) {
    var extractNames = function(meta) {
      var names = meta.variables.Tilltalsnamn;
      var matches = [];
      for ( var id in names ) {
        if ( id[1] == '0' ) { // names on the top 10 list (dups)
          continue;
        }
        var name = names[id];
        if ( name.toLowerCase().indexOf(query.toLowerCase()) > -1  ) {
          matches.push({id: id, name: name});
        }
      }
      return matches;
    };
    return scb.names.meta().then(extractNames);
  };
  var loadSeries = function() {
    var buildSeries = function(data) {
      var parseDate = d3.time.format("%Y").parse;
      var seriesMeta = {}
      seriesMeta.dateRange = [];
      seriesMeta.valueRange = [];
      var metrics = data.metrics.reduce(function(metrics, d) {
        var year = d.key.Tid;
        var id = d.key.Tilltalsnamn;
        var series = metrics[id] || [];
        var entry = {date: parseDate(year), ratio: d.value / data.births[id[0]][year]};
        series.push(entry);
        if ( typeof seriesMeta.dateRange[0] == "undefined" || seriesMeta.dateRange[0] > entry.date ) { seriesMeta.dateRange[0] = entry.date }
        if ( typeof seriesMeta.dateRange[1] == "undefined" || seriesMeta.dateRange[1] < entry.date ) { seriesMeta.dateRange[1] = entry.date }
        if ( typeof seriesMeta.valueRange[0] == "undefined" || seriesMeta.valueRange[0] > entry.ratio ) { seriesMeta.valueRange[0] = entry.ratio }
        if ( typeof seriesMeta.valueRange[1] == "undefined" || seriesMeta.valueRange[1] < entry.ratio ) { seriesMeta.valueRange[1] = entry.ratio }
        metrics[id] = series;
        return metrics;
      }, {});
      seriesMeta.names = data.meta.variables.Tilltalsnamn;
      $scope.series = {metrics: metrics, meta: seriesMeta};
    }
    var promises = {
      metrics: scb.names.data($scope.filterValues.map(function(item){return item.id})),
      meta: scb.names.meta(),
      births: scb.births.data()
    }
    $q.all(promises).then(buildSeries);
  }
  $scope.$watch('filterValues.length', loadSeries);
}

angular.module('names').controller("NamesController", ["$scope", "$http", '$q', '$timeout', 'scb', NamesController]);
