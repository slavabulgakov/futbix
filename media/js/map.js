ymaps.ready(function () {
	$('#enableJSMessage').hide();

	checkLogin();

	/* Создание экземпляра карты и его привязка 
   к контейнеру с id="YMapsID" */
	var map = new ymaps.Map("YMapsID", {
        // Центр карты
        center: [ymaps.geolocation.latitude, ymaps.geolocation.longitude],
        // Коэффициент масштабирования
        zoom: 10,
        // Тип карты
        type: "yandex#map"
    });

    map.events.add('click', function (e) {
        var coord = e.get('coordPosition');

        $.ajax({
            url:'/setstar', 
            dataType:'json',
            data:{lon:String(coord[0]), lat:String(coord[1])},
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

                            myPlacemark = new ymaps.Placemark(coord, {
                                content: 'Москва!',
                                balloonContent: 'Столица России'
                            });
                        }
                        break;
                }
            }
        });
    });
});