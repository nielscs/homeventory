from rest_framework.test import APIClient
from inventory_app.models import Room, Location
from inventory_app.serializers import RoomSerializer, LocationSerializer
from django.test import TestCase, Client
from django.contrib.admin.sites import AdminSite
from django.contrib.auth.models import User
from inventory_app.admin import LocationAdmin


class SerializerTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.room = Room.objects.create(name="Kitchen")
        self.shelf = Location.objects.create(
            name="Pantry Shelf", room=self.room)
        self.box = Location.objects.create(
            name="Box A", parent_location=self.shelf)

    def test_room_serializer(self):
        serializer = RoomSerializer(self.room)
        data = serializer.data
        self.assertEqual(data['name'], "Kitchen")
        self.assertEqual(len(data['locations']), 1)
        self.assertEqual(data['locations'][0]['name'], "Pantry Shelf")
        self.assertIn(self.box.id, data['locations'][0]['sublocations'])
        self.assertEqual(data['locations'][0]['room'], self.room.id)

    def test_location_serializer(self):
        serializer = LocationSerializer(self.box)
        data = serializer.data
        self.assertEqual(data['name'], "Box A")
        self.assertIsNone(data['room'])
        self.assertEqual(data['parent_location'], self.shelf.id)
        self.assertEqual(data['sublocations'], [])


class LocationAdminTestCase(TestCase):
    def setUp(self):
        self.site = AdminSite()
        self.admin = LocationAdmin(Location, self.site)
        self.client = Client()
        self.user = User.objects.create_superuser(username='admin', password='admin', email='admin@example.com')
        self.client.login(username='admin', password='admin')
        self.room = Room.objects.create(name="Kitchen")
        self.shelf = Location.objects.create(name="Pantry Shelf", room=self.room)
        self.box = Location.objects.create(name="Box A", parent_location=self.shelf)

    def test_get_room_display(self):
        self.assertEqual(self.admin.get_room_display(self.shelf), "Kitchen")
        self.assertEqual(self.admin.get_room_display(self.box), "Kitchen")

    def test_autocomplete_room(self):
        response = self.client.get('/admin/inventory_app/room/autocomplete/?term=Kit')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Kitchen', response.content.decode())

    def test_autocomplete_parent_location(self):
        response = self.client.get('/admin/inventory_app/location/autocomplete/?term=Pan')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Pantry Shelf', response.content.decode())
        # Verify only main locations are returned
        response_data = response.json()
        results = [item['text'] for item in response_data['results']]
        self.assertIn('Pantry Shelf', results)
        self.assertNotIn('Box A', results)

    def test_room_readonly_for_sublocation(self):
        location = Location(parent_location=self.shelf)
        readonly_fields = self.admin.get_readonly_fields(request=None, obj=location)
        self.assertIn('room', readonly_fields)