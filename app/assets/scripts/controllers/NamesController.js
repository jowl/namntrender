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
    var filterIds = $scope.filterValues.map(function(item){return item.id});
    if ( filterIds.length === 0 ) {
      return;
    }
    var buildSeries = function(data) {
      var parseDate = d3.time.format("%Y").parse;
      var addSeries = function(metrics, d) {
        var year = d.key.Tid;
        var id = d.key.Tilltalsnamn;
        var name = data.meta.variables.Tilltalsnamn[id];
        var series = metrics[name] || [];
        var entry = {date: parseDate(year), ratio: d.value / data.births[id[0]][year]};
        series.push(entry);
        metrics[name] = series;
        return metrics;
      }
      $scope.series = data.metrics.reduce(addSeries, {});
    }
    var promises = {
      metrics: scb.names.data(filterIds),
      meta: scb.names.meta(),
      births: scb.births.data()
    }
    $q.all(promises).then(buildSeries);
  }
  $scope.$watch('filterValues.length', loadSeries);
}

angular.module('names').controller("NamesController", ["$scope", "$http", '$q', '$timeout', 'scb', NamesController]);
