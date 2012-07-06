import locale
locale.setlocale(locale.LC_ALL, 'ru_RU.utf8')
import sys
import os
sys.path.append('/usr/lib/python2.6/site-packages/django/')
sys.path.insert(0, '/home/f/futbixru/public_html/futbix/')
sys.path.insert(0, '/home/f/futbixru/public_html/')
os.environ['DJANGO_SETTINGS_MODULE'] = 'futbix.settings'
from django.core.handlers.wsgi import WSGIHandler
application = WSGIHandler()
