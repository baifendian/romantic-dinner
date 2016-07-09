angular.module("dinner.filters", [])
.filter('relationproject', function() {
    return function(inputArray){
        var array = [];
        for(var i=0;i<inputArray.length;i++) {
            if(inputArray[i].clientId != null) {
                array.push(inputArray[i]);
            }
        }
        return array;
    }
})
.filter('norelationproject', function() {
    return function(inputArray){
        var array = [];
        for(var i=0;i<inputArray.length;i++) {
            if(inputArray[i].clientId == null) {
                array.push(inputArray[i]);
            }
        }
        return array;
    }
});