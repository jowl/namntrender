angular = require './../../../bower_components/angular/index.js'
ngTagsInput = require 'ng-tags-input'
d3 = require 'd3'
$ = jQuery = window.jQuery = require 'jquery'

bootstrap = require 'bootstrap'

module = angular.module 'names', ['ngTagsInput']

require './services/scb.js'
require './controllers/NamesController.js'
