angular.module("dinner.services", [])
  .factory("Base", function($http, $location) {
    var ip = "http://localhost:8080"
    var base = {}
    base.server = ip
    base.get = function(action, params, callback, failFn) {
      var url = ip + action + "/?callback=JSON_CALLBACK"
      for (var p in params) {
        url += "&" + p + "=" + params[p]
      }
      $http.jsonp(url).success(
        function(json) {
          if (json && json.code == 1) {
            if (typeof callback == "function") {
              callback(json.data, json)
            }
          } else {
            if (typeof failFn == "function") {
              failFn(json)
            }
          }
        }
      )
    }
    base.post = function(action, data, callback, failFn) {
      var url = ip + action + ""
      $http.post(url,
        $.param(data), {
          headers: {
            'withCredentials': true,
            'Content-Type': 'application/x-www-form-urlencoded charset=UTF-8'
          }
        }).success(
        function(json) {
          if (json && json.code === 1) {
            if (typeof callback == "function") {
              callback(json.data, json)
            }
          } else {
            if (typeof failFn == "function") {
              failFn(json)
            }
          }
        }
      ).error(function(data, status, headers, config) {
        failFn()
      })
    }

    base.deepCopy = function(source) {
      var result = {}
      for (var key in source) {
        result[key] = typeof source[key] === 'object' ? base.deepCopy(source[key]) : source[key]
      }
      return result
    }

    base.apply = function(o, c, filter, defaults) {
      if (defaults) {
        base.apply(o, defaults)
      }
      if (o && c && typeof c === 'object') {
        for (var p in c) {
          if (!!c[p] && typeof c[p] === 'object') {
            var val = c[p] instanceof Array ? [] : {}
            o[p] = o[p] || val
            base.apply(o[p], c[p], filter)
          } else {
            if (filter && filter.length > 0) {
              if (filter.indexOf(p) != -1) {} else {
                o[p] = c[p]
              }
            } else {
              o[p] = c[p]
            }
          }
        }
      }
      return o
    }
    return base
  })
  .factory("Order", function($http, $q, $location, Base) {
    var order = {}
    order.getList = function(params, successFn, failFn) {
      Base.get("/api/order", params, successFn, failFn)

    }
    order.getShop = function(params, successFn, failFn) {
      Base.get("/api/order/shop", params, successFn, failFn)
    }
    order.getPerson = function(params, successFn, failFn) {
      Base.get("/api/order/person", params, successFn, failFn)
    }
    order.save = function(params, successFn, failFn) {
      Base.post("/api/order/save", params, successFn, failFn)
    }
    order.cumpute = function(params, successFn, failFn) {
      Base.get("/api/order/cumpute", params, successFn, failFn)
    }
    return order
  })
  .factory("Food", function($http, $q, $location, Base) {
    var food = {}
    food.getList = function(params, successFn, failFn) {
      Base.get("/api/food", params, successFn, failFn)
    }
    food.save = function(params, successFn, failFn) {
      Base.post("/api/food/save", params, successFn, failFn)
    }
    return food
  })