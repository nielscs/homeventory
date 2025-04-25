from django.test import TestCase
from rest_framework.test import APIClient
from inventory_app.models import Room, Location
from inventory_app.serializers import RoomSerializer, LocationSerializer


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
