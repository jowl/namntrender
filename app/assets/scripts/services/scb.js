var scb = function($http) {
  return {
    births: (function(){
      var url = 'http://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0101/BE0101H/FoddaK';
      return {
        data: function() {
          var request = {
            "url": url,
            "data": {"query":[{"code":"Region","selection":{"filter":"item","values":["00"]}},{"code":"Kon","selection":{"filter":"all","values":["*"]}}],"response":{"format":"json"}},
            "headers": {"Content-Type":"text/plain"},
            "method": "POST"
          };
          return $http(request).then(function(response) {
            return response.data.data.reduce(function(acc, curr) {
              var gender = curr.key[1];
              var entry = acc[gender] || {};
              entry[curr.key[2]] = parseInt(curr.values[0]);
              acc[gender] = entry;
              return acc;
            }, {});
          });
        }
      };
    })(),
    names: (function() {
      var url = "http://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0001/BE0001T05AR";
      var formatData = function(table) {
        var columns = table.columns;
        var data = table.data.reduce(function(acc, curr) {
          var key = curr.key.reduce(function(key, value, i){
            key[columns[i].code] = value;
            return key;
          }, {});

          var value = curr.values[0];
          if ( value != '..' ) {
            acc.push({key: key, value: +value});
          }
          return acc;
        }, []);
        return data;
      };
      var formatMeta = function(data) {
        var variables = data.variables.reduce(function(variables, variable) {
          variables[variable.code] = variable.values.reduce(function(values, value, i) {
            values[value] = variable.valueTexts[i];
            return values;
          }, {});
          return variables;
        }, {});
        return {variables: variables};
      };
      var meta;
      return {
        data: function(filterValues) {
          var request = {
            "url": url,
            "data": {"query":[{"code":"Tilltalsnamn","selection":{"filter":"item","values":filterValues}},{"code":"ContentsCode","selection":{"filter":"item","values":["BE0001AJ"]}}],"response":{"format":"json"}},
            "headers": {"Content-Type":"text/plain"},
            "method": "POST"
          };
          return $http(request).then(function(response) { return formatData(response.data); });
        },
        meta: function() {
          if ( typeof meta == 'undefined' ) {
            meta = $http.get(url).then(function(response) { return formatMeta(response.data); });
          }
          return meta;
        }
      };
    })()
  };
};

angular.module('names').factory('scb', ['$http', scb]);