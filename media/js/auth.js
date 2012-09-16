function authButtonSetLogin() {
	$('#sign').attr('authed', 'false');
	$('#sign').text('Войти');
	$('#sign').removeClass('signout');
	$('#sign').removeClass('loading');
	$('#sign').addClass('signin');
}

function authButtonSetLogout(fullName) {
	$('#sign').attr('authed', 'true');
	$('#sign').text('Выйти: ' + fullName);
	$('#sign').removeClass('signin');
	$('#sign').removeClass('loading');
	$('#sign').addClass('signout');
}

function authButtonSetLoading(){
	$('#sign').text('Загрузка...');
	$('#sign').removeClass('signin');
	$('#sign').removeClass('signout');
	$('#sign').addClass('loading');
}

function login(){
	authButtonSetLoading();
	if ($('#sign').attr('authed') == 'false') {
		var settings = 'friends';
		var redirect_url = 'http%3A%2F%2F' + window.location.host + '%2Fservice';
		var vk_url = 'http://api.vkontakte.ru/oauth/authorize?client_id=' + api_id + '&scope=' + settings +	'&redirect_uri=' + redirect_url;
		window.open(vk_url,"Window1", "menubar=no,width=800,height=400,toolbar=no");
	} else {
		authButtonSetLogin();
		$.ajax({
			url:'/logout',
			success:function(){
				// refreshPlayersOnMap();
			}
		});
	}
}

function showsignDialog(){
	// $('body').attr('style', '-webkit-filter: blur(5px)');
	
}

function checkLogin(){
	$.ajax({
		url:'/is_auth', 
		dataType:'text',
		success:function(fullName) {
			$('#sign').on("click", function(event){ login(); });
			if (fullName == 'false') {
				authButtonSetLogin();
			} else {
				authButtonSetLogout(fullName);
			}
		}
	});
}