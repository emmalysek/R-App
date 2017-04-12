from django.shortcuts import render
from django.http import Http404

from display.models import Location
from display.models import Contact
from display.models import CalendarException

def index(request):
    locations = Location.objects.all()
    return render(request, 'display/index.html', {
        'locations': locations,
    })

def location_detail(request, id):
    try:
        location = Location.objects.get(id=id)
        contacts = Contact.objects.filter(location_title=location)
        exceptions = CalendarException.objects.filter(location_title=location)
    except Location.DoesNotExist:
        raise Http404('This item does not exist')
    return render(request, 'display/location_detail.html', {
        'location': location,
        'contacts': contacts,
        'exceptions': exceptions,
    })