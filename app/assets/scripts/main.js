var angular = require('./../../../bower_components/angular/index.js');
var ngTagsInput = require('ng-tags-input');
var d3 = require('d3');
var $ = jQuery = require('jquery');
var bootstrap = require('bootstrap');

var module = angular.module('names', ['ngTagsInput']);

require('./services/scb.js');
require('./controllers/NamesController.js');
