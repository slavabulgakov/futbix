#!/usr/bin/env python 
# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User, UserManager
#from django.db.models.signals import post_save

# Create your models here.
class UserProfile(User):
	objects = UserManager()
    # This field is required.
	#user = models.OneToOneField(User)

    # Other fields here
	vk_id = models.IntegerField(null=True, blank=True)
	def __unicode__(self):
		return u'%s %s' % (self.first_name, self.last_name)
	
#def create_user_profile(sender, instance, created, **kwargs):
#	if created:
#		UserProfile.objects.create(user=instance)
#post_save.connect(create_user_profile, sender=User)

class Star(models.Model):
  user = models.ForeignKey(UserProfile)
  lat = models.FloatField(u'широта')
  lon = models.FloatField(u'долгота')
	
  def __unicode__(self):
    return u'%s %s' % (self.user.first_name, self.user.last_name)



class SportType(models.Model):
	title = models.CharField(u'название вида спорта', max_length = 100)
	
	class Meta:
		verbose_name = u'вид спорта'
		verbose_name_plural = u'виды спорта'
	
	def __unicode__(self):
		return self.title
		
class City(models.Model):
	title = models.CharField(u'название города', max_length = 100)
	
	class Meta:
		verbose_name = u'город'
		verbose_name_plural = u'города'
	
	def __unicode__(self):
		return self.title
		
class Metro(models.Model):
	title = models.CharField(u'название метро', max_length = 100)
	
	class Meta:
		verbose_name = u'метро'
		verbose_name_plural = u'метро'
	
	def __unicode__(self):
		return self.title
	
	
class District(models.Model):
	title = models.CharField(u'название района', max_length = 100)
	
	class Meta:
		verbose_name = u'район'
		verbose_name_plural = u'районы'
	
	def __unicode__(self):
		return self.title
	
	
class Place(models.Model):
  user = models.ForeignKey(UserProfile)
  lat = models.FloatField(u'долгота')
  lon = models.FloatField(u'широта')
  title = models.CharField(u'название', max_length = 100)
  url = models.CharField(u'адрес сайта', max_length = 200, blank=True)
  description = models.TextField(u'описание', blank=True)
  price = models.CharField(u'цена', max_length = 100, blank=True)
  phone = models.CharField(u'телефон', max_length = 100, blank=True)
  sport_kind = models.ManyToManyField(SportType)
  address = models.CharField(u'адрес', max_length = 300, blank=True)
  city = models.ForeignKey(City, blank=True, null=True)
  metro = models.ManyToManyField(Metro, blank=True, null=True)
  district = models.ForeignKey(District, blank=True, null=True)
  
  class Meta:
		verbose_name = u'игровое место'
		verbose_name_plural = u'игровые места'