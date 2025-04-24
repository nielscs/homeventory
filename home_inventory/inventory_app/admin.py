from django.contrib import admin
from .models import Category, Room, Location, Item

admin.site.register(Category)
admin.site.register(Room)
admin.site.register(Location)
admin.site.register(Item)
