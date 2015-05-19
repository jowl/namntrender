(function() {
    var module = angular.module('names', []);

    // module.filter('transform', function() {
    //     return function(object, definition) {
    //         object = extract(definition.key, object);
    //         if (definition.format) {
    //             object = definition.format(object);
    //         }
    //         return object;
    //     };
    // });

    module.factory('scb', ['$http', function($http) {
        var parseDate = d3.time.format("%Y").parse;
        return {
            births: (function(){
                var url = 'http://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0101/BE0101H/FoddaK';
                return {
                    data: function() {
                        return $http({
                            "url": url,
                            "data": {"query":[{"code":"Region","selection":{"filter":"vs:RegionRiket99","values":["00"]}},{"code":"AlderModer","selection":{"filter":"vs:ÅlderTotA","values":["tot"]}},{"code":"Kon","selection":{"filter":"item","values":["1","2"]}}],"response":{"format":"json"}},
                            "headers": {"Content-Type":"text/plain"},
                            "method": "POST"
                        }).then(function(response) {
                            return response.data.data.reduce(function(acc, curr) {
                                var gender = curr.key[2];
                                var entry = acc[gender] || {};
                                entry[parseDate(curr.key[3])] = parseInt(curr.values[0])
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
                    data: function() {
                        return $http({
                            "url": url,
                            "data": {"query":[{"code":"Tilltalsnamn","selection":{"filter":"vs:Pojkar100","values":["1Albin","1Alex"]}},{"code":"ContentsCode","selection":{"filter":"item","values":["BE0001AJ"]}}],"response":{"format":"json"}},
                            "headers": {"Content-Type":"text/plain"},
                            "method": "POST"
                        }).then(function(response) {
                            var names = response.data.data.reduce(function(acc, curr) {
                                var id = curr.key[0];
                                var entry = acc[id] || [];
                                entry.push({date: parseDate(curr.key[1]), count: parseInt(curr.values[0])})
                                acc[id] = entry;
                                return acc;
                            }, {});
                            var res = [];
                            for ( var id in names ) { res.push({id: id, entries: names[id]}) }
                            return res;
                        });
                    },
                    names: function() {
                        return $http({
                            "url": url,
                            "method": "GET"
                        }).then(function(response) {
                            var tilltalsnamn = response.data.variables.reduce(function(prev, curr) { return prev || (curr.code == "Tilltalsnamn" && curr) }, false);
                            return tilltalsnamn.values.reduce(function(prev, curr, i) { prev[curr] = tilltalsnamn.valueTexts[i]; return prev }, {});
                        });
                    }
                }
            })()
        };
    }]);

    module.controller("ApplicationController", ["$scope", "$http", '$q', '$timeout', 'scb', function($scope, $http, $q, $timeout, scb) {
        scb.names.data().then(function(data){
            scb.names.names().then(function(names){
                scb.births.data().then(function(births){
                    var margin = {top: 20, right: 20, bottom: 30, left: 50},
                        width = 960 - margin.left - margin.right,
                        height = 500 - margin.top - margin.bottom;
                    var x = d3.time.scale().range([0, width]);
                    var y = d3.scale.linear().range([height, 0]).domain([0, 0.1]);
                    var xAxis = d3.svg.axis().scale(x).orient("bottom");
                    var line = d3.svg.line().x(function(d) { return x(d.date); }).y(function(d) { return y(d.ratio); });
                    var svg = d3.select("body").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    var minDate, maxDate, minRatio, maxRatio;
                    data = data.map(function(d) {
                        d.entries.forEach(function(e){
                            e.ratio = e.count / births[d.id[0]][e.date];
                            if ( typeof minRatio == "undefined" || minRatio > e.ratio ) { minRatio = e.ratio }
                            if ( typeof maxRatio == "undefined" || maxRatio < e.ratio ) { maxRatio = e.ratio }
                            if ( typeof minDate == "undefined" || minDate > e.date ) { minDate = e.date }
                            if ( typeof maxDate == "undefined" || maxDate < e.date ) { maxDate = e.date }
                        })
                        return d;
                    })
                    x.domain([minDate, maxDate]);
                    y.domain([minRatio, maxRatio]);
                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);
                    data.forEach(function(entry) {
                        svg.append("path")
                            .datum(entry.entries)
                            .attr("class", "line line-1")
                            .attr("title", names[entry.id])
                            .attr("d", line);
                    })
                })
            })
        });
    }]);
})();
