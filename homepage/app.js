var uniqueId  = 1;
define([
    'angular',
    'angular-route',
//    'angular-ls',
//    'angular-strap',
//    'angular-bootstrap',
//    'controllers/index',
//    'directives/index',
//    'services/index'
], function (ng) {
    'use strict';
    
    var app = ng.module('lthomepage', ['ngRoute']);
    
    
/////////////////////////////Factory///////////////////////////////////////////////////////////
    app
    .factory('Url', [function(){
        return {
            generateLink: function(url) {
                var args = Array.prototype.slice.call(arguments).slice(1);
                return args.length ? url + '&' + args.join('&') : url;
            }
        };
    }])
    .factory('Ajax', ['$http', '$q', function($http, $q){
        return {
            get: function(url, data) {
                var deferred = $q.defer();
                $http
                    .get(url, data)
                    .success(function(response){
                    	
                        if (typeof(response) !== 'object') {
                            deferred.reject('Cannot access ' + url);
                        }
                        if(response.status === 'success') {
                            deferred.resolve(response.response);
                        } else {
                            deferred.reject(response.error);
                        }
                    }).error(function(response){
                        deferred.reject(response);
                    });
                return deferred.promise;
            },
            post: function(url, data) {
            	if(typeof(data) === 'object'){
            		var tempdata = data;
            		data = '';
            		for(var key in tempdata){
            			data += key + '=' +tempdata[key] + '&';
            		};
            		data = data.substring(0,(data.length - 1));
            	}
                var deferred = $q.defer();               
                $http
                    .post(url, data)
                    .success(function(response){
                        if (typeof(response) !== 'object') {
                            deferred.reject('Cannot access ' + url);
                        }
                        if(response.status === 'success') {
                            deferred.resolve(response.response);
                        } else {
                            deferred.reject(response.error);
                        }
                    }).error(function(response){
                        deferred.reject(response);
                    });
                return deferred.promise;
            }
        };
    }])
    .factory('Rest', ['Ajax', 'Url', '$q', function(Ajax, Url, $q){
    	return{
    		saveModule: function(data) {
                return Ajax.post(Url.generateLink('index.php?route=catalog/homepage/saveModule', 'token=' + token),data);
            },
    		getModules: function(layoutId) {
                return Ajax.get(Url.generateLink('index.php?route=catalog/homepage/getHomePageModels','layout_id=' + layoutId, 'token=' + token));
            },
            addModuleItem: function(data){
            	return Ajax.post(Url.generateLink('index.php?route=catalog/homepage/addHomePageModelItem', 'token=' + token),data);
            },
            deleteHomePageModelItem: function(data){
            	return Ajax.post(Url.generateLink('index.php?route=catalog/homepage/deleteHomePageModelItem', 'token=' + token),data);
            },
            saveItem: function(data){
            	return Ajax.post(Url.generateLink('index.php?route=catalog/homepage/editHomePageModelItem', 'token=' + token),data);
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
    	};
    }])
    .factory('Service', ['Ajax', 'Url', '$q','Rest', function(Ajax, Url, $q,Rest){
    	return{
    		get : function($scope,layoutId){
    			Rest.getModules(layoutId).then(function (response) {
    				$scope.modules = response;
                }, function (error) {
                    alert(error);
                });
    		},
    		saveModule:function($scope,module){
    			var data = 'homepage_module_id=' + module.homepage_module_id + '&duration=' + module.duration;    			
    			Rest.saveModule(data).then(function (response) {
    				$scope.curModuleId = module.homepage_module_id;
    				$scope.get();    				
                }, function (error) {
                    alert(error);
                });
    		},
    		addItem: function($scope,homepage_module_id){
    			var mkey = null;
    			for(var key in $scope.modules){
    				var module = $scope.modules[key];
    				if(module.homepage_module_id == homepage_module_id){
    					mkey = key;
    					break;
    				}
    			}
    			if(!$scope.modules[mkey].modelItems){
    				$scope.modules[mkey].modelItems = [];
    			}
    			var itemId = $scope.modules[mkey].modelItems.length;
    			var data = 'homepage_module_id=' + homepage_module_id + '&homepage_module_item_id=&name=Item&alttext=&sort_order=&image=/no_image.png&link=';
    			
    			Rest.addModuleItem(data).then(function (response) {
    				$scope.curModuleId = homepage_module_id;
    				$scope.curModuleItemId = 'New';
    				$scope.get();
                }, function (error) {
                    alert(error);
                });
    		},
    		removeItem : function($scope, homepage_module_item_id){
    			var data = 'homepage_module_item_id=' + homepage_module_item_id;
    			Rest.deleteHomePageModelItem(data).then(function (response) {
    				$scope.curModuleId = data.homepage_module_id;
    				$scope.get();
                }, function (error) {
                    alert(error);
                });
    		},
    		saveItem : function($scope, item){
    			var homepage_module_item_id = item.homepage_module_item_id;
    			var val = $('#img_upload_' + homepage_module_item_id).val();
    			if(val){
    				item.image = val;
    			}
    			Rest.saveItem(item).then(function (response) {
    				$scope.curModuleId = item.homepage_module_id;
    				$scope.curModuleItemId = item.homepage_module_item_id;
    				$scope.get();
                }, function (error) {
                    alert(error);
                });
    		},
    		
    		clearImage : function($scope,item){
    			item.thum_image = item.thum_no_image;
    			$('#img_upload_' + item.homepage_module_item_id).val('no_image.png');
    		},
    		selectImage : function($scope,item) {
    			$('#modal-image').remove();

    			var fieldId = 'img_upload_' + item.homepage_module_item_id;
                $.ajax({
                    url: 'index.php?route=common/filemanager&token=' + token + '&target=' + fieldId + '&thumb=' + 'thumb_' + fieldId,
                    dataType: 'html',
                    beforeSend: function() {
                        $('#button-image i').replaceWith('<i class="fa fa-circle-o-notch fa-spin"></i>');
                        $('#button-image').prop('disabled', true);
                    },
                    complete: function() {
                        $('#button-image i').replaceWith('<i class="fa fa-upload"></i>');
                        $('#button-image').prop('disabled', false);
                    },
                    success: function(html) {
                        $('body').append('<div id="modal-image" class="modal">' + html + '</div>');

                        $('#modal-image').modal('show');
                    }
                });
            }
    		
    	};
    }]);
///////////////////////////Factory end///////////////////////////////////////////////////////////
    
    
    
    app.directive('switch', function() {
        return {
            require: '?ngModel',
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<span class="switch-toggle switch-candy" data-ng-transclude></span>',
            link: function(scope, element, attrs, ctrl) {
                var $element = $(element);
                var $input = $element.find('input');
                var name = 'switch-group-' + (uniqueId++);
                $input.attr('name', name);
                $element.addClass('switch-' + $input.length);

                ctrl.$render = function() {
                    if (ctrl.$viewValue === undefined) {
                        ctrl.$setViewValue($element.find('input').first().attr('data-key'));
                    }
                    $element.attr('value', ctrl.$viewValue);
                    $element.find('input[data-key="' + ctrl.$viewValue + '"]').attr('checked', 'checked');
                };

                scope.$on('change', function(e, value) {
                    ctrl.$setViewValue($element.attr('value'));
                });
            }
        };
    })
        .directive('switchOption', function($compile) {
            return {
                restrict: 'E',
                link: function (scope, element) {
                    var $element = $(element);
                    var $parent = $element.parent();
                    var key = $element.attr('key');
                    var value = $element.html();
                    var id = 'switch-option-' + (uniqueId++);

                    var $newElement = $compile('<input id="' + id + '" type="radio" data-key="' + key + '" /><label for="' + id + '" ng-click="setValue(\'' + key + '\')" onclick="">' + value + '</label>')(scope);

                    $element.remove();

                    $parent.append($newElement);

                    $parent.find('a').remove();
                    $parent.append($('<a/>'));

                    scope.setValue = function(value) {
                        $parent.attr('value', value);
                        scope.$parent.$broadcast('change', value);
                        $parent.addClass('t-candy');
                    };
                }
            };
        });
   
    
    app.config(['$routeProvider','$httpProvider', function ($routeProvider,$httpProvider) {
    	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    	$httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
    	 $routeProvider
         .when('/', {
        	 template: 'home'
         })
         .when('/banner/:layoutId', {
             templateUrl: 'view/template/module/homepage/banner.html',
             controller: 'BannerController'
         })
         .when('/scene/:layoutId', {
             templateUrl: 'view/template/module/homepage/banner.html',
             controller: 'BannerController'
         })
         .when('/category/:layoutId', {
             templateUrl: 'view/template/module/homepage/banner.html',
             controller: 'BannerController'
         })
         .when('/brand/:layoutId', {
             templateUrl: 'view/template/module/homepage/banner.html',
             controller: 'BannerController'
         })
        
         .otherwise({redirectTo: '/'});
    }]);
    
    
    app.run(['$rootScope', '$location', function($rootScope, $location){
    	$rootScope.layouts = [{		
    		layoutTitle: 'Banner region',
      	  	layoutCode: 'banner',
    	    layoutId: '1'
    	},
    	{
    		layoutTitle: 'Brand region',
      	  	layoutCode: 'brand',
    	    layoutId: '2'
    	},
    	{
    		layoutTitle: 'Scenario region',
      	  	layoutCode: 'scene',
    	    layoutId: '3'
    	},
    	{
    		layoutTitle: 'Category region',
      	  	layoutCode: 'category',
    	    layoutId: '4'
    	}];
    }]);
    
    
////////////////////////////Controllers////////////////////////////////////////////////////    
    
	app.controller('BannerController', function($scope,$rootScope,$routeParams,Rest,$location,Service) {
		
		if(!$scope.module_open_id){
			$scope.module_open_id = 1;
		}
		$scope.layoutId = $routeParams.layoutId;
		$scope.get = function(){ Service.get($scope,$scope.layoutId);
		setTimeout(function(){
			if($('#ac' + $scope.curModuleId)){
				$('#ac' + $scope.curModuleId).addClass('in');				
				if('New' == $scope.curModuleItemId){
					var newid = 0;
					$('#ac' + $scope.curModuleId).find('.panel-collapse[id^="aci"]').each(function(index,el){
						var tid = Number($(el).attr('id').substr(3));
						if(newid < tid){newid = tid;}
					});
					$('#aci' + newid).addClass('in');					
				}else if($scope.curModuleItemId > 0){
					$('#aci' + $scope.curModuleItemId).addClass('in');
				}
				
			}
			
		},500);
		};
		
		$scope.saveModule = function($event, module){ Service.saveModule($scope,module);};
		
		$scope.addItem = function($event, homepage_module_id){ 
			Service.addItem($scope,homepage_module_id);
		};
		
		$scope.removeItem = function($event, homepage_module_item_id){Service.removeItem($scope,homepage_module_item_id);};
		
		$scope.saveItem = function($event, item){Service.saveItem($scope,item);};
		
		$scope.clearImage = function($event, item){Service.clearImage($scope,item);};
		
		$scope.selectImagecon = function($event, item){Service.selectImage($scope,item);};
		$scope.get();
		
	});
	
	
////////////////////////////Controllers end////////////////////////////////////////////////////
	
//	 
});