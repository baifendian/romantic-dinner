angular.module('dinner.controllers', [])
  .controller('HomeCtrl', function($scope, Base, $location, $timeout, Order) {
    document.title = '约饭';
    $scope.list = [];
    Order.getList({}, function(data) {
      $scope.list = data
    }, function(msg) {
      console.log(msg)
    })
    $scope.goOrderinfo = function(order) {
      $location.path("/orderinfo/" + order.id);
    }
  })
  .controller('StartupCtrl', function($scope, $location, $timeout, Base, Order, Food) {
    document.title = '发起拼单';
    var harfHousr = 1000 * 60 * 30
    var now = +new Date()
    var time = new Date()
    time.setTime(now + harfHousr);
    $scope.isBase = false;
    $scope.price = "";
    $scope.couponPrice = "";
    $scope.platformId = 2;
    $scope.platformName = "饿了么";
    $scope.userFoodList = [];
    $scope.couponList = [{
      isActive: false,
      price: "20-5"
    }, {
      isActive: false,
      price: "30-10"
    }, {
      isActive: false,
      price: "40-15"
    }, {
      isActive: false,
      price: "50-25"
    }];
    $scope.form = {
      platformId: 2,
      platformName: '饿了么',
      shopName: '',
      coupons: [],
      stepFee: 20,
      outsideFee: 4,
      userName: 'test',
      orderTime: time,
      food: '',
      num: 1,
      price: '',
      packageFee: 1
    }

    $scope.addPlatform = function() {
      $scope.form.platformId = $scope.platformId;
      $scope.form.platformName = $scope.platformName;
    }

    $scope.selectPlatform = function(id, name) {
      $scope.platformId = id;
      $scope.platformName = name;
    }

    $scope.addCoupon = function(coupon) {
      coupon.isActive = !coupon.isActive;
    }

    $scope.removeCoupon = function(coupon) {
      var coupons = $scope.couponList;
      for (var i = coupons.length - 1; i >= 0; i--) {
        var cou = coupons[i];
        if (cou.price.split("-")[0] == coupon.price.split("-")[0]) {
          coupons.splice(i, 1);
          break;
        }
      }
    }

    $scope.addCouponPrice = function() {
      uniqCoupons({
        isActive: true,
        price: $scope.price + "-" + $scope.couponPrice
      })
    }

    function uniqCoupons(coupon) {
      var coupons = $scope.couponList;
      $scope.removeCoupon(coupon)
      coupons.push(coupon)
    }
    $scope.showBase = function() {
      $scope.isBase = !$scope.isBase;
    }
    $scope.clickme = function() {
      $('#modal1').openModal();
    }
    $scope.openMjyhModal = function() {
      $('#modal2').openModal();
    }
    $scope.addFood = function() {
      var food = {
        userName: $scope.form.userName,
        telphone: '',
        price: $scope.form.price,
        food: $scope.form.food,
        packageFee: $scope.form.packageFee,
        num: $scope.form.num
      };

      if ($scope.form.food.trim() == '') {
        Materialize.toast('请填写菜品！', 2000)
        return;
      }
      if ($scope.form.price == "" || isNaN($scope.form.price)) {
        Materialize.toast('请填写单价！', 2000)
        return;
      }
      if (!$scope.form.num || isNaN($scope.form.num)) {
        Materialize.toast('请填写份数！', 2000)
        return;
      }

      $scope.userFoodList.push(food);
      resetForm();
    }

    $scope.removeFood = function(index) {
      $scope.userFoodList.splice(index, 1);
    }

    function resetForm() {
      $scope.form.price = '';
      $scope.form.food = '';
      $scope.form.num = 1;
    }

    $scope.saveFoodAll = function() {
      var isActive = false;
      if ($scope.userFoodList.length == 0) {
        Materialize.toast('请填写菜品！', 2000)
        return;
      }
      if ($scope.form.shopName.trim() == '') {
        Materialize.toast('请填写店铺名称！', 2000)
        return;
      }
      var coupons = $scope.couponList;
      for (var i = coupons.length - 1; i >= 0; i--) {
        var cou = coupons[i];
        if (cou.isActive) {
          isActive = true
          break;
        }
      }
      if (!isActive) {
        Materialize.toast('请选择满减优惠！', 2000)
        return;
      }
      if (isNaN($scope.form.stepFee)) {
        Materialize.toast('请填写起送费！', 2000)
        return;
      }
      if (isNaN($scope.form.outsideFee)) {
        Materialize.toast('请填写配送费！', 2000)
        return;
      }
      if (!$scope.form.orderTime) {
        Materialize.toast('请填写下单时间！', 2000)
        return;
      }

      $scope.form.coupons = [];
      for (var j = coupons.length - 1; j >= 0; j--) {
        var cou = coupons[j];
        if (cou.isActive) {
          $scope.form.coupons.push(cou.price)
        }
      }

      Order.save($scope.form, function(data, json) {
        for (var k = 0; k < $scope.userFoodList.length; k++) {
          $scope.userFoodList[k].orderId = json.id;
          $scope.userFoodList[k].userName = $scope.form.userName;
          $scope.userFoodList[k].packageFee = $scope.form.packageFee;
        }

        Food.save({
          foods: $scope.userFoodList
        }, function(data) {
          $location.path("/orderinfo/" + json.id)
        }, function(msg) {
          console.log(msg)
        })
      }, function(msg) {
        console.log(msg)
      })
    }
  })
  .controller('MyOrderCtrl', function($scope, $timeout) {})
  .controller('OrderCtrl', function($scope, $routeParams, $timeout, $location, Base, Food) {
    document.title = '拼单';
    var id = $routeParams.id;
    var userName = $routeParams.username || '';
    $scope.orderId = id;
    $scope.userFoodList = [];
    $scope.form = {
      orderId: id,
      userName: userName,
      telphone: '',
      price: '',
      food: '',
      packageFee: 1,
      num: 1
    }

    $scope.addFood = function() {
      var food = {};
      Base.apply(food, $scope.form);


      /*if ($scope.form.userName.trim() == '') {
        Materialize.toast('请填写姓名！', 2000)
        return;
      }
      if ($scope.form.telphone.trim() == '') {
        Materialize.toast('请填写联系电话！', 2000)
        return;
      }*/
      if ($scope.form.food.trim() == '') {
        Materialize.toast('请填写菜品！', 2000)
        return;
      }
      if ($scope.form.price == "" || isNaN($scope.form.price)) {
        Materialize.toast('请填写单价！', 2000)
        return;
      }
      if (!$scope.form.packageFee || isNaN($scope.form.packageFee)) {
        Materialize.toast('请填写餐盒费！', 2000)
        return;
      }
      if (!$scope.form.num || isNaN($scope.form.num)) {
        Materialize.toast('请填写份数！', 2000)
        return;
      }
      $scope.userFoodList.push(food);
      resetForm();
    }

    $scope.removeFood = function(index) {
      $scope.userFoodList.splice(index, 1);
    }

    function resetForm() {
      $scope.form = {
        orderId: id,
        userName: $scope.form.userName,
        telphone: $scope.form.telphone,
        price: '',
        food: '',
        packageFee: 1,
        num: 1
      }
    }

    $scope.saveFoodAll = function() {
      if ($scope.userFoodList.length == 0) {
        Materialize.toast('请填写菜品！', 2000)
        return;
      }
      Food.save({
        foods: $scope.userFoodList
      }, function(data, json) {
        $location.path("/orderinfo/" + id)
      }, function(msg) {
        console.log(msg)
      })
    }
  })
  .controller('OrderInfoCtrl', function($scope, $routeParams, $timeout, $location, Order) {
    document.title = '拼单详情';
    var id = $routeParams.id;
    $scope.orderId = id;
    $scope.shop = {};
    $scope.personList = [];
    $scope.isCumpute = true;
    $scope.orderList = [];
    $scope.foodList = [];
    $scope.cheaps = 0;
    $scope.totalMoney = 1

    $(document).ready(function() {
      $('ul.tabs').tabs();
      $('.collapsible').collapsible({
        accordion: false
      });
    });

    Order.getShop({
      order: id
    }, function(data) {
      $scope.shop = data.data[0]
      $scope.loginName = data.username
      Order.getPerson({
        order: id
      }, function(data) {
        $scope.personList = data;
        $scope.totalMoney = 0;
        for (var i = 0; i < data.length; i++) {
          $scope.totalMoney += data[i].price;
        }
        for (var j = 0; j < data.length; j++) {
          var person = data[j];
          //person.cheap = (person.price/totalMoney*cheaps)-(shop.outside_fee * orderList.length/personList.length)
          //$scope.totalMoney += person.price;
        }
        Order.cumpute({
          order: id
        }, function(data) {
          //$scope.foodList = data.foods;
          $scope.cheaps = data.cheaps;
          var foods = data.foods
          var orders = data.orders || []
          $scope.isCumpute = false;
          for (var i = 0; i < orders.length; i++) {
            var prices = orders[i].num.split("、");
            var foodOrder = []
            for (var j = 0; j < prices.length; j++) {
              var price = prices[j]
              for (var k = 0; k < foods.length; k++) {
                var food = data.foods[k]
                if (price == parseInt(food.price) && food.num > 0) {
                  foodOrder.push({
                    "food": food.food,
                    "price": price,
                    "num": 1
                  })
                  foods.num -= 1;
                  break;
                }
              }
            }
            orders[i].foods = foodOrder
          }
          $scope.orderList = orders;
        }, function(msg) {
          console.log(msg)
          $scope.isCumpute = false;
        })
      }, function(msg) {
        console.log(msg)
      })
    }, function(msg) {
      console.log(msg)
    })

    $scope.showOrderInfo = function() {
      Materialize.showStaggeredList('#staggered-test');
    }

  })