
$(document).ready(function() {
	charesTip();
	ltCancel();
	focuseRmDanger();
	
});


function removeDanger(el){
	var tel = $(el).next();
	if(tel.hasClass('text-danger')){
		tel.remove();
	}
}

function focuseRmDanger(){
//  在警告区域进行操作时，警告语消失
	$('input[data-foucse-rm-danger="true"]').each(function(index,el){
		$(el).bind('focus',function(){
			removeDanger(el);
		});
	});
	
	$('textarea[data-foucse-rm-danger="true"]').each(function(index,el){
		$(el).bind('focus',function(){
			removeDanger(el);
		});
	});
	
	$('div[data-foucse-rm-danger="true"]').each(function(index,el){
		$(el).bind('click',function(){
			removeDanger(el);
		});
	});
}

function charesTip(){
	$('textarea[data-chares-tip="true"]').each(function(index,el){
		$(el).bind('keyup','',function(){
			$('.chares-tip').remove();
			var maxlength = $(el).attr('maxlength');
			if(maxlength && maxlength > 0){
				$(el).after('<i class="chares-tip">'+$(el).val().length+'/'+maxlength+'</i>');
			}
		});
	});
}

function ltCancel(){
	$('a[data-lt-cancel="true"]').each(function(index,el){
		$(el).bind('click','',function(){
			$('#' + $(el).attr('data-lt-tragget')).fadeOut();
		});
	});
}

// 参数： 国家元素ID， 区域元素ID， 城市元素ID， 镇元素 ID
function LtDeliverAreas(countryFieldId, zoneFieldId, cityFieldId, townFieldId){
	this.textSelect = '---Please select ---';
	this.textNone = '--- None ---';
	this.zone_id = '-1';
	this.city_id = '-1';
	this.town_id = '-1';
	
	this.areaChange = function(chageFiledId, childFieldId,childId){
		var fieldVal = $('#'+chageFiledId+'  option:selected').val();
		if(!fieldVal || fieldVal.length <= 0){
			$('#' + childFieldId).html('<option value="">'+$this.textSelect+'</option><option value="" selected>'+$this.textNone+'</option>');
			return;
		}
		
		
		$.ajax({
			url: 'index.php?route=account/address/deliver_areas&delivery_areas_id='+fieldVal+'',
			type: 'get',
			dataType: 'json',
			cache: true,
			beforeSend: function() {
				$('#' + chageFiledId).after(' <i class="fa fa-circle-o-notch fa-spin"></i>');
			},
			complete: function() {
				$('.fa-spin').remove();
			},
			success: function(data) {
				$('.fa-spin').remove();
				var childs = data.childs || null;
				
				$('#' + childFieldId).html('');
				$('#' + childFieldId).append('<option value="">'+$this.textSelect+'</option>');
				var childChange = false;
				if(childs && childs.length > 0){
					var len = childs.length;
					for(var i = 0; i < len; i++){
						var item = childs[i];
						var selected = '';
						if(childId == item['delivery_areas_id']) {
							childChange = true;
							selected = 'selected';
						}
						$('#' + childFieldId).append('<option value="'+item['delivery_areas_id']+'" '+selected+'>'+item['name']+'</option>');
					}
				}else{
					$('#' + childFieldId).append('<option value="" selected>'+$this.textNone+'</option>');
				}
				if(childChange){
					$('#'+childFieldId).trigger('change');
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				console.log(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
		
		
	};
	
	var $this = this;
	
	$('#'+ countryFieldId ).on('change', function() {
		$this.areaChange(countryFieldId,zoneFieldId,$this.zone_id);
		$('#' + cityFieldId).html('');
		$('#' + townFieldId).html('');
	});
	$('#'+ zoneFieldId ).on('change', function() {
		$this.areaChange(zoneFieldId,cityFieldId,$this.city_id);
		$('#' + townFieldId).html('');
	});
	$('#'+ cityFieldId ).on('change', function() {$this.areaChange(cityFieldId,townFieldId,$this.town_id);});
}


//  地址分割address_1
function LtAddress1(roomFieldId, buildingFieldId, streetFieldId, readFieldId){
	this.address1Change = function(){
		var roomNo = $('#' +roomFieldId).val() ? $('#' + roomFieldId).val(): '';
		var buildingNo = $('#' +buildingFieldId).val() ? $('#' + buildingFieldId).val(): '';
		var StreetNo = $('#' + streetFieldId).val() ? $('#' + streetFieldId).val() : '';
		if(roomNo.trim().length > 0 && buildingNo.trim().length) roomNo = roomNo + ', ';
		else if(roomNo.trim().length > 0 && StreetNo.trim().length) roomNo = roomNo + ', ';
		if(buildingNo.trim().length > 0 && StreetNo.trim().length) buildingNo = buildingNo + ', ';
		$('#' +readFieldId).val(roomNo + buildingNo + StreetNo);
	};
	var $this = this;
	
	$('#'+ roomFieldId ).on('change', function() {$this.address1Change();});
	$('#'+ buildingFieldId ).on('change', function() {$this.address1Change();});
	$('#'+ streetFieldId ).on('change', function() {$this.address1Change();});
}


var latinForm = {
		focuseAdd: false,
		ltPostFormId: null,
		init: function(){
			latinForm.focuseRemoveDanger();
		},
		focuseRemoveDanger: function(){
			$('[lt-form-validator]').each(function(index, iel){
				$(iel).bind('focus',function(){
					latinForm.removeDanger(iel);
				});
			});
		},
		ltPost:function(url,data,successCallback){
			$.post(url,data,
					function (data, status){
						if(data){
							data = JSON.parse(data);
						}
						
						if(data && data.error){
							if(latinForm.ltPostFormId){
								$('#' + latinForm.ltPostFormId).prepend('<div class="text-danger ltpost-failed">'+data.error['warning']+'</div>');
							}
						}
						if(data && '1' == data.status){
							var hrefstr = location.href;
							var str = "route=account/logout";
							// var cartstr = "route=checkout/cart";
							// if(hrefstr.indexOf(cartstr) < 0){
								if(hrefstr.substring(hrefstr.length-str.length)==str){
									location.href = '/';
								}else{
									location.href = location.href;
								}
							// }else{
							// 	location.href = '/index.php?route=checkout/checkoutv2'

							// }


						}
						latinForm.ltPostFormId = null;
						if(successCallback){
							successCallback(data);
						}
						
					});
		},
		removeDanger: function(el){
			if($(el).parent().hasClass('has_error')){
				$(el).parent().removeClass('has_error');
			}
			
			var tel = $(el).next();
			if(tel.hasClass('text-danger')){
				tel.remove();
			}
		},
		validatorLenght: function(str,minLength,maxLength){
			if(!str || str.trim().length <= 0){return false;}
			str = str.trim();
			if(minLength > 0 && str.length < minLength){
				return false;
			}
			
			if(maxLength > 0 && str.length > maxLength){
				return false;
			}
			return true;
		},
		validatorForm : function(formEl){
			$('.text-danger').remove();
			var flag = true;
			formEl.find('[lt-form-validator]').each(function(index, iel){
				//添加获取蕉点就移除错误提示
//				if(!latinForm.focuseAdd){
//					$(iel).bind('focus',function(){
//						latinForm.removeDanger(iel);
//					});
//				}
				var validType = $(iel).attr('lt-form-validator');
				var validValue = $(iel).val();
				var required = $(iel).attr('lt-required');
				if(!validValue && 'true' != required){
					
					return;
				}
				
				var minLength = 0;
				if($(iel).attr('lt-min-length') && !isNaN($(iel).attr('lt-min-length'))){
					minLength = $(iel).attr('lt-min-length');
				}
				
				var maxLength = 0;
				if($(iel).attr('maxlength') && !isNaN($(iel).attr('maxlength'))){
					maxLength = $(iel).attr('maxlength');
				}
				var vflag = latinForm.validatorLenght(validValue,minLength,maxLength);
				if(!vflag){
					flag = false;
					$(iel).parent().addClass('has_error');
					$(iel).after('<div class="text-danger">'+$(iel).attr('lt-error-msg')+'</div>');
					return;
				}
				
				if(validType == 'email'){
					var emailReg = /^[^\@]+@.*\.[a-z]{2,15}$/;
					if(validValue.match(emailReg) == null){vflag = false;}
				}
				
				if(validType == 'telephone'){
					var telphponeReg = /^[0-9\-]+$/;
					if(validValue.match(telphponeReg) == null){vflag = false;}
				}
				
				
				if(validType == 'idcard'){
					var nitReg = /^[0-9\-]+$/;
					if(validValue.match(nitReg) == null){vflag = false;}
				}
				if(validType == 'repassword'){
					var password = formEl.find('[lt-form-validator="password"]').val();
					if(password != validValue){vflag = false;}
				}
				
				if(validType == 'boolean'){
					if($(iel).attr('type') == 'checkbox' && (!$(iel).attr('checked') || $(iel).attr('checked') != 'checked')){vflag = false;}
				}
				
				
				if(!vflag){
					flag = false;
					$(iel).parent().addClass('has_error');
					$(iel).after('<div class="text-danger">'+$(iel).attr('lt-error-msg')+'</div>');
					return;
				}
				
			});
			latinForm.focuseAdd = true;
			return flag;
		}
		
};

$(document).ready(function(){
	latinForm.init();
	$('input[lt-entry-event-form]').keydown(function(event){
		if(event.keyCode == 13){
			$el = $(this);
			var formfun = $el.attr('lt-entry-event-form');
			eval(formfun);
		}
	});
});


