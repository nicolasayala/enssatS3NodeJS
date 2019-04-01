$(document).ready(function() {
	// get current URL path and assign 'active' class in navbar
	var pathname = window.location.pathname;
	$('.navbar-nav > a[href="'+pathname+'"]').addClass('active');
})
