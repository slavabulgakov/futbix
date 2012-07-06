from django.contrib import admin
from models import Star, Place, SportType, City, Metro, District

class StarAdmin(admin.ModelAdmin):
	list_display = ('user', 'lon', 'lat')
	
class PlaceAdmin(admin.ModelAdmin):
	list_display = ('user', 'lon', 'lat', 'title', 'url', 'phone', 'address', 'description', 'price', 'city', 'district')
	
class SportTypeAdmin(admin.ModelAdmin):
	list_display = ('title',)
	
class CityAdmin(admin.ModelAdmin):
	list_display = ('title',)
	
class MetroAdmin(admin.ModelAdmin):
	list_display = ('title',)
	
class DistrictAdmin(admin.ModelAdmin):
	list_display = ('title',)

admin.site.register(Star, StarAdmin)
admin.site.register(Place, PlaceAdmin)
admin.site.register(SportType, SportTypeAdmin)
admin.site.register(City, CityAdmin)
admin.site.register(Metro, MetroAdmin)
admin.site.register(District, DistrictAdmin)
