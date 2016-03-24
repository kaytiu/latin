require.config({
	paths: {
		'angular'           : '../../journal2/lib/angular/angular.min',
		'underscore'        : '../underscore/underscore-min',
        
	},
	shim: {
		'angular': {exports: 'angular'},
		'underscore': {exports: '_'}
	},
	urlArgs: "ver=" + new Date().getTime()
});

requirejs(['angular','underscore'],function (ng,_) {

	var attribute_group_app = ng.module('attribute_group_module',[]);
	
	attribute_group_app.factory('Ajax', ['$http', '$q', function($http, $q){
		return {
			post:function(url, data) {
				url += "&token="+ token;
				data = $.param(data);
				  
				console.log(data);
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
			},
			get:function(url, data) {
				
				url += "&token="+ token;
				console.log(data);
				
				if(data){
					data = $.param(data);
				}else {
					data = '';
				}
				url += '&' + data;
				
				  
				console.log(data);
				var deferred = $q.defer();  // 声明延后执行，表示要去监控后面的执行  
				console.log(url);
				
				 
				$http.get(url, {
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
	
	attribute_group_app.factory('Rest', ['Ajax', '$q', function(Ajax, $q){
		return{
			
			getAttributes:function(data){
				return Ajax.get('index.php?route=catalog/attribute/getAttributeList',data);
			},
			getGroupAttributeOption:function(data){
				return Ajax.get('index.php?route=catalog/attribute_group/getGroupAttributeOption',data);
			},
//			addGroup:function(data){
//				return Ajax.post('index.php?route=catalog/attribute_group/addGroup',data);
//			},
//			getGroupInfo:function(data){
//				return Ajax.post('index.php?route=catalog/attribute_group/getGroupInfo',data);
//			},
//			editGroup:function(data){
//				return Ajax.post('index.php?route=catalog/attribute_group/editGroup',data);
//			},
//			delGroup:function(data){
//				return Ajax.post('index.php?route=catalog/attribute_group/delGroup',data);
//			},
//			copyGroup:function(data){
//				return Ajax.post('index.php?route=catalog/attribute_group/copyGroup',data);
//			},
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
	
	
	
	
	
//	attribute_group_app.service('AttrGrupService', function(Rest){
//		
//		$AttrGrupService = this;
//		
//		
//	});
	
	
	attribute_group_app.controller('AttrController', function ($scope,Rest) {
		
		$scope.filterPYKeys = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
		
		$scope.areaModel = {};
		
		$scope.curAttrObj = {};
		
		
		
		
		
		
		
		var getAllAttrs = function(filterData){
			// 获取所有的属性
			Rest.getAttributes(filterData).then(function (response) {
				console.log(response);
				if(response.results){
					$scope.attributes = response.results.list;
					console.log($scope.attributes);
				}
	        }, function (error) {
	            alert(error);
	        });
		};
		
		// 接受父类的通知
		$scope.$on("areaIdChange",function (event, data) {
			console.log('=========================AttrController on areaIdChange: ');
			console.log(data);
			$scope.areaModel = data;
			$scope.curAttrObj = {};
			getAllAttrs();
		});
		
		
		//属性列表显示过滤
		$scope.showAttrFilter = function(obj){
			var index1 = _.indexOf($scope.areaModel.group_attribute_ids, obj.id); //不在组的其它属性区里
			var index = _.findIndex($scope.areaModel.attribute_list, {id: obj.id}); //不在当前添加的属性区里
			return index1 < 0 && index < 0;
			
		};
		
		
		//过滤 属性 options
		$scope.showOption = function(optionobj){
			var checked = optionobj.checked;
			if(true == checked || checked == '1' || checked == 1){
				return true;
			}
		};
		
		$scope.deleteAttrFilter = function(obj){
			var index = _.findIndex($scope.areaModel.attribute_list, {id: obj.id}); //不在当前添加的属性区里
			return index < 0;
			
		}
		
		
		
		
		
		
		
		
//		//确认属性组区域新增属性集合
//		$scope.confirmAddedAttrs = function(){
//			console.log('confirmAddedAttrs.............');
//			console.log($scope.areaModel);
//			$scope.$emit("updateArea", $scope.areaModel);
//		};
		
		//根据拼音查询属性
		$scope.searchAttrsByPY = function(pykey){
			
			var filterData = {
					'attr_name_py__like': pykey
			};
			getAllAttrs(filterData);
			
		};
		
		var optionsKey = 'options_G[groupId]_Attr[attrId]';
		
		
		//属性操作 添加或编辑属性options
		//actionType  ===> 0 添加属性      ===>1 编辑属性options   =====>2 删除属性
		$scope.opreationAttr = function(actionType,attrId){
			var attrobj;
			var optionsKey = 'options_G'+$scope.areaModel.group_id + 'Attr_' + attrId;
			
			if(actionType == 0){
				attrobj = _.find($scope.areaModel.old_attribute_list, function(obj){return obj.id == attrId;});
				if(!attrobj){
					attrobj = _.find($scope.attributes, function(obj){return obj.id == attrId;});
					attrobj.relate_id = _.uniqueId('-');
				}
			}else if(actionType == 1){
				attrobj = _.find($scope.areaModel.attribute_list, function(obj){return obj.id == attrId;});
			}else if(actionType == 2){
				var index = _.findIndex($scope.areaModel.attribute_list,{'id':attrId});
				$scope.areaModel.attribute_list.splice(index,1);
				$scope.curAttrObj = {};
				return;
			}
			
			
			
			//从服务端 获取 options
			Rest.getGroupAttributeOption({'group_id' : $scope.areaModel.group_id,'attr_id'	: attrId,}).then(function (response) {
				console.log(response);
				if(response && response.results && response.results.total > 0){
					attrobj.attr_options = response.results.list;
					sessionStorage.setItem(optionsKey,ng.toJson(attrobj.attr_options));
					$scope.curAttrObj = attrobj;
					if(actionType == 0){
						$scope.areaModel.attribute_list.push(attrobj);
					}
				}else{
					alert('请先给此属性添加属性options');
				}
				
	        });
			
			
			
//			//从本地session 获取options
//			if(!attrobj.attr_options && sessionStorage && sessionStorage.getItem(optionsKey)){
//				attrobj.attr_options = ng.fromJson(sessionStorage.getItem(optionsKey));
//			}else if(!attrobj.attr_options){ //从服务端 获取 options
//				console.log('从服务端 获取 options');
//				// 获取所有的属性
//				Rest.getGroupAttributeOption({'group_id' : $scope.areaModel.group_id,'attr_id'	: attrId,}).then(function (response) {
//					console.log(response);
//					if(response && response.results && response.results.total > 0){
//						attrobj.attr_options = response.results.list;
//						sessionStorage.setItem(optionsKey,ng.toJson(attrobj.attr_options));
//						$scope.curAttrObj = attrobj;
//						if(actionType == 0){
//							$scope.areaModel.attribute_list.push(attrobj);
//						}
//					}else{
//						alert('请先给此属性添加属性options');
//					}
//					
//		        });
//			}else{
//				if(actionType == 0){
//					$scope.areaModel.attribute_list.push(attrobj);
//				}
//				$scope.curAttrObj = attrobj;
//			}
			
			
			
		}
		
		//添加属性
//		$scope.addAttr = function(attrId){
//			
//			var attrobj = _.find($scope.areaModel.old_attribute_list, function(obj){return obj.id == attrId;});
//			if(!attrobj){
//				attrobj = _.find($scope.attributes, function(obj){return obj.id == attrId;});
//				attrobj.relate_id = _.uniqueId('-');
//			}
//			
//			var optionsKey = 'options_G'+$scope.areaModel.group_id + 'Attr_' + attrId;
//			var hasOptions = false;
//			//从本地session 获取options
//			if(!attrobj.attr_options && sessionStorage && sessionStorage.getItem(optionsKey)){
//				attrobj.attr_options = ng.fromJson(sessionStorage.getItem(optionsKey));
//			}else{
//				hasOptions = true;
//			}
//			
//			//从服务端 获取 options
//			if(!attrobj.attr_options){
//				console.log('从服务端 获取 options');
//				// 获取所有的属性
//				Rest.getGroupAttributeOption({'group_id' : $scope.areaModel.group_id,'attr_id'	: attrId,}).then(function (response) {
//					console.log(response);
//					if(response && response.results && response.results.total > 0){
//						attrobj.attr_options = response.results.list;
//						sessionStorage.setItem(optionsKey,ng.toJson(attrobj.attr_options));
//						$scope.curAttrObj = attrobj;
//						$scope.areaModel.attribute_list.push(attrobj);
//					}else{
//						alert('请先给此属性添加属性options');
//					}
//					
//		        });
//			}else{
//				hasOptions = true;
//			}
//			
//			if(hasOptions){
//				$scope.areaModel.attribute_list.push(attrobj);
//				$scope.curAttrObj = attrobj;
//			}
//			
//			
//			console.log(attrobj);
//			
//			return;
//			
//			$scope.curAttrObj = attrobj;
//			
//			
//			
//			
//			if(!$scope.curAttrObj.attr_options){
//				getOptionsBy({
//					'group_id' : $scope.areaModel.group_id,
//					'attr_id'	: attrId,
//				});
//			}
//			$scope.areaModel.attribute_list.push($scope.curAttrObj);
//			
//			
//			
//			
//		};
//
//		//删除属性
//		$scope.removeAddedAttr = function(attrId){
//			var index = _.findIndex($scope.areaModel.attribute_list,{'id':attrId});
//			$scope.areaModel.attribute_list.splice(index,1);
//			$scope.curAttrObj = {};
//		};
//		
//		//编辑属性组区域的单个属性
//		$scope.editOptions = function(attrId){
//			
//			return;
//			$scope.curAttrObj = _.find($scope.areaModel.attribute_list, function(obj){return obj.id == attrId;});
//			if(!$scope.curAttrObj.attr_options){
//				getOptionsBy({
//					'group_id' : $scope.areaModel.group_id,
//					'attr_id'	: attrId,
//				});
//			}
//			
//		};
//		
//		
//		var getOptionsBy = function(filterData){
//			
//			var key = 'options_'+filterData.group_id + '_' + filterData.attr_id;
//			//判断本地会话是否存在
//			if(sessionStorage && sessionStorage.getItem(key)){
//				$scope.curAttrObj.attr_options = ng.fromJson(sessionStorage.getItem(key));
//				return;
//			}
//			// 获取所有的属性
//			Rest.getGroupAttributeOption(filterData).then(function (response) {
//				console.log(response);
//				if(response.results){
//					$scope.curAttrObj.attr_options = response.results.list;
//					sessionStorage.setItem(key,ng.toJson($scope.curAttrObj.attr_options));
//					
//				}
//				
//	        }, function (error) {
//	            alert(error);
//	        });
//		};
		
		
		
		
	});
	
	attribute_group_app.controller('AttrGroupController', function ($scope,Rest) {
		
		$scope.attrGroupForm = attribute_group_data.attribute_group;
		if(!$scope.attrGroupForm){
			$scope.attrGroupForm = {};
		}
		
		console.log($scope.attrGroupForm);
		
		
		//打开 属性对话框
		$scope.openAddAttrsDialog = function(areaId){
			var areaObj = _.find($scope.attrGroupForm.list,{id:areaId});
			areaObj.$dirty = {};
			if(!_.isString(areaObj.area_name) || areaObj.area_name.trim().length <= 0){
				console.log('no string...')
				areaObj.$dirty = {
						'area_name' : true
				}
				return;
			}
			
			var groupAttrsIds = [];
			_.each($scope.attrGroupForm.list,function(tempArea){
				if(tempArea.attribute_list && tempArea.id != areaId){
					_.each(tempArea.attribute_list,function(tempAttr){
						groupAttrsIds.push(tempAttr.id);
					});
				}
			});
			
			areaObj.group_attribute_ids = groupAttrsIds;
			
			if(!areaObj.old_attribute_list){areaObj.old_attribute_list = ng.copy(areaObj.attribute_list);}
			
			$scope.$broadcast("areaIdChange", ng.copy(areaObj));
			ng.element('#addAttrDialog').modal('show');
		};
		
		
//		// 接收更新属性区域通知
//		$scope.$on("updateArea",function (event, data) {
//			console.log('----------------AttrGroupController on updateArea: ');
//			
//			
//			var areaObj = _.find($scope.attrGroupForm.list,{id:data.id});
//			var sortIndex = 99999;
//			var attrList = ng.copy(data.attribute_list);
//			_.each(attrList,function(attrobj){
//				var tempAttrobj = _.find(areaObj.old_attribute_list,{id:attrobj.id});
//				if(tempAttrobj){
//					attrobj.order_id = tempAttrobj.order_id;
//					attrobj.relate_id = tempAttrobj.relate_id;
//				}else{
//					attrobj.relate_id = _.uniqueId('-');
//				}
//			});
//			areaObj.attribute_list = attrList;
//			ng.element('#addAttrDialog').modal('hide');
//			
//			
//			
//		});
		
		
//		//保存属性组
//		$scope.saveAttrGroup = function(){
//			return;
//	        
//	        
//		};
		
		
		//更新属性 排序
		$scope.updateAttrSortOrder = function (areaobj,attrobj,isUp){
			
			var curAttrId = attrobj.id;
			var previd = ng.element('div[data-attrid="'+curAttrId+'"]').prev().attr('data-attrid');
			var nextid = ng.element('div[data-attrid="'+curAttrId+'"]').next().attr('data-attrid');
			
			if(isUp && previd && previd > 0){
				var prevobj = _.find(areaobj.attribute_list,function(obj){return obj.id == previd;});
				attrobj.order_id = attrobj.order_id - 1;
				prevobj.order_id = attrobj.order_id + 1;
				
			}else if(!isUp && nextid && nextid > 0){
				var nextobj = _.find(areaobj.attribute_list,function(obj){return obj.id == nextid;});
				attrobj.order_id = attrobj.order_id + 1;
				nextobj.order_id = attrobj.order_id - 1;
			}
			
			console.log(attrobj);
		};
		
		//新增属性区域
		$scope.addAttrGroupArea = function(){
			if(!$scope.attrGroupForm.$dirty){
				$scope.attrGroupForm.$dirty = {};
			}
			delete $scope.attrGroupForm.$dirty.addArea;
			
			if(!$scope.attrGroupForm.id || $scope.attrGroupForm.id <= 0){
				$scope.attrGroupForm.$dirty.addArea = true;
				return;
			}
			$scope.attrGroupForm.list.push({
				'area_name' : '',
				'id'		:  _.uniqueId('-'),
				'attribute_list' : []
			});
		};
		
		$scope.removeAttr = function(areaobj,attrobj){
			if(!areaobj.old_attribute_list_del){
				areaobj.old_attribute_list_del = ng.copy(areaobj.attribute_list); 
			}
			areaobj.attribute_list = _.without(areaobj.attribute_list,attrobj);
		};
		
		//过滤删除过滤
		$scope.delAttrFilter = function(attrObj){
			var areaId = $('[data-attrid="'+attrObj.id+'"]').attr('data-areaid');
			if(areaId && areaId >= 0){
				areaobj = _.find($scope.attrGroupForm.list, function(obj){return obj.id == areaId;});
				
				var index = _.findIndex(areaobj.attribute_list, {id: attrObj.id});
				return index < 0;
			}
			return true;
		}
		
		
		
		//过滤 属性 options
		$scope.showOption = function(optionobj){
			var checked = optionobj.checked;
			if(true == checked || checked == '1' || checked == 1){
				return true;
			}
		};
		
	});

	


//	attribute_group_app.run(['$scope','Rest',  function($scope,Rest){
//		
//	}]);
	
	ng.element(document).ready(function () {		
		ng.bootstrap(document, ['attribute_group_module']);
	});
});