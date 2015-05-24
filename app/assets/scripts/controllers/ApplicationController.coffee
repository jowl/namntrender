ApplicationController = ($scope, $q, scb) ->
  namesTable = scb.table('http://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0001/BE0001T05AR')
  birthsTable = scb.table('http://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0101/BE0101H/FoddaK')
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
    namesTable.meta().then(extractNames)
  loadSeries = () ->
    filterIds = $scope.filterValues.map((item) -> item.id)
    if filterIds.length > 0
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
        allSeries = []
        for id, series of data.metrics.reduce(addSeries, {})
          allSeries.push(
            id: id,
            meta: {name: data.meta.variables.Tilltalsnamn[id]},
            series: series
          )
        $scope.series = allSeries
      promises = {
        metrics: namesTable.data(
          {"code":"Tilltalsnamn","selection":{"filter":"item","values":filterIds}},
          {"code":"ContentsCode","selection":{"filter":"item","values":["BE0001AJ"]}},
        ),
        meta: namesTable.meta(),
        births: birthsTable.data(
          {"code":"Region","selection":{"filter":"item","values":["00"]}},
          {"code":"Kon","selection":{"filter":"all","values":["*"]}},
        ),
      }
      $q.all(promises).then(buildSeries)
    else
      $scope.series = []
  $scope.$watch('filterValues.length', loadSeries)

angular.module('name-trends').controller('ApplicationController', ['$scope', '$q', 'scb', ApplicationController])
