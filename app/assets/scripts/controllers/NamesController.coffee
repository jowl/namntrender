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
      addSeries = (series, d) ->
        id = d.key.Tilltalsnamn
        series[id] ||= []
        year = d.key.Tid
        gender = id[0]
        findEntry = (found, cand) ->
          found || cand.key.Kon == gender && cand.key.Tid == year && cand
        series[id].push(
          date: parseDate(year),
          ratio: d.value / data.births.reduce(findEntry, false).value,
        )
        series
      $scope.series = []
      for id, series of data.metrics.reduce(addSeries, {})
        $scope.series.push(
          id: id,
          meta: {name: data.meta.variables.Tilltalsnamn[id]},
          series: series
        )
    promises = {
      metrics: scb.names.data(filterIds),
      meta: scb.names.meta(),
      births: scb.births.data(),
    }
    $q.all(promises).then(buildSeries)
  $scope.$watch('filterValues.length', loadSeries)

angular.module('names').controller('NamesController', ['$scope', '$q', 'scb', NamesController])
