
$(document).ready(function(){
	$(window).scroll(function(){
		layzLoadArea();
	});
	
	layzLoadArea();
});


function layzLoadArea(){
	
	
	$('[lt-lazy-load="true"]').each(function(index,el){
		if($(el).attr('lt-loaded')){
			return;
		}
		
		var $window = $(window);
		var fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
		
		var topflag = fold <= $(el).offset().top;
		
		fold = $window.scrollTop();
		
		var bottomflag = fold >= $(el).offset().top  + $(el).height();
		
		var flag = !topflag && !bottomflag ? true : false;
		
		if(flag && !$(el).attr('lt-loaded')){
			$(el).attr('lt-loaded', '1');
			$.get($(el).attr('lt-original-url'),function(html){
				$(el).html(html);
				
				if(typeof(LTGA) === 'object' && LTGA.productImpression) LTGA.productImpression(el);
				if(typeof(LTGA) === 'object' && LTGA.productClickhp) LTGA.productClickhp(el);
				if(typeof(LTGA) === 'object' && LTGA.promo) LTGA.promo(el);
			});
			
		}
		
		
	});
	
	
	
}
