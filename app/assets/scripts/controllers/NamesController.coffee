NamesController = ($scope, $q, scb) ->
  $scope.series = {}
  $scope.filterValues = []
  $scope.loadNames = (query) ->
    extractNames = (meta) ->
      names = meta.variables.Tilltalsnamn
      matches = []
      for id, name of names
        continue if id[1] == '0' # names on the top 10 list (dups)
        if name.toLowerCase().indexOf(query.toLowerCase()) > -1
          matches.push(id: id, name: name)
      matches
    scb.names.meta().then(extractNames)
  loadSeries = () ->
    filterIds = $scope.filterValues.map((item) -> item.id)
    return if filterIds.length is 0
    buildSeries = (data) ->
      parseDate = d3.time.format('%Y').parse
      addSeries = (metrics, d) ->
        year = d.key.Tid
        id = d.key.Tilltalsnamn
        gender = id[0]
        name = data.meta.variables.Tilltalsnamn[id]
        series = metrics[name] || []
        entry = {
          date: parseDate(year),
          ratio: d.value / data.births[gender][year],
        }
        series.push(entry)
        metrics[name] = series
        metrics
      $scope.series = data.metrics.reduce(addSeries, {})
    promises = {
      metrics: scb.names.data(filterIds),
      meta: scb.names.meta(),
      births: scb.births.data(),
    }
    $q.all(promises).then(buildSeries)
  $scope.$watch('filterValues.length', loadSeries)

angular.module('names').controller('NamesController', ['$scope', '$q', 'scb', NamesController])
