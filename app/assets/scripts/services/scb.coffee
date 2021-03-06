scb = ($http) ->
  getData = (url, query) ->
    formatData = (table) ->
      columns = table.columns
      addEntry = (arr, entry) ->
        addKey = (key, value, i) -> key[columns[i].code] = value; key
        key = entry.key.reduce(addKey, {})
        value = entry.values[0]
        arr.push(key: key, value: +value) unless value == '..'
        arr
      table.data.reduce(addEntry, [])
    request =
      url: url
      data:
        query: query
        response:
          format: "json"
      headers:
        "Content-Type": "text/plain" # to avoid OPTION request
      method: "POST"
    $http(request).then((response) -> formatData(response.data))
  meta = {}
  getMeta = (url) ->
    formatMeta = (data) ->
      addVariable = (variables, variable) ->
        addValueMapping = (values, value, i) ->
          values[value] = variable.valueTexts[i]
          values
        variables[variable.code] = variable.values.reduce(addValueMapping, {})
        variables
      variables: data.variables.reduce(addVariable, {})
    meta[url] ?= $http.get(url).then((response) -> formatMeta(response.data))
  table: (url) ->
    data: (query...) ->
      getData(url, query)
    meta: () -> getMeta(url)

angular.module('namntrender').factory('scb', ['$http', scb])
