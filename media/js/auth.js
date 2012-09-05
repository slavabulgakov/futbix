function authButtonSetLogin() {
	$('#signin a').text('Войти');
}

function authButtonSetLogout() {
	$('#signin a').text('Выйти');
}

function login{
	if ($('#signin a').text() == 'Войти') {
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

function checkLogin(){
	$.ajax({
		url:'/is_auth', 
		dataType:'text',
		success:function(fullName) {
			$('#signin a').on("click", function(event){ login(); });
			if (fullName == 'false') {
				authButtonSetLogin();
			} else {
				authButtonSetLogout();
			}
		}
	});
}