angular.module("dinner.directives", [])
	.directive('formatDate', function($filter) {
		return {
			require: 'ngModel',
			link: function(scope, elem, attr, ngModelCtrl) {
				ngModelCtrl.$formatters.push(function(modelValue) {
					if (modelValue) {
						return new Date(modelValue)
					}
				})

				ngModelCtrl.$parsers.push(function(value) {
					console.log($filter('date')(value, 'HH:mm'))
					if (value) {
						return $filter('date')(value, 'HH:mm')
					}
				})
			}
		}
	})
	.directive('expander', function() {
		return {
			restrict: "EA",
			replace: true,
			transclude: true,
			scope: {
				title: '=expanderTitle'
			},
			template: '<div>' +
				'<div class="title" ng-click="toggle()">{{title}}</div>' +
				'<div class="body" ng-show="showMe" ng-transclude></div>' +
				'</div>',
			link: function(scope, element, attrs) {
				scope.showMe = false
				scope.toggle = function() {
					scope.showMe = !scope.showMe
				}
			}
		}
	})