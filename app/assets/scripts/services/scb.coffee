scb = ($http) ->
  births: (() ->
    url = 'http://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0101/BE0101H/FoddaK'
    data: () ->
      request = {
        url: url,
        data: {"query":[{"code":"Region","selection":{"filter":"item","values":["00"]}},{"code":"Kon","selection":{"filter":"all","values":["*"]}}],"response":{"format":"json"}},
        headers: {"Content-Type":"text/plain"}, # to avoid OPTION request
        method: "POST"
      }
      $http(request).then (response) ->
        addEntryByGender = (obj, entry) ->
          gender = entry.key[1]
          genderStats = obj[gender] || {}
          genderStats[entry.key[2]] = +entry.values[0]
          obj[gender] = genderStats
          obj
        response.data.data.reduce(addEntryByGender, {})
  )(),
  names: (() ->
    url = "http://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0001/BE0001T05AR"
    formatData = (table) ->
      columns = table.columns
      addEntry = (arr, entry) ->
        addKey = (key, value, i) -> key[columns[i].code] = value; key
        key = entry.key.reduce(addKey, {})
        value = entry.values[0]
        arr.push(key: key, value: +value) unless value == '..'
        arr
      table.data.reduce(addEntry, [])
    formatMeta = (data) ->
      addVariable = (variables, variable) ->
        addValueMapping = (values, value, i) ->
          values[value] = variable.valueTexts[i]
          values
        variables[variable.code] = variable.values.reduce(addValueMapping, {})
        variables
      variables: data.variables.reduce(addVariable, {})
    meta = undefined
    getData = (filterValues) ->
      request = {
        url: url,
        data: {"query":[{"code":"Tilltalsnamn","selection":{"filter":"item","values":filterValues}},{"code":"ContentsCode","selection":{"filter":"item","values":["BE0001AJ"]}}],"response":{"format":"json"}},
        headers: {"Content-Type":"text/plain"}, # to avoid OPTION request
        method: "POST"
      }
      $http(request).then((response) -> formatData(response.data))
    getMeta = () ->
      meta ?= $http.get(url).then((response) -> formatMeta(response.data))
    data: getData
    meta: getMeta
  )()

angular.module('names').factory('scb', ['$http', scb])
