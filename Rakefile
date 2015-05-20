# encoding: utf-8

require 'fileutils'

namespace :install do
  desc 'Combine JS dependencies into public/js/lib.js'
  task :js => [:bower_components] do
    dependencies = [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/angular/angular.js',
      'bower_components/d3/d3.js',
      'bower_components/ng-tags-input/ng-tags-input.js',
    ]
    %x[#{File.expand_path('..', __FILE__)}/node_modules/uglify-js/bin/uglifyjs #{dependencies.join(' ')} --compress --mangle --output public/js/lib.js]
  end

  desc 'Copy CSS dependencies into public/css/'
  task :css => [:bower_components] do
    [
      'bower_components/bootstrap/dist/css/bootstrap.css',
      'bower_components/ng-tags-input/ng-tags-input.css',
      'bower_components/ng-tags-input/ng-tags-input.bootstrap.css',
    ].each do |stylesheet|
      FileUtils.cp(stylesheet, "public/css/#{File.basename(stylesheet)}")
    end
  end

  task :node_packages do
    %x[npm install]
  end

  task :bower_components => [:node_packages] do
    %x[bower install]
  end
end

desc 'Install all JS and CSS dependencies'
task install: ['install:js', 'install:css']
