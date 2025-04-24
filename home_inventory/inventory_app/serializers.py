from rest_framework import serializers
from .models import Room, Location, Item


class ItemSerializer(serializers.ModelSerializer):
    location_id = serializers.PrimaryKeyRelatedField(
        source='location.id', read_only=True)  # Add location_id for filtering
    
    location_name = serializers.CharField(source="location.name", read_only=True)  # ✅ Location Name
    room_name = serializers.CharField(source="location.room.name", read_only=True)  # ✅ Room Name

    class Meta:
        model = Item
        fields = '__all__'  # Ensures all item details are serialized
        extra_fields = ["location_name", "room_name"]  # ✅ Ensures additional fields are included


class LocationSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, read_only=True)  # ✅ Keep items read-only
    room_id = serializers.PrimaryKeyRelatedField(
        queryset=Room.objects.all(),  # ✅ Ensure valid rooms are used
        source='room',  # ✅ Maps `room_id` in API to `room` in DB
        required=False  # ✅ Allow partial updates without forcing `room_id`
    )

    class Meta:
        model = Location
        fields = ['id', 'name', 'description', 'room_id', 'items']  # ✅ Explicit field list


class RoomSerializer(serializers.ModelSerializer):
    # Ensures locations include items
    locations = LocationSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = '__all__'  # Ensures nested structure
