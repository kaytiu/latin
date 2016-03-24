require.config({
	paths: {
		'angular'           : '../../journal2/lib/angular/angular.min',
		'angular-route'     : '../../journal2/lib/angular/angular-route.min'
	},
	shim: {
		'angular': {exports: 'angular'},
		'angular-route': {deps: ['angular']}
	},
	urlArgs: "ver=" + new Date().getTime()
});

require(['angular','attribute'], function (ng,app) {
	ng.element(document).ready(function () {
		ng.bootstrap(document, ['lthomepage']);
		console.log('start....');
	});
});



