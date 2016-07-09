angular.module("dinner.services", [])
  .factory("Base", function($http, $location) {
    var ip = "http://localhost:8080";
    ip = "http://192.168.173.41:8080";
    var base = {};
    base.server = ip;
    base.get = function(action, params, callback, failFn) {
      var url = ip + action + "/?callback=JSON_CALLBACK";
      for (var p in params) {
        url += "&" + p + "=" + params[p];
      }
      $http.jsonp(url).success(
        function(json) {
          if (json && json.code == 1) {
            if (typeof callback == "function") {
              callback(json.data, json);
            }
          } else {
            if (json.msg == "未登录") {
              $location.path("/login");
              return;
            }
            if (typeof failFn == "function") {
              failFn(json);
            }
          }
        }
      )
    };
    base.post = function(action, data, callback, failFn) {
      var url = ip + action + "";
      $http.post(url,
        $.param(data), {
          headers: {
            //'withCredentials' : true,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        }).success(
        function(json) {
          if (json && json.code === 1) {
            if (typeof callback == "function") {
              callback(json.data, json);
            }
          } else {
            if (typeof failFn == "function") {
              failFn(json);
            }
          }
        }
      ).error(function(data, status, headers, config) {
        failFn();
      });
    }

    base.put = function(action, data, callback, failFn) {
        var url = ip + action + "";
        $http.put(url,
          $.param(data), {
            headers: {
              //withCredentials: false,
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
          }).success(
          function(json) {
            if (json && json.code === 1) {
              if (typeof callback == "function") {
                callback(json.data, json);
              }
            } else {
              if (typeof failFn == "function") {
                failFn(json);
              }
            }
          }
        ).error(function(data, status, headers, config) {
          failFn();
        });
      }
      /*
       * 对象深度拷贝
       */
    base.deepCopy = function(source) {
      var result = {};
      for (var key in source) {
        result[key] = typeof source[key] === 'object' ? base.deepCopy(source[key]) : source[key];
      }
      return result;
    }

    /**
     * 对象拷贝
     * o 新对象
     * c 拷贝对象
     * filter 过滤属性
     * defaults 扩展属性
     */
    base.apply = function(o, c, filter, defaults) {
      if (defaults) {
        base.apply(o, defaults);
      }
      if (o && c && typeof c === 'object') {
        for (var p in c) {
          if (!!c[p] && typeof c[p] === 'object') {
            var val = c[p] instanceof Array ? [] : {};
            o[p] = o[p] || val;
            base.apply(o[p], c[p], filter);
          } else {
            if (filter && filter.length > 0) {
              if (filter.indexOf(p) != -1) {} else {
                o[p] = c[p];
              }
            } else {
              o[p] = c[p];
            }
          }
        }
      }
      return o;
    };
    return base;
  })
  .factory("Order", function($http, $q, $location, Base) {
    var order = {};
    // 订单列表
    order.getList = function(params, successFn, failFn) {
        Base.get("/api/order", params, successFn, failFn);
        //Base.get("/data/orders.json", params, successFn, failFn);
      }
      // 店铺信息
    order.getShop = function(params, successFn, failFn) {
        Base.get("/api/order/shop", params, successFn, failFn);
      }
      // 小伙伴信息
    order.getPerson = function(params, successFn, failFn) {
      Base.get("/api/order/person", params, successFn, failFn);
    }
    order.save = function(params, successFn, failFn) {
      Base.post("/api/order/save", params, successFn, failFn);
    }
    order.cumpute = function(params, successFn, failFn) {
      Base.get("/api/order/cumpute", params, successFn, failFn);
    }
    return order;
  })
  .factory("Food", function($http, $q, $location, Base) {
    var food = {};
    food.getList = function(params, successFn, failFn) {
      Base.get("/api/food", params, successFn, failFn);
    }
    food.save = function(params, successFn, failFn) {
      Base.post("/api/food/save", params, successFn, failFn);
    }
    return food;
  })
  .factory("Chart", function() {
    var chart = {};;
    chart.create = function(el, data, config) {
        var defaultConfig = {
          minNodeSize: 10,
          maxNodeSize: 20,
          edgeColor: 'line',
          lineColor: "#818181",
          enableEdgeHovering: true,
          defaultHoverLabelBGColor: "#616161",
          hoverFont: "微软雅黑",
          labelSize: "fixed",
          defaultLabelSize: 12,
          hoverNodeColor: "#387A82",
          defaultEdgeColor: '#fff'
        };
        if (typeof config == "object") {
          for (var p in config) {
            defaultConfig[p] = config[p]
          }
        }
        var s = new sigma({
          graph: data,
          renderer: {
            container: el,
            type: 'canvas'
          },
          settings: defaultConfig
        });
        //console.log(s.renderers[0]);
        var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);
        return s;
      }
      /*
       * 节点定位
       * 首先对空心圆进行定位，规则为[2,2][7,2][7,7][2,7][5,2][7,5][5,7][2,5]
       * 实心圆单个关系的在空心圆外侧定位，多个关系的在空心圆之间定位
       * nodes : 节点信息
       * edges : 节点间关系信息
       */
    chart.setPosition = function(nodes, edges) {
      var ring = [];
      var circle = [];
      var ringPos = [{
        x: 3,
        y: 3
      }, {
        x: 7,
        y: 3
      }, {
        x: 7,
        y: 7
      }, {
        x: 3,
        y: 7
      }, {
        x: 5,
        y: 3
      }, {
        x: 7,
        y: 5
      }, {
        x: 5,
        y: 7
      }, {
        x: 3,
        y: 5
      }];
      var singleEdges = [];
      var tempNodeObj = {};
      var tempEdgeObj = {};
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        //实心圆
        if (node.color == node.borderColor) {
          circle.push(nodes[i]);
        } else {
          if (ring.length < ringPos.length) {
            var x = ringPos[ring.length].x;
            var y = ringPos[ring.length].y;
            node.x = x;
            node.y = y;
          } else {
            node.x = getScopePos(4, 6);
            node.y = getScopePos(4, 6);
          }
          ring.push(node);
        }
        tempNodeObj[node.id] = node;
      }
      //捋顺关系
      for (var j = 0; j < edges.length; j++) {
        var edge = edges[j];
        var obj = tempEdgeObj[edge.source];
        if (obj) {
          obj.count++;
          obj.source.push(edge.target);
        } else {
          tempEdgeObj[edge.source] = {
            count: 1,
            source: [edge.target]
          }
        }
      }
      for (var p in tempEdgeObj) {
        var circleNode = tempNodeObj[p];
        switch (tempEdgeObj[p].count) {
          case 1:
            var nodeId = tempEdgeObj[p].source[0];
            var ringNode = tempNodeObj[nodeId];
            var newPos = setSingleEdgePos(ringNode.x, ringNode.y);
            circleNode.x = newPos.x;
            circleNode.y = newPos.y;
            break;
          case 2:
            var node1 = tempNodeObj[tempEdgeObj[p].source[0]];
            var node2 = tempNodeObj[tempEdgeObj[p].source[1]];
            var newPos = setTowEdgePos(node1.x, node1.y, node2.x, node2.y);
            circleNode.x = newPos.x;
            circleNode.y = newPos.y;
            break;
          default:
            var len = tempEdgeObj[p].source.length;
            var ns = [];
            for (var i = 0; i < len; i++) {
              ns.push(tempNodeObj[tempEdgeObj[p].source[i]]);
            }
            var newPos = setMutilEdgePos(ns);
            circleNode.x = newPos.x;
            circleNode.y = newPos.y;
            break;
        }
      }
    }

    /*
     * 单个关系节点，在x,y外围定位
     * 
     */
    function setSingleEdgePos(x, y) {
      var pos = {
        x: 5,
        y: 5
      };
      if (x == 3) {
        if (y == 3) {
          pos.x = getScopePos(1.5, 2.5);
          pos.y = getScopePos(1.5, 4.5);
        }
        if (y == 5) {
          pos.x = getScopePos(1.5, 2.5);
          pos.y = getScopePos(4.5, 6.5);
        }
        if (y == 7) {
          pos.x = getScopePos(1.5, 2.5);
          pos.y = getScopePos(6.5, 8.5);
        }
      } else if (x == 5) {
        if (y == 3) {
          pos.x = getScopePos(3.5, 6.5);
          pos.y = getScopePos(1.5, 2.5);
        }
        if (y == 7) {
          pos.x = getScopePos(3.5, 6.5);
          pos.y = getScopePos(7.5, 8.5);
        }
      } else if (x == 7) {
        if (y == 3) {
          pos.x = getScopePos(7.5, 8.5);
          pos.y = getScopePos(1.5, 4.5);
        }
        if (y == 5) {
          pos.x = getScopePos(7.5, 8.5);
          pos.y = getScopePos(4.5, 6.5);
        }
        if (y == 7) {
          pos.x = getScopePos(7.5, 8.5);
          pos.y = getScopePos(6.5, 8.5);
        }
      } else {
        pos.x = getScopePos(x - 2, x + 2);
        pos.y = getScopePos(y - 2, y + 2);
      }
      return pos;

    }
    //两个关系节点定位
    function setTowEdgePos(x1, y1, x2, y2) {
      var pos = {
        x: 5,
        y: 5
      };
      //左上方
      if (x1 < 5 && y1 < 5) {
        //右上方
        if (x2 >= 5 && y2 < 5) {
          pos.x = getScopePos(x1 + 0.5, x2 - 0.5);
          pos.y = getScopePos(0.5, y1 - 0.2);
        }
        //右下方
        if (x2 >= 5 && y2 >= 5) {
          pos.x = getScopePos(x1 + 0.5, x2 - 0.5);
          pos.y = getScopePos(y1 + 0.5, y2 - 0.5);
        }
        //左侧
        if (x2 <= 5 && y2 < 5) {
          pos.x = getScopePos(0, x2 - 0.5);
          pos.y = getScopePos(y1 + 0.5, y2 - 0.5);
        }
      }
      //右上方
      if (x1 >= 5 && y1 < 5) {
        //右下方
        if (x2 >= 5 && y2 >= 5) {
          pos.x = getScopePos(x2 + 0.5, 9);
          pos.y = getScopePos(y1 + 0.5, y2 - 0.5);
        }
        //左下方
        if (x2 < 5 && y2 >= 5) {
          pos.x = getScopePos(5, 9);
          pos.y = getScopePos(y1 + 0.5, y2 - 0.5);
        }
        //左上
        if (x2 < 5 && y2 <= 5) {
          pos.x = getScopePos(x2 + 0.5, x1 - 0.5);
          pos.y = getScopePos(0.5, 5);
        }
      }
      //右下方
      if (x1 >= 5 && y1 >= 5) {
        //左下方
        if (x2 < 5 && y2 > 5) {
          pos.x = getScopePos(x2 + 0.5, x1 - 0.5);
          pos.y = getScopePos(5, 9);
        }
        //左上方
        if (x2 <= 5 && y2 < 5) {
          pos.x = getScopePos(x2 + 0.5, x1 - 0.5);
          pos.y = getScopePos(y2 + 0.5, y1 - 0.5);
        }
        //右侧
        if (x2 > 5 && y2 < 5) {
          pos.x = getScopePos(x2 + 0.5, 9);
          pos.y = getScopePos(y2 + 0.5, y1 - 0.5);
        }
      }
      //左下方
      if (x1 < 5 && y1 >= 5) {
        //左侧
        if (x2 < 5 && y2 <= 5) {
          pos.x = getScopePos(0, x1 - 0.5);
          pos.y = getScopePos(y2 + 0.5, y1 - 0.5);
        }
        //右上
        if (x2 >= 5 && y2 <= 5) {
          pos.x = getScopePos(x1 + 0.5, x2 - 0.5);
          pos.y = getScopePos(y2 + 0.5, y1 - 0.5);
        }
        //右下
        if (x2 >= 5 && y2 > 5) {
          pos.x = getScopePos(x1 + 0.5, x2 - 0.5);
          pos.y = getScopePos(5, 9);
        }

      }
      //console.log(x1, y1, x2, y2, pos);
      return pos;
    }

    //多个关系节点定位
    function setMutilEdgePos(nodes) {
      var pos = {
        x: getScopePos(4, 6),
        y: getScopePos(4, 6)
      };
      var arrX = [];
      var arrY = [];
      for (var i = 0; i < nodes.length; i++) {
        arrX.push(nodes[i].x);
        arrY.push(nodes[i].y);
      }
      var minX = Math.min.apply(null, arrX);
      var maxX = Math.max.apply(null, arrY);
      var minY = Math.min.apply(null, arrY);
      var maxY = Math.max.apply(null, arrY);
      pos.x = (minX + maxX) / getScopePos(1.5, 2.5);
      pos.y = (minY + maxY) / getScopePos(1.5, 2.5);
      return pos;
    }

    /*
     * 随机生成指定区间范围值
     * n < m
     */
    function getScopePos(n, m) {
      //成n-m，不包含n和m的整数：
      //第一步算出 m-n-2的值，假设等于w
      //第二步Math.random()*w
      //第三步Math.random()*w+n +1
      //第四步Math.round(Math.random()*w+n+1) 或者 Math.ceil(Math.random()*w+n+1)
      var w = m - n - 2;
      var s1 = Math.random() * w;
      var s2 = s1 + n + 1;
      return s2
    }

    /*
     * 
     *
     */
    function setPosYByRule(x, y) {

    }
    return chart;
  })
Date.prototype.format = function(format) {
  var o = {
    "M+": this.getMonth() + 1, //month
    "d+": this.getDate(), //day
    "h+": this.getHours(), //hour
    "m+": this.getMinutes(), //minute
    "s+": this.getSeconds(), //second
    "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
    "S": this.getMilliseconds() //millisecond
  }

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
}