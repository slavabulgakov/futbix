ymaps.ready(function () {
	$('#enableJSMessage').hide();

	checkLogin();

	/* Создание экземпляра карты и его привязка 
   к контейнеру с id="YMapsID" */
	var myMap = new ymaps.Map("YMapsID", {
        // Центр карты
        center: [55.76, 37.64],
        // Коэффициент масштабирования
        zoom: 10,
        // Тип карты
        type: "yandex#satellite"
    });
});