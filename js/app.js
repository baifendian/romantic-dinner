// Zhaoshangzhengquan App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'dinner' is the name of this angular module example (also set in a <body> attribute in index.html)
// 'dinner.services' is found in services.js
// 'dinner.controllers' is found in controllers.js
var app = angular.module('dinner', ['ngRoute', 'dinner.services', 'dinner.controllers', 'dinner.directives', 'dinner.filters']);
app.config(function($routeProvider, $httpProvider) {
  $httpProvider.defaults.withCredentials = true;
  // uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $routeProvider
    .when('/home', {
      controller: 'HomeCtrl',
      templateUrl: './templates/home.html'
    })
    .when('/startup', {
      controller: 'StartupCtrl',
      templateUrl: './templates/startup.html'
    })
    .when('/myorder', {
      controller: 'MyOrderCtrl',
      templateUrl: './templates/myorder.html'
    })
    .when('/order/:id', {
      controller: 'OrderCtrl',
      templateUrl: './templates/order.html'
    })
    .when('/order/:id/:username', {
      controller: 'OrderCtrl',
      templateUrl: './templates/order.html'
    })
    .when('/orderinfo/:id', {
      controller: 'OrderInfoCtrl',
      templateUrl: './templates/orderinfo.html'
    })
    .otherwise({
      redirectTo: '/home'
    });
})