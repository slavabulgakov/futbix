# encoding: utf-8

# Create your views here.
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render_to_response
from django import template
from django.utils import simplejson
from models import Star, UserProfile, Place
from django.contrib import auth
import urllib2
import urllib
import json
from stars import vk
import string
from random import choice
from django.contrib.auth.models import User

def hello(request):
	response = {}
	return render_to_response('stars/default.html', response, template.RequestContext(request))

def placeInfo(request, id):
  response = {}
  place = Place.objects.filter(id = int(id))[0]
  response['place'] = place
  return render_to_response('stars/place.html', response, template.RequestContext(request))

def request(request):
	starsQuerySet = Star.objects.all()
	starsDic = []
	
	for s in starsQuerySet:
		starsDic.append({'star_id':s.id, 'lon':s.lon, 'lat':s.lat, 'first_name':s.user.first_name, 'last_name':s.user.last_name, 'is_me':request.user.id == s.user.id})
	json = simplejson.dumps(starsDic)
	return HttpResponse(json, mimetype="application/json")
	
def places(request):
	placeQuerySet = Place.objects.all()
	placeDic = []
	
	for s in placeQuerySet:
		placeDic.append({'place_id':s.id, 'lon':s.lon, 'lat':s.lat, 'first_name':s.user.first_name, 'last_name':s.user.last_name})
	json = simplejson.dumps(placeDic)
	return HttpResponse(json, mimetype="application/json")
	
def getInfo(request):
	if request.method == 'GET':
		jsonStarIds = request.GET['star_id']
		starIds = simplejson.loads(jsonStarIds)
		ret = []
		d = []
		for starId in starIds:
			user = Star.objects.filter(id = starId)[0].user
			if request.user.id <> user.id or len(starIds) > 1:
				starId = -1
			if not user.vk_id in d:
				d.append(user.vk_id)
				count = 0
				for stId in starIds:
					usr = Star.objects.filter(id = stId)[0].user
					if usr.id == user.id:
						count = count + 1
				full_name = user.last_name + ' ' + user.first_name 
#				if len(full_name) > 14:
#					full_name = full_name[0:11] + '...'
				ret.append({'vk_id':user.vk_id, 'first_name':user.first_name, 'last_name':user.last_name, 'full_name':full_name , 'star_id':starId, 'count':count})
		json = simplejson.dumps(ret)
	return HttpResponse(json, mimetype="application/json")
	
def getPlaceInfo(request):
	if request.method == 'GET':
		jsonStarIds = request.GET['place_id']
		placeIds = simplejson.loads(jsonStarIds)
		ret = []
		for placeId in placeIds:
			place = Place.objects.filter(id = placeId)[0]
			ret.append({'place_title':place.title, 'place_id':place.id})
		json = simplejson.dumps(ret)
	return HttpResponse(json, mimetype="application/json")

def setStar(request):
	max_count_stars = 5
	if not request.user.is_authenticated():
		return HttpResponse("{'id':'notuath'}")
	if request.method == 'GET':
		lon = float(request.GET['lon'])
		lat = float(request.GET['lat'])
		stars = Star.objects.filter(user = request.user)
		if stars.count() < max_count_stars:
			user = UserProfile(user_ptr_id = request.user.id)
			star = Star(user = user, lon = lon, lat = lat)
			star.save()
			return HttpResponse("{'id':'" + str(star.id) + "'}")
	return HttpResponse("{'id':'morefive'}")
	
def removeStar(request):
	if request.method == 'GET':
		star_id = int(request.GET['star_id'])
		Star.objects.filter(id=star_id).delete()
		return HttpResponse('ok')
		

def logout(request):
	auth.logout(request)
	return HttpResponse('ok')

	# 	function callVkApi($api_func, $params, $token)
	# {
	# 	$response = file_get_contents($this->api_vk.'/method/'.$api_func.'?'.$params.'&access_token='.$token);
	# 	return json_decode($response);
	# }

def generatePassword():
	size = 9
	p = ''.join([choice(string.letters + string.digits) for i in range(size)])
	return p

def authentication(vk_id, first_name, last_name, request):
	# user = auth.authenticate(username=vk_id, password=password)
	user = User.objects.get(username__exact=str(vk_id))
	if user is not None and user.is_active:
		print '111'
		user.backend='django.contrib.auth.backends.ModelBackend'
		auth.login(request, user)
	else:
		print '222'
		password = generatePassword()
		user = UserProfile.objects.create_user(username = vk_id, email = '', password=password)
		user.vk_id = vk_id
		user.first_name = first_name
		user.last_name = last_name
		user.save()

def getRequest(url):
	response = urllib.urlopen(url)
	page = response.read()
	return page

def callVkApi(api_func, params, token):
	url = vk.api_url + '/method/' + api_func + '?' + params + '&access_token=' + token
	page = getRequest(url)
	response = json.loads(page)
	return response

def service(request):
	code = request.GET['code']
	request_url = vk.api_url + '/oauth/access_token?client_id=' + str(vk.app_id) + '&client_secret=' + vk.app_secret + '&code=' + code # ссылка для получение токена
	page = getRequest(request_url)
	response = json.loads(page)
	try:
		vk_access_token = response['access_token']
		vk_user_id = response['user_id']
	except Exception, e:
		return HttpResponse('error')
	else:
		pass
	finally:
		pass

	profiles = callVkApi('getProfiles', 'uids=' + str(vk_user_id), vk_access_token)
	vk_id = profiles['response'][0]['uid']
	first_name = profiles['response'][0]['first_name']
	last_name = profiles['response'][0]['last_name']
	authentication(vk_id, first_name, last_name, request)

	return HttpResponse('<script type="text/javascript">opener.authButtonSetLogout("' + first_name + ' ' + last_name + '"); close();</script>')

def isAuth(request):
	if request.user.is_authenticated():
		return HttpResponse(request.user.first_name + ' ' + request.user.last_name, content_type="text/plain")
	return HttpResponse("false", content_type="text/plain")