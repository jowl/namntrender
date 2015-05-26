angular = require('./../../../bower_components/angular/index.js')
ngTagsInput = require('ng-tags-input')
$ = jQuery = window.jQuery = require('jquery')

bootstrap = require('bootstrap')

module = angular.module('namntrender', ['ngTagsInput'])

require('./services/scb.coffee')
require('./controllers/ApplicationController.coffee')
require('./directives/seriesChart.coffee')
