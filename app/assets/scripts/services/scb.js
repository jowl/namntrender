var module = angular.module('names');

module.factory('scb', ['$http', function($http) {
  var parseDate = d3.time.format("%Y").parse;
  return {
    births: (function(){
      var url = 'http://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0101/BE0101H/FoddaK';
      return {
        data: function() {
          return $http({
            "url": url,
            "data": {"query":[{"code":"Region","selection":{"filter":"item","values":["00"]}},{"code":"Kon","selection":{"filter":"all","values":["*"]}}],"response":{"format":"json"}},
            "headers": {"Content-Type":"text/plain"},
            "method": "POST"
          }).then(function(response) {
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
      return {
        data: function(filterValues) {
          return $http({
            "url": url,
            "data": {"query":[{"code":"Tilltalsnamn","selection":{"filter":"item","values":filterValues}},{"code":"ContentsCode","selection":{"filter":"item","values":["BE0001AJ"]}}],"response":{"format":"json"}},
            "headers": {"Content-Type":"text/plain"},
            "method": "POST"
          }).then(function(response) {
            var columns = response.data.columns;
            var data = response.data.data.reduce(function(acc, curr) {
              var key = curr.key.reduce(function(key, value, i){
                key[columns[i].code] = value;
                return key;
              }, {});

              var value = curr.values[0];
              if ( value != '..' ) {
                acc.push({key: key, value: parseInt(value)});
              }
              return acc;
            }, []);
            return data;
          });
        },
        names: function() {
          return $http({
            "url": url,
            "method": "GET"
          }).then(function(response) {
            var tilltalsnamn = response.data.variables.reduce(function(prev, curr) { return prev || (curr.code == "Tilltalsnamn" && curr) }, false);
            return tilltalsnamn.values.reduce(function(prev, curr, i) {
              if (curr[1] != '0' ) {
                prev[curr] = tilltalsnamn.valueTexts[i]
              }
              return prev
            }, {});
          });
        }
      }
    })()
  };
}]);
