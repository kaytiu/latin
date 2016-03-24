require.config({
	paths: {
		'angular'           : '../../journal2/lib/angular/angular.min',
//		'angular-route'     : '../../journal2/lib/angular/angular-route.min',
		'underscore'        : '../underscore/underscore-min'
        
	},
	shim: {
		'angular': {exports: 'angular'},
//		'angular-route': {deps: ['angular']},
		'underscore': {exports: '_'}
	},
	urlArgs: "ver=" + new Date().getTime()
});

requirejs(['angular','underscore'],function (ng,_) {

var attribute_app = ng.module('attribute_module',[]);
	
	attribute_app.factory('Ajax', ['$http', '$q', function($http, $q){
		return {
			post:function(url, data) {
				url += "&token="+ token;
				 data = $.param(data);
				var deferred = $q.defer();  // 声明延后执行，表示要去监控后面的执行  
				$http.post(url, data, {
				    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
				}).success(function(resdata) {
					if(resdata.redirect){
						window.location = resdata.redirect;
						return;
					}
					
					deferred.resolve(resdata); // 声明执行成功，即http请求数据成功，可以返回数据了  
				}).error(function(resdata,status){
					deferred.reject(resdata);  // 声明执行失败，即服务器返回错误  
				});
				return deferred.promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API  
			}
		}
	}]);
	
	attribute_app.factory('Rest', ['Ajax', '$q', function(Ajax, $q){
		return{
			addAttribute:function(data){
				return Ajax.post('index.php?route=catalog/attribute/addAttribute',data);
			},
			getAttributeInfoById:function(data){
				return Ajax.post('index.php?route=catalog/attribute/getAttributeInfoById',data);
			},
			editAttribute:function(data){
				return Ajax.post('index.php?route=catalog/attribute/editAttribute',data);
			},
			delAttribute:function(data){
				return Ajax.post('index.php?route=catalog/attribute/delAttribute',data);
			},
			getGroupListByAttrId:function(data){
				return Ajax.post('index.php?route=catalog/attribute/getGroupListByAttrId',data);
			},
			all: function(obj, success, error) {
                var promises = [];
                var response = {};

                angular.forEach(obj, function(o, i) {
                    promises.push(o.then(function(r){
                        response[i] = r;
                    }, function(e){
                        error(e);
                    }));
                });

                $q.all(promises).then(function(){                	
                    success(response);
                }, function(e){                	
                    error(e);
                });
            }
		}
	}]);
	
	attribute_app.run(['$rootScope', '$location', '$http', 'Rest',  function($rootScope, $location, $http,Rest){
		
		
		$rootScope.attributes = attribute_data.attributes;
		
		
		
		
		//打开属性编辑框，　添加或编辑
		$rootScope.openAttrFormDialog = function(attrObj){
			if(!attrObj){
				attrObj = {};
			}
			$rootScope.attrForm = ng.copy(attrObj);
			
			
			
			if(attrObj.attr_type == '0'){
				$rootScope.attrForm.attr_type_1 = '0'; //自定圆舞曲
			}else{
				$rootScope.attrForm.attr_type_1 = '3';//枚举
			}
			if($rootScope.attrForm.option_value_cn){
				$rootScope.attrForm.attrValues = ng.copy($rootScope.attrForm.option_value_cn.list); //原本属性值列表
			}
		};
		
		
		//编辑属性值
		$rootScope.editAttrValueFun = function(attrValueObj){
			if(!$rootScope.attrForm.operationValue){
				$rootScope.attrForm.operationValue = {};
			}
			$rootScope.attrForm.operationValue = ng.copy(attrValueObj);
		};
		
		//页面保存属性
		$rootScope.saveAttrValue = function(){
			var attrValueObj = $rootScope.attrForm.operationValue;
			var valueslist = $rootScope.attrForm.option_value_cn.list;
			
			var index = _.findIndex(valueslist,{'id':attrValueObj.id});
			$rootScope.attrForm.option_value_cn.list[index] = attrValueObj;
			$rootScope.attrForm.operationValue = {};
		};
		
		//添加属性值
		$rootScope.addAttrValue = function(){
			var attrValueObj = $rootScope.attrForm.operationValue;
			if(_.isEmpty(attrValueObj)){
				return;
			}
			attrValueObj = {
					'option_value_cn': attrValueObj.option_value_cn,
					'option_value': attrValueObj.option_value,
					'id'		:  _.uniqueId('-')
			};
			if(!$rootScope.attrForm.option_value_cn){
				$rootScope.attrForm.option_value_cn = {};
				$rootScope.attrForm.option_value_cn.list = [];
			}
			$rootScope.attrForm.option_value_cn.list.push(attrValueObj);
			$rootScope.attrForm.operationValue = {};
		};
		//删除属性值　
		$rootScope.deleteAttrValue = function(attrValueObj){
			var index = _.findIndex($rootScope.attrForm.option_value_cn.list,{'id':attrValueObj.id});
			$rootScope.attrForm.option_value_cn.list.splice(index,1);
		};
		
		
		//添加属性及属性选项信息
		$rootScope.addAttribute = function(){
			
			if($rootScope.attrForm.attr_type_1 != 0 && $rootScope.attrForm.option_value_cn){
				$rootScope.attrForm.options = $rootScope.attrForm.option_value_cn.list;
			}else{
				$rootScope.attrForm.options = [];
			}
			
			
			if($rootScope.attrForm.attr_type == 2 && $rootScope.attrForm.attr_type_1 == 3){
				$rootScope.attrForm.attr_type = 2; //多选
			}else if($rootScope.attrForm.attr_type_1 == 3){
				$rootScope.attrForm.attr_type = 1; //单选
			}else{
				$rootScope.attrForm.attr_type = 0; //自定义
			}
			
			
			console.log($rootScope.attrForm);
			
			
			Rest.addAttribute($rootScope.attrForm).then(function (response) {
				if(response.results){
					$rootScope.attributes.unshift(response.results);
				}
	        }, function (error) {
	            alert(error);
	        });
		};
		
		
		//修改属性及属性选项信息
		$rootScope.editAttribute = function(){			
			
			var delAttrValues = _.filter($rootScope.attrForm.attrValues, function(attrValue){
				var index = _.findIndex($rootScope.attrForm.option_value_cn.list,{'id':attrValue.id});
				return index < 0;
			});
			
			$rootScope.attrForm.del_options = delAttrValues;
			if($rootScope.attrForm.option_value_cn){
				$rootScope.attrForm.options = ng.copy($rootScope.attrForm.option_value_cn.list);
			}
			
			console.log($rootScope.attrForm);
			
			Rest.editAttribute($rootScope.attrForm).then(function (response) {
				console.log(response);
				if(response.results){
					var index = _.findIndex($rootScope.attributes,{'attr_id':response.results.attr_id});
					$rootScope.attributes[index] = response.results;
				}
	        }, function (error) {
	            console.log(error);
	        });
		};
		
		
		//属性删除检测
		$rootScope.checkDelAttr = function(attrObj){
			$rootScope.attrGroupList = [];
			$rootScope.delAttrObj = {};
			
			if(_.isEmpty(attrObj)){
				return;
			}
			var attrId = attrObj.attr_id;
			
			Rest.getGroupListByAttrId({'attr_id': attrId}).then(function (response) {
				if(response.results && response.results.count > 0){
					$rootScope.attrGroupList = response.results.list;
					$rootScope.delAttrObj = ng.copy(attrObj);
					ng.element('#delAttrDialog').modal('show');
					
				}else{
					$rootScope.delAttribute(attrObj.attr_id);
				}
				
				
	        }, function (error) {
	            alert(error);
	        });
		};
		//删除属性及属性选项
		$rootScope.delAttribute = function(attrId){
			if(!attrId){
				return;
			}
			var attrIds = [];
			attrIds.push(attrId);
			Rest.delAttribute({'attr_ids':attrIds}).then(function (response) {
				if(response.status == 'success'){
					var index = _.findIndex($rootScope.attributes,{'attr_id':attrId});
					$rootScope.attributes.splice(index,1);
					$rootScope.attrGroupList = [];
					$rootScope.delAttrObj = {};
					
				}
	        }, function (error) {
	            console.log(error);
	        });
		};
		
		setTimeout(function(){ng.element('.attr-temp').removeClass('attr-temp');},500);
	}]);
	
	ng.element(document).ready(function () {		
		ng.bootstrap(document, ['attribute_module']);
	});
});