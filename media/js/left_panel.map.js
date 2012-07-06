function placeInfo(id) {
	YMaps.jQuery.ajax({
		url:'/placeinfo' + id + '/', 
		dataType:'html',
		success:function(data){
			YMaps.jQuery('#LeftPanel').html(data);
		}
	});
}