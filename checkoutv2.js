
require.config({
	paths: {
		'angular'           : 'angular.min',
		'angular-route'     : 'angular-route.min'
	},
	shim: {
		'angular': {exports: 'angular'},
		'angular-route': {deps: ['angular']}
	},
	urlArgs: "ver=" + ccversion
});

requirejs(['angular','angular-route'],function (ng,ngRoute) {
	
	
	//初始化app
	var app = ng.module('ltcheckout', ['ngRoute']);
	
	app.factory('Ajax', ['$http', '$q', function($http, $q){
		return {
			post:function(url, data) {
				
				$('body').append('<div class="req-loading-bg"></div><div class="req-loading"><i class="fa fa-5x fa-circle-o-notch fa-spin"></i></div>')
				if(typeof(data) == 'object'){
					var pdata = '';
					for(var key in data){
						pdata += key +'=' +data[key] + '&';
					}
					pdata += 'pp=pp';
					data = pdata;
				}
				
				var deferred = $q.defer();  // 声明延后执行，表示要去监控后面的执行  
				$http.post(url, data, {
				    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
				}).success(function(resdata) {
					$('.req-loading-bg').remove();
					$('.req-loading').remove();
					if(resdata.redirect){
						window.location = resdata.redirect;
						return;
					}
					
					deferred.resolve(resdata); // 声明执行成功，即http请求数据成功，可以返回数据了  
				}).error(function(resdata,status){
					$('.req-loading-bg').remove();
					$('.req-loading').remove();
					deferred.reject(resdata);  // 声明执行失败，即服务器返回错误  
				});
				return deferred.promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API  
			}
		}
	}]);
	app.factory('Rest', ['Ajax', '$q', function(Ajax, $q){
		return{
			confirmAddress:function(data){
				return Ajax.post('index.php?route=checkout/checkoutv2/confirm_address',data);
			},
			saveAddress:function(data){
				var url = 'index.php?route=checkout/checkoutv2/add_address';
				if(data.address_id){
					url = 'index.php?route=checkout/checkoutv2/edit_address';				
				}
				return Ajax.post(url,data);
			},
			setDefautlAddress:function(data){
				return Ajax.post('index.php?route=checkout/checkoutv2/set_default_address',data);
			},
			deleteAddress:function(data){
				return Ajax.post('index.php?route=checkout/checkoutv2/delete_address',data);
			},
			
			
			confirmPaymethod:function(data){				
				return Ajax.post('index.php?route=checkout/checkoutv2/confirm_payment_method',data);
			},
			checkProductsStock:function(data){
				return Ajax.post('index.php?route=checkout/checkoutv2/check_stock',data);
			},
			addCoupon:function(data){
				return Ajax.post('index.php?route=checkout/checkoutv2/add_coupon',data);
			},
			changeCoupon:function(data){
				return Ajax.post('index.php?route=checkout/checkoutv2/coupon',data);
			},
			confirmGuest:function(data){
				return Ajax.post('index.php?route=checkout/checkoutv2/guest',data);
			},
			confirmCustomer:function(data){				
				return Ajax.post('index.php?route=checkout/checkoutv2/' + data.action,data);
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
	
	
	app.value('ltccdata',ltccdata);
	
	
	app.service('Coupon', function($rootScope,Rest,ltccdata){
		
		this.entryCouponCode = '';
		this.selectedCoupon = [];
		this.coupons = ltccdata.coupons || [];		
		this.coupon_select_text = this.coupons.length > 0 ? 'Por favor selecciona un cupón' : 'No tienes ningún cupón';
		this.showAddSuccess = false;
		
		this.addCoupon = function($event){
			$coupon.showAddSuccess = false;
			$($event.target).button('loading');
			if(!latinForm.validatorForm($('.coupon-form'))){
				$($event.target).button('reset');
				return;
			}
			
			Rest.addCoupon('coupon=' + $coupon.entryCouponCode).then(function (response) {
				$($event.target).button('reset');
				if(response.error){
					$($event.target).after('<div class="text-danger coupon-errror-danger">'+response.error+'</div>');
					return;
				}
				if(response.coupon_info){
					$coupon.coupons.push(response.coupon_info);
					$coupon.coupon_select_text = 'Por favor selecciona un cupón';
					$coupon.tempCoupon = response.coupon_info;
					$coupon.showAddSuccess = true;
				}
				if(response.total_data){
					$rootScope.pageData.total_data = response.total_data;
					$rootScope.currecyChange();
				}
            }, function (error) {
            	$($event.target).button('reset');
                alert(error);
            });
			
		};
		
		this.changeCoupon=function(){
			var coupon = $coupon.tempCoupon;
			
			$coupon.showAddSuccess = false;
			$('.text-danger').remove();
			
			if(coupon && coupon.code){
				coupon.coupon = coupon.code;
			}
			Rest.changeCoupon(coupon).then(function (response) {
				if(response.error){
					$('.coupon-list').before('<div class="text-danger">'+response.error+'</div>');
				}else{
					$coupon.selectedCoupon = coupon;
				}
				
				if(response.total_data){
					$rootScope.pageData.total_data = response.total_data;
					$rootScope.currecyChange();
				}
				
				
            }, function (error) {
                alert(error);
            });
			
			
		};
		
		var $coupon = this;
		
	});
	
	
		
	app.service('Address', function($rootScope,Rest,ltccdata){
		this.editAddr={};
		this.addresses = ltccdata.addresses || {};
		
		this.formSubmitText = ltccdata.text_agree_address;
		this.formAddSubmitText = ltccdata.text_agree_address;
		this.formEditSubmitText = ltccdata.text_modify_address;
		this.defAddressId = -1;
		if(this.addresses){
			for(var key in this.addresses){
				if(this.addresses[key]['default'] == '1'){
					this.defAddressId = this.addresses[key].address_id;
					break;
				}
			}
		}
		
		this.addrFormTitle_selected = ltccdata.text_address_p_tile;//选择地址标题
		this.addrFormTitle_modify = ltccdata.text_address_p_tile_r; //填写地下标题
		this.addrFormTitle_add = ltccdata.text_address_p_tile_a; //新增地址标题
		this.error_empty_address = ltccdata.error_empty_address;
		
		this.showAddrForm = true;
		this.addressFormTitle = this.addrFormTitle_modify;
		for(var key in this.addresses){
			this.showAddrForm = false;
			this.addressFormTitle = this.addrFormTitle_selected;
			break;
		}
		
		this.customer_address_id = ltccdata.customer_address_id;
		this.selectedAddress = ltccdata.selected_address || {};
		
		this.countries = ltccdata.countries;
		
		
		
		
		//设置国家， 城市 ，区域， 镇
		this.setCZCT = function(addrObj){
			addrObj.country_id = $('#input-shipping-country option:selected').val();
			addrObj.country = $('#input-shipping-country option:selected').text();
			addrObj.zone = $('#input-shipping-zone option:selected').text();
			addrObj.city = $('#input-shipping-city option:selected').text();
			addrObj.town = $('#input-shipping-town option:selected').text();
			addrObj.address_2 = '';
			addrObj.postcode = '';
		};
		this.selectedCls = function(addrid,$index){
			if(!$address.selectedAddress.address_id  && $index ==0){
				$address.selectedAddress = $address.addresses[addrid];
				return true;
			}
			if($address.selectedAddress.address_id == addrid){
				return true;
			}
			
		};
		
		this.address1Change = function(addrObj){
			ng.element('.address1-error').remove();
			var $el = $('.address1-text').next();
			if($el.attr('class') == 'text-danger'){$el.remove();}
			var roomNo = getstring($address.editAddr.addrRoom);
			var buildingNo = getstring($address.editAddr.addrBuildding);
			var streetNo = getstring($address.editAddr.addrStreet);
			
			if(roomNo.length > 0 && (buildingNo.length > 0 || streetNo.length > 0)) roomNo = roomNo + ', ';
			if(buildingNo.length > 0 && streetNo.length > 0) buildingNo = buildingNo + ', ';
			var address1 = roomNo + buildingNo + streetNo;
			if(address1 && address1.length > 120){
				addrObj.address_1 = '';
				ng.element('.address1-text').after('<div class="text-danger address1-error">La dirección debe de ser dentro de 120 caracteres.</div>');
				return;
			}
			addrObj.address_1 = address1;
			
		}
		this.editAddrFun = function(addrObj){
			$address.editAddr = ng.copy($address.addresses[addrObj.address_id]);
			$address.showAddrForm = true;
			$address.formSubmitText = $address.formEditSubmitText;
			
			$address.editAddr.addrRoom='';
			$address.editAddr.addrBuildding='';
			$address.editAddr.addrStreet='';
			if(!$address.editAddr.country_id){
				$address.editAddr.country_id = '1';
			}
			ltDeliverAreas.zone_id = addrObj.zone_id;
			ltDeliverAreas.city_id = addrObj.city_id;
			ltDeliverAreas.town_id = addrObj.town_id;
			$address.addressFormTitle = $address.addrFormTitle_modify;
			setTimeout(function(){$('#input-shipping-country').trigger('change');},100);
		};
		this.hideAddrForm = function(){
			$('div').removeClass('has_error');
			$('.text-danger').remove();
			$address.showAddrForm = false;
			$address.formSubmitText = $address.formAddSubmitText;
			$address.addressFormTitle = $address.addrFormTitle_selected;
		}
		this.addAddrFun = function(){
			$address.editAddr = {};
			ltDeliverAreas.zone_id = -1;
			ltDeliverAreas.city_id = -1;
			ltDeliverAreas.town_id = -1;
			$('#input-shipping-country').trigger('change');
			$address.showAddrForm = true;
			$address.addressFormTitle = $address.addrFormTitle_add;
			
		};
		this.deletAddr = function(addrObj){			
			Rest.deleteAddress(addrObj).then(function (response) {
				if(response.total_data){
					$rootScope.pageData.total_data = response.total_data;
			    	$rootScope.currecyChange();
				}
				
				if(response.code == '1' && response.address_id){
					delete $address.addresses[response.address_id];
				}
            }, function (error) {
                alert(error);
            });
		}
		this.setDefaultAddress = function(addrObj){
			Rest.setDefautlAddress(addrObj).then(function (response) {
				if(response.code == '1'){
					$address.customer_address_id = addrObj.address_id;
				}
            }, function (error) {
                alert(error);
            });
		};
		this.selectedAddrFun = function(addrObj){
			$address.selectedAddress = addrObj;
			ng.element('.text-danger').remove();
		}
		this.saveAddress = function(addrObj){
			if(!latinForm.validatorForm($('#addr_form'))){
				return;
			}
			
			if(!addrObj.address_1 || addrObj.address_1.trim().length <= 0 || addrObj.address_1.length > 120){
				$('.address1-text').after('<div class="text-danger">'+$('.address1-text').attr('data-error-msg')+'</div>')
				return;
			}
			
			var url = '';
			if(addrObj.address_id){				
				url = 'index.php?route=checkout/checkoutv2/edit_address';				
			}else{
				url = 'index.php?route=checkout/checkoutv2/add_address';
				addrObj.address_2 = '';
				addrObj.postcode = '';
			}
			addrObj.country_id = $('#input-shipping-country option:selected').val();
			addrObj.country = $('#input-shipping-country option:selected').text();
			addrObj.zone = $('#input-shipping-zone option:selected').text();
			addrObj.city = $('#input-shipping-city option:selected').text();
			addrObj.town = $('#input-shipping-town option:selected').text();
			
			
			Rest.saveAddress(addrObj).then(function (response) {
				if(response.code == '1'){
					if(response.address_id){
						addrObj.address_id = response.address_id;
					}
					$address.addresses[addrObj.address_id] = addrObj;
					
					// 循环默认地址
					for(var key in $address.addresses){
						if(key != addrObj.address_id && addrObj['default'] == '1'){
							$address.addresses[key]['default'] = 0;
						}
					}
					$address.selectedAddress = $address.addresses[addrObj.address_id];
				    $address.hideAddrForm();
					
					
			    }
            }, function (error) {
                alert(error);
            });
		};
	    this.confirmAddress = function($event){
	    	$('.text-danger').remove();
	    	$($event.target).button('loading');
	    	var addrObj = $address.selectedAddress;
	    	if($rootScope.User.userType == 0){
	    		if(!latinForm.validatorForm($('#addr_form'))){
	    			$($event.target).button('reset');
					return;
				}
	    		addrObj = $address.editAddr;
	    		$address.setCZCT(addrObj);
	    	}else{
	    		if(!addrObj || (!addrObj.address_id && $rootScope.User.userType == 1)){
					alert($address.error_empty_address);
					$($event.target).button('reset');
					return;
				}
	    	}
	    	
	    	if(!addrObj.town_id || !addrObj.city_id ||  addrObj.town_id <=0 || addrObj.city_id <= 0){
	    		var tempadrid = $address.selectedAddress.address_id;
	    		$('#adr-item-' + tempadrid).append('<div class="text-danger">Advertencia: Debes rellenar la dirección correta!</div>');
	    		$($event.target).button('reset');
	    		return;
	    	}
			
			
			
			Rest.confirmAddress(addrObj).then(function (response) {
				$($event.target).button('reset');
				if(response.error){
					var tempadrid = $address.selectedAddress.address_id;
					$('#adr-item-' + tempadrid).append('<div class="text-danger">'+response.error+'</div>');
					return;
				}
				if(response.code == '1'){
			    	$rootScope.PaymentMethod.paymentList = response.payment_methods;
			    	$address.selectedAddress = response.address;
			    	$rootScope.pageData.total_data = response.total_data;
			    	$rootScope.total_data_handling = response.total_data_handling;
			    	$rootScope.currecyChange();
			    	if($rootScope.PaymentMethod.selectedPayMethod.code){
			    		$rootScope.pageChange(3);
			    	}else{
			    		$rootScope.pageChange(2);
			    	}
			    	
			    	if(typeof(LTGA) === 'object' && LTGA.checkoutStep3) LTGA.checkoutStep3();
			    }
				
				if(response.selected_payment_method){
					$rootScope.PaymentMethod.selectedPayMethod = response.selected_payment_method; 
				}
				
            }, function (error) {
                alert(error);
                $($event.target).button('reset');
            });
	    };
		var $address = this;
		
	});
	
	
	app.service('PaymentMethod', function($rootScope,Rest,ltccdata){
		this.selectedPayMethod = ltccdata.selected_payment_method || {};
		this.error_payment = ltccdata.text_payment_p_tile;
		this.paymentList = ltccdata.payment_methods || [];
		this.confirmPaymethod = function($event){
			$($event.target).button('loading');
			var paymentmethod = $paymentMethod.selectedPayMethod;
			if(paymentmethod.length <= 0){
				alert($paymentMethod.error_payment);
				$($event.target).button('reset');
				return;
			}
			paymentmethod.payment_method = paymentmethod.code;
			Rest.confirmPaymethod(paymentmethod).then(function (response) {
				if(response.code == '1'){
					$paymentMethod.selectedPayMethod = response.payment_method;
					$rootScope.pageData.total_data = response.total_data;
					$rootScope.currecyChange();
					$rootScope.pageChange(3);
					if(typeof(LTGA) === 'object' && LTGA.checkoutStep4) LTGA.checkoutStep4();
			    }
				$($event.target).button('reset');
            }, function (error) {
                alert(error);
                $($event.target).button('reset');
            });
			
		};
		
		this.paymentMethodClick = function(paymenth_code){
			var payObj = $paymentMethod.paymentList[paymenth_code];
			$paymentMethod.selectedPayMethod = payObj;
			
			if(payObj.code == 'bank_transfer'){
				$rootScope.pageData.tmpm_total_data = $rootScope.pageData.total_data;
				$rootScope.pageData.total_data = $rootScope.total_data_handling;				
			}else if($rootScope.pageData.tmpm_total_data){
				$rootScope.pageData.total_data = $rootScope.pageData.tmpm_total_data;
			}
			
			
			$rootScope.currecyChange();
			
		};
		
		var $paymentMethod = this;
	});
	
	app.service('User', function($rootScope,Rest,ltccdata){
		this.email = ltccdata.email;
		this.logged = ltccdata.logged;
		
		
		
		this.loginPage = 0; //登录页面
		this.addressPage = 1; // 选择或填写地址页面
		this.selectPaymentPage = 2; //选择支付方式页面
		this.confirmPage = 3; //确认订单页面
		this.userType=0; //guest
		this.guest = {email:this.email};
		this.loginType = 0;
		
		this.changeLoginType = function(type){
			
			$user.customer=[];
			if($user.loginType == 4){
				$user.customer.email = $user.foregetemail;
			}
			$user.loginType = type;
			
			$('.customer').find('.text-danger').remove();
			$('div').removeClass('has_error');
			
		};
		this.confirmCustomer=function($event){
			$($event.target).button('loading');
			if(!latinForm.validatorForm($('.customer-form'))){
				$($event.target).button('reset');
				return;
			}
			if($user.loginType == 2){
				$user.customer.action = 'login';
			}else if($user.loginType == 3){
				$user.customer.action = 'register';
			}else if($user.loginType == 4){
				$user.customer.action = 'forgetpassword';
			}
			
			Rest.confirmCustomer($user.customer).then(function (response) {
				$($event.target).button('reset');
				if(response.error){
					$('.customer-form').before('<div class="text-danger">'+response.error+'</div>');
					return;
				}
				if(response.customer_id){
					$user.logged = response.customer_id;
					$user.userType = 1;
				}
				if(response.email){
					$user.email = response.email;
					if($user.loginType == 2){
						$user.logged = 9999999;
						$user.userType = 1;
					}
				}
				if(response.idcard){
					$rootScope.pageData.idcard = response.idcard;
				}
				if(response.addresses){
					$rootScope.Address.addresses = response.addresses;
				}
				if(response.customer_address_id){
					$rootScope.Address.customer_address_id = response.customer_address_id;
				}
				
				if(response.success){
					$user.foregetemail = $user.email;
					$('.customer-form').before('<div class="text-danger">'+response.success+'</div>');
				}
				
				$rootScope.Address.showAddrForm = false;
				if($user.loginType == 2 || $user.loginType == 3){
					$rootScope.pageChange(1);
					if(typeof(LTGA) === 'object' && LTGA.checkoutStep2) LTGA.checkoutStep2();
				}
				
				
				
            }, function (error) {
                alert(error);
                $($event.target).button('reset');
            });
			
			
			
			$($event.target).button('reset');
			
			
		};
		
		this.confirmGuest = function($event){
			$($event.target).button('loading');
			if(!latinForm.validatorForm($('.guest-form'))){
				$($event.target).button('reset');
				return;
			}
			
			Rest.confirmGuest($user.guest).then(function (response) {
				$($event.target).button('reset');
				if(response.email){
					$user.email = response.email;
					$rootScope.Address.showAddrForm = true;
					$rootScope.pageChange(1);
				}
				
            }, function (error) {
                alert(error);
                $($event.target).button('reset');
            });
			
		};
		
		
		if(this.logged > 0){
			this.userType = 1; // customer
		}
		
		
		setTimeout(function(){$('#input-shipping-country').trigger('change');},100);
		var $user = this;
	});

	
	app.run(['$rootScope', '$location', '$http', 'Rest','Address','Coupon','PaymentMethod','User','ltccdata',  function($rootScope, $location, $http, Rest, Address,Coupon,PaymentMethod,User,ltccdata){
		
		
		$rootScope.total_data_handling = ltccdata.total_data_handling || {};
		$rootScope.pageData = [];
		$rootScope.pageData.total_data = ltccdata.total_data || [];
		$rootScope.pageData.products = ltccdata.products;
		
		if(!$rootScope.pageData.products || $rootScope.pageData.products.length <= 0){
			window.location = 'index.php?route=checkout/cart';
		}
		
		$rootScope.pageData.pageCurrency = ltccdata.pageCurrency;
		$rootScope.pageData.idcard = ltccdata.idcard;
		
		

		
		$rootScope.pageCurrency = '';
		$rootScope.Address = Address;
		$rootScope.Coupon = Coupon;
		$rootScope.PaymentMethod = PaymentMethod;
		$rootScope.User = User;
		
		if(User.userType <= 0){
			Address.showAddrForm = true;
		}else{
			if(Address.showAddrForm){
				Address.addressFormTitle = Address.addrFormTitle_add;
			}else{
				Address.addressFormTitle = Address.addrFormTitle_selected;
			}
			
		}
		
		
		
		
		ltccdata = '';
		
		$rootScope.pageChange = function(page){
		 	User.curPage = page;
		 };
		
		
		$rootScope.currecyChange = function(){
			//total
			var tempTotalData = $rootScope.pageData.total_data;
			for(var key in tempTotalData){
				if(PaymentMethod.selectedPayMethod && PaymentMethod.selectedPayMethod.code == 'pp_express'){
					$rootScope.pageData.total_data[key].baseText = $rootScope.pageData.total_data[key].text;
					$rootScope.pageData.total_data[key].text = $rootScope.pageData.total_data[key].usd_text;
				}else{
					$rootScope.pageData.total_data[key].text = $rootScope.pageData.total_data[key].baseText || $rootScope.pageData.total_data[key].text;
				}
				
			}
			
			
			//产品
			var tmpdata = $rootScope.pageData.products;
			len = tmpdata.length;			
			for(var i = 0; i < len; i++){
				if(PaymentMethod.selectedPayMethod.code == 'pp_express'){
					$rootScope.pageData.products[i].price_text = 'USD: ' +  $rootScope.pageData.products[i].usd_price;
				}else{
					$rootScope.pageData.products[i].price_text = $rootScope.pageData.pageCurrency + ': ' + $rootScope.pageData.products[i].price;
				}
			}
		}
		
		
		$rootScope.confirmOrder = function(){
			
			if(!latinForm.validatorForm($('.cc-idcart-form'))){
				Address.editAddrFun(Address.selectedAddress);
				$rootScope.pageChange(1);
				return;
			}
			
			Rest.checkProductsStock('').then(function (response) {
				if(response.error){
					alert('the product has stock...');
					return;
				}
				if(typeof(LTGA) === 'object' && LTGA.checkoutStep5) LTGA.checkoutStep5();
				var form = $('<form action="index.php?route=checkout/checkoutv2/confirm_order" method="post" ><input type="hidden" name="idcard" value="'+$rootScope.pageData.idcard+'" /></form>');
				$('body').append(form);
				form.submit();
				
            }, function (error) {
                alert(error);
            });
			
			
		};
		
//		
//		var tmpdata = $rootScope.pageData.products;
//		var len = tmpdata.length;
//		for(var i = 0; i < len; i++){
//			$rootScope.pageData.products[i].price_text = $rootScope.pageData.pageCurrency + ': ' + $rootScope.pageData.products[i].price;
//		}
		
		if(PaymentMethod.selectedPayMethod.code && Address.selectedAddress.address_id > 0){
			User.curPage = User.confirmPage;
		}else if(Address.selectedAddress.address_id > 0){
			User.curPage = User.selectPaymentPage;
		}else if(User.logged > 0 || User.email){
			User.curPage = User.addressPage;
		}else{
			User.curPage = User.loginPage;
		}
		
		
		
		
		$rootScope.currecyChange();
		
		setTimeout(function(){$('body').css('display','block');},400);
    }]);
	
	
	
	$('[data-coupon-focus-error]').bind('focus',function(){
		$('.coupon-errror-danger').remove();
	});
	
	
	
	// 启动app
	ng.element(document).ready(function () {
		ng.bootstrap(document, ['ltcheckout']);
	});
	
	
});


function getstring(str){
	if(!str) {return '';}
	if(str.trim().length <= 0) {return '';}
	return str.trim();
}




+function ($) {
	  'use strict';

	  // BUTTON PUBLIC CLASS DEFINITION
	  // ==============================

	  var Button = function (element, options) {
	    this.$element  = $(element)
	    this.options   = $.extend({}, Button.DEFAULTS, options)
	    this.isLoading = false
	  }

	  Button.VERSION  = '3.3.2'

	  Button.DEFAULTS = {
	    loadingText: 'loading...'
	  }

	  Button.prototype.setState = function (state) {
	    var d    = 'disabled'
	    var $el  = this.$element
	    var val  = $el.is('input') ? 'val' : 'html'
	    var data = $el.data()

	    state = state + 'Text'

	    if (data.resetText == null) $el.data('resetText', $el[val]())

	    // push to event loop to allow forms to submit
	    setTimeout($.proxy(function () {
	      $el[val](data[state] == null ? this.options[state] : data[state])

	      if (state == 'loadingText') {
	        this.isLoading = true
	        $el.addClass(d).attr(d, d)
	      } else if (this.isLoading) {
	        this.isLoading = false
	        $el.removeClass(d).removeAttr(d)
	      }
	    }, this), 0)
	  }



	  // BUTTON PLUGIN DEFINITION
	  // ========================

	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.button')
	      var options = typeof option == 'object' && option

	      if (!data) $this.data('bs.button', (data = new Button(this, options)))

	      if (option == 'toggle') data.toggle()
	      else if (option) data.setState(option)
	    })
	  }

	  var old = $.fn.button

	  $.fn.button             = Plugin
	  $.fn.button.Constructor = Button
}(jQuery);
	







