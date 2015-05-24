angular = require './../../../bower_components/angular/index.js'
ngTagsInput = require 'ng-tags-input'
$ = jQuery = window.jQuery = require 'jquery'

bootstrap = require 'bootstrap'

module = angular.module 'names', ['ngTagsInput']

require './services/scb.coffee'
require './controllers/NamesController.coffee'
require './directives/series.coffee'
