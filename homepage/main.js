require.config({
	paths: {
		'angular'           : '../../journal2/lib/angular/angular.min',
		'angular-route'     : '../../journal2/lib/angular/angular-route.min',
//		'angular-ls'        : '../../journal2/lib/angular/angular-local-storage',
//		'angular-strap'     : '../../journal2/lib/angular-strap/angular-strap.min',
//		'angular-bootstrap' : '../../journal2/lib/ui.bootstrap/ui-bootstrap-tpls-0.6.0.min'
	},
	shim: {
		'angular': {exports: 'angular'},
		'angular-route': {deps: ['angular']},
//		'angular-ls': {deps: ['angular']},
//		'angular-strap': {deps: ['angular']},
//		'angular-bootstrap': {deps: ['angular']}
	},
	urlArgs: "ver=" + new Date().getTime()
});

require(['angular','app'], function (ng,app) {
	
	
	
	
	ng.element(document).ready(function () {
		ng.bootstrap(document, ['lthomepage']);
		console.log('start....');
	});
});



