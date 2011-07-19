// Core bits adapted (stolen) from 
// http://bateru.com/news/2011/03/javascript-standard-deviation-variance-average-functions/
var Stat = (function(window) {
  var getNumWithSetDec = function(num, numOfDec) {
  	var pow10s = Math.pow(10, numOfDec || 0);
  	return (numOfDec)? Math.round(pow10s * num) / pow10s : num;
  }  
  var public = {
    getAverage: function(numArr, numOfDec) {
    	if (!Array.isArray(numArr)) {
    	  return false;
    	}
    	var i = numArr.length;
    	var	sum = 0;
    	while(i--) {
    		sum += numArr[i];
    	}
    	return getNumWithSetDec((sum / numArr.length), numOfDec);
    },
    getVariance: function(numArr, numOfDec) {
    	if (!Array.isArray(numArr)) {
    	  return false;
    	}
    	var avg = public.getAverage(numArr, numOfDec);
    	var i = numArr.length;
    	var v = 0; 
    	while(i--) {
    		v += Math.pow((numArr[i] - avg), 2);
    	}
    	v /= numArr.length;
    	return getNumWithSetDec(v, numOfDec);
    },
    getStandardDeviation: function(numArr, numOfDec) {
    	if(!Array.isArray(numArr)){
    	  return false;
    	}
    	var stdDev = Math.sqrt(public.getVariance(numArr, numOfDec));
    	return getNumWithSetDec(stdDev, numOfDec);
    }
  };
  return public;
})(window);