/**
 * 数组的相关操作
 */

/**
 * 定义数组的del函数
 */
Array.prototype.del = function(key) {
	for(var i = 0; i < this.length; i++){
		if(this[i] == key) {
			return this.slice(0, i).concat(this.slice(i+1, this.length));
		}
	}
	return this;
};

/**
 * 定义数组的toString函数
 */
Array.prototype.toString = function() {
	if(this.length == 0)
		return null;
	var s = this[0];
	for(var i = 1; i < this.length; i++){
		s = s + "," + this[i];
	}
	return s;
};

/**
 * 定义数组的in_array函数
 */
Array.prototype.in_array = function(e) {
	for (var i = 0; i < this.length && this[i] != e; i++)
		;
	return !(i == this.length);
};

/**
 * 去除数组重复元素
 */
function uniqueArray(data){  
  data = data || [];  
  var a = {};  
  for (var i=0; i<data.length; i++) {  
      var v = data[i];  
      if (typeof(a[v]) == 'undefined'){  
           a[v] = 1;  
      }
  };
  data=[];  
  for (var i in a){  
       data[data.length] = i;  
  }  
  return data;  
}
//type: int
function uniqueArray2(data){  
  data = data || [];  
  var a = {};  
  for (var i=0; i<data.length; i++) {  
      var v = data[i];  
      if (typeof(a[v]) == 'undefined'){  
           a[v] = 1;  
      }
  };
  data=[];  
  for (var i in a){  
       data[data.length] = parseInt(i);  
  }  
  return data;  
}

/**
 * 获取arr1-arr2的差集
 * @param arr1
 * @param arr2
 */
function differenceSet(arr1, arr2){
	arr1 = arr1 || [];
	arr2 = arr2 || [];
	var difference = [];
	for(var i = 0; i < arr1.length; i++){
		if(!arr2.in_array(arr1[i])){
			difference.push(arr1[i]);
		}
	}
	return difference;
}