from django.conf.urls.defaults import *
from stars import views

urlpatterns = patterns('',
	(r'^request/', views.request),
	(r'^places/', views.places),
	(r'^getplaceinfo/', views.getPlaceInfo),
	(r'^getinfo/', views.getInfo),
	(r'^setstar/', views.setStar),
	(r'^removestar/', views.removeStar),
	(r'^service/', views.service),
	(r'^logout/', views.logout),
	(r'^is_auth/', views.isAuth),
	(r'^$', views.hello),
  (r'^placeinfo/', views.placeInfo),
  (r'^placeinfo(?P<id>\d+)/$', views.placeInfo),
)
