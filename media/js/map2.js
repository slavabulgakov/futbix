var setMode = false;
var map = null;
var authButton = null;
var stars = [];
var places = [];
var zoom = 12;
var message_opened = false;
var epsilon = 10.0;
var api_id;

Array.prototype.unique = function() {
	var a = this.concat();
	for(var i=0; i<a.length; ++i) {
		for(var j=i+1; j<a.length; ++j) {
			if(a[i] === a[j])
				array.splice(j, 1);
			}
		}
	return a;
};

//======
// Стили
var defStyle = new YMaps.Style();
defStyle.iconStyle = new YMaps.IconStyle();
defStyle.iconStyle.href = "/media/img/one_icon.png";
defStyle.iconStyle.size = new YMaps.Point(34, 47);
defStyle.iconStyle.offset = new YMaps.Point(-17, -47);
	
var meStyle = new YMaps.Style();
meStyle.iconStyle = new YMaps.IconStyle();
meStyle.iconStyle.href = "/media/img/one_icon_self.png";
meStyle.iconStyle.size = new YMaps.Point(34, 47);
meStyle.iconStyle.offset = new YMaps.Point(-17, -47);

var severalStyle = new YMaps.Style();
severalStyle.iconStyle = new YMaps.IconStyle();
severalStyle.iconStyle.href = "/media/img/all_icon.png";
severalStyle.iconStyle.size = new YMaps.Point(34, 47);
severalStyle.iconStyle.offset = new YMaps.Point(-17, -47);

var placeStyle = new YMaps.Style();
placeStyle.iconStyle = new YMaps.IconStyle();
placeStyle.iconStyle.href = "/media/img/place_icon.png";
placeStyle.iconStyle.size = new YMaps.Point(34, 47);
placeStyle.iconStyle.offset = new YMaps.Point(-17, -47);

var severalPlacesStyle = new YMaps.Style();
severalPlacesStyle.iconStyle = new YMaps.IconStyle();
severalPlacesStyle.iconStyle.href = "/media/img/several_places_icon.png";
severalPlacesStyle.iconStyle.size = new YMaps.Point(35, 48);
severalPlacesStyle.iconStyle.offset = new YMaps.Point(-17, -48);
//======

function dist(p1, p2) {
	return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function remove(array, value) {
	array.splice(array.indexOf(value), 1);
}

		
function removeStar(star_id){
	YMaps.jQuery.ajax({
		url:'/removestar', 
		data:{star_id:star_id},
		success:function(data){
			if(data == 'ok') {
				refreshPlayersOnMap();
			}
		}
	});
}
		
function placemarkContent(vk_id, first_name, last_name, full_name, star_id, count) {
	var s = "";
	if(star_id != -1) {
		s = "<a href='#' onclick='removeStar(" + star_id + ")' title='Удалить метку'><img src='/media/img/trash.png' /></a>";
	}
	var s2 = "";
	if(count != 1) {
		s2 = "(" + count + ")";
	}
	var str = "<div><a href='http://www.vkontakte.ru/id" + vk_id + "' target='_blank'>" + full_name + s2 + "</a>" + s + "</div>";
	return str;
}
		
function placemarkPlaceContent(place_id, place_title) {
	//return "<div><a href='http://www.futbix.ru/placeinfo" + place_id + "' target='_blank'>" + place_title + "</a></div>";
	return "<div><a onclick='placeInfo(" + place_id + ")' href='#'>" + place_title + "</a></div>";
}
		
function countElementsOfObject(dict) {
	var count = 0;
	for (var i in dict) {
		if (dict.hasOwnProperty(i)) count++;
	}
	return count;
}

function exist(dict, key) {
	for(var k in dict) {
		if(k == key) return true;
	}
	return false;
}
		
function addBalloonOpenEvent(placemark) {
	var query = '';
	YMaps.jQuery(placemark.id).each(function(){
		query = query + ',' + this;
    });
    query = '[' + query.substr(1, query.length) + ']';
	YMaps.Events.observe(placemark, placemark.Events.BalloonOpen, function () {
		YMaps.jQuery.ajax({
			url:'/getinfo', 
			dataType:'json',
			data:{star_id:query},
			success:function(data){
				console.log(data);
				placemark.name = '';
				YMaps.jQuery(data).each(function(){
					placemark.name += placemarkContent(this.vk_id, this.first_name, this.last_name, this.full_name, this.star_id, this.count);
					placemark.update();
				});
				
			}
		});
	});
}

function addBalloonOpenPlaceEvent(placemark) {
	var query = '';
	YMaps.jQuery(placemark.id).each(function(){
		query = query + ',' + this;
    });
    query = '[' + query.substr(1, query.length) + ']';
	YMaps.Events.observe(placemark, placemark.Events.BalloonOpen, function () {
		YMaps.jQuery.ajax({
			url:'/getplaceinfo', 
			dataType:'json',
			data:{place_id:query},
			success:function(data){
				placemark.name = '';
				YMaps.jQuery(data).each(function(){
					placeInfo(this.place_id);
					placemark.name += placemarkPlaceContent(this.place_id, this.place_title);
					placemark.update();
				});
			}
		});
	});
}

function addBalloonClosePlaceEvent(placemark) {
	YMaps.Events.observe(placemark, placemark.Events.BalloonClose, function () {
		YMaps.jQuery('#LeftPanel').html("");
	});
}

// обновление игроков на карте
function refreshPlayersOnMap() {
	YMaps.jQuery(stars).each(function(i){ // удаление всех меток с карты
		map.removeOverlay(this);
	});
	stars = [];
	YMaps.jQuery.ajax({
		url:'/request', 
		dataType:'json',
		success:function(data){
			YMaps.jQuery(data).each(function(i){
				var point = new YMaps.GeoPoint(this.lat, this.lon, false);

				var placemark = null;
				if(this.is_me) {
					placemark = new YMaps.Placemark(point, {style:meStyle});
				} else {
					placemark = new YMaps.Placemark(point, {style:defStyle});
				}
        		placemark.id = [this.star_id];
				map.addOverlay(placemark);

				// нахождение ближайших точек
				var nearbyStars = [];
				YMaps.jQuery(stars).each(function(){
					var d = dist(placemark.__posInPixels, this.__posInPixels);
					if(d <= epsilon) {
						nearbyStars.push(this);
					}
				});

				// установка одной точки за место множества ближайших
				stars.push(placemark);
				if(nearbyStars.length > 0) {
					placemark.setStyle(severalStyle);
					YMaps.jQuery(nearbyStars).each(function(){
						placemark.id = placemark.id.concat(this.id).unique();
						map.removeOverlay(this);
						remove(stars, this);
					});
            	}
            	addBalloonOpenEvent(placemark);
			});
			}
		});
}

// обновление полей на карте
function refreshPlacesOnMap() {
	YMaps.jQuery(places).each(function(i){ // удаление всех меток с карты
		map.removeOverlay(this);
	});
	places = [];
	YMaps.jQuery.ajax({
		url:'/places', 
		dataType:'json',
		success:function(data){
			YMaps.jQuery(data).each(function(i){
				var point = new YMaps.GeoPoint(this.lat, this.lon, false);
				var placemark = new YMaps.Placemark(point, {style:placeStyle});
				placemark.id = [this.place_id];
				map.addOverlay(placemark);

				// нахождение ближайших точек
				var nearbyPlaces = [];
				YMaps.jQuery(places).each(function(){
					var d = dist(placemark.__posInPixels, this.__posInPixels);
					if(d <= epsilon) {
						nearbyPlaces.push(this);
					}
				});

				// установка одной точки за место множества ближайших
				places.push(placemark);
				if(nearbyPlaces.length > 0) {
					placemark.setStyle(severalPlacesStyle);
					YMaps.jQuery(nearbyPlaces).each(function(){
						placemark.id = placemark.id.concat(this.id).unique();
						map.removeOverlay(this);
						remove(places, this);
					});
				}
				addBalloonOpenPlaceEvent(placemark);
				addBalloonClosePlaceEvent(placemark);
			});
		}
	});
}

		
YMaps.jQuery(function () {
	// Скрываем сообщение об обработке яваскриптов в браузере
	YMaps.jQuery(enableJSMessage).hide();

    // Создает экземпляр карты и привязывает его к созданному контейнеру
    map = new YMaps.Map(YMaps.jQuery("#YMapsID")[0]);
            
    // Устанавливает начальные параметры отображения карты: центр карты и коэффициент масштабирования
    map.setCenter(new YMaps.GeoPoint(30.352074, 59.950815), zoom);

	// обработчик события обновления карты
	YMaps.Events.observe(map, map.Events.Update, function (map, mEvent) {
		refreshPlayersOnMap();
		refreshPlacesOnMap();
	});
	
    // Вешаем событие на клик по карте
    YMaps.Events.observe(map, map.Events.Click, function (map, mEvent) {
		if(!setMode) return;
		var geoPoint = mEvent.getGeoPoint();
		YMaps.jQuery.ajax({
			url:'/setstar', 
			dataType:'json',
			data:{lon:String(geoPoint.__lat), lat:String(geoPoint.__lng)},
			success:function(starIsAdded) {
				switch (starIsAdded.id) {
					case 'notuath':
						alert('Чтобы установить свое положение сначало авторизируйтесь!');
						break;
					case 'morefive':
						alert('Вы не можете указать более 5 мест.');
						break;
					default:
						{
							var placemark = new YMaps.Placemark(geoPoint, {style:meStyle});
							placemark.id = [starIsAdded.id];
							addBalloonOpenEvent(placemark);
							map.addOverlay(placemark);
							stars.push(placemark);
						}
						break;
				}
			}
		});
	}, this);

	// Создает панель инструментов
	var toolbar = new YMaps.ToolBar();


	//=============================
	// Создает кнопку-переключатель
	var button = new YMaps.ToolBarRadioButton(YMaps.ToolBar.DEFAULT_GROUP, { 
		icon: "/media/img/icon_small.png", 
		hint: "Режим установки положения"
	});

	// Включает режим установки своего положения
	YMaps.Events.observe(button, button.Events.Select, function () {
		setMode = true;
	}, toolbar);

	// Выключает режим установки своего положения
	YMaps.Events.observe(button, button.Events.Deselect, function () {
		setMode = false;
	}, toolbar);
            
    // Добавление кнопки на панель инструментов
    toolbar.add(button);
	//=============================

	//=============================
	// Создает кнопку-переключатель
	authButton = new YMaps.ToolBarButton();

	// Обработчик нажатия на кнопку авторизации
	YMaps.Events.observe(authButton, authButton.Events.Click, function (but) {
		if(but._content.caption == "Войти") {
			login();
		} else {
			logout();
		}
	}, map);
            
    // Добавление кнопки на панель инструментов
	toolbar.add(new YMaps.ToolBarSeparator);
    toolbar.add(authButton);
	//=============================

	// Пытаемся получить данные текущего пользователя
	// VK.Auth.getLoginStatus(getUserData);
	refreshPlacesOnMap();

	checkLogin();

    // Добавление инструментов на карту
    map.addControl(toolbar);
    map.addControl(new YMaps.SearchControl());
	map.addControl(new YMaps.TypeControl());
	map.addControl(new YMaps.Zoom());

	// Включаем масштабирование колесиком мыши
	map.enableScrollZoom();
		
	var t = 50;
	window.setTimeout(function(){
		if(YMaps.jQuery('#message')[0].style.right == "-225px") {
			YMaps.jQuery("#label").hide();
			window.setTimeout(function(){
				YMaps.jQuery("#label").show();
					window.setTimeout(function(){
						YMaps.jQuery("#label").hide();
						window.setTimeout(function(){
							YMaps.jQuery("#label").show();
							window.setTimeout(function(){
								YMaps.jQuery("#label").hide();
								window.setTimeout(function(){
									YMaps.jQuery("#label").show();
								}, t);
							}, t);
						}, t);
					}, t);
			}, t);
		}
	}, 3000);

	YMaps.jQuery("#label").click(function(){
		if(message_opened){
			YMaps.jQuery('#message').animate({right:-225}, 1000, function(){
				YMaps.jQuery('#label img')[0].src = "/media/img/open.png";
			});
		} else {
			var width = window.innerWidth;
			YMaps.jQuery('#message').animate({right:width / 2}, 1000, function(){
				YMaps.jQuery('#label img')[0].src = "/media/img/back.png";
			});
		}
		message_opened = !message_opened;
	});
});