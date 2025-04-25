from rest_framework import serializers
from .models import Room, Location, Item, Category


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), allow_null=True)
    subcategories = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'parent',
                  'subcategories', 'created_at', 'updated_at']

    def validate(self, data):
        # Erstelle eine Instanz des Modells mit den validierten Daten
        instance = Category(**data)
        # Rufe die clean-Methode auf
        instance.clean()
        return data

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.parent:
            representation['parent'] = {
                'id': instance.parent.id, 'name': instance.parent.name}
        return representation


class ItemSerializer(serializers.ModelSerializer):
    location_id = serializers.PrimaryKeyRelatedField(
        source='location.id', read_only=True)  # Add location_id for filtering

    location_name = serializers.CharField(
        source="location.name", read_only=True)  # ✅ Location Name
    room_name = serializers.CharField(
        source="location.room.name", read_only=True)  # ✅ Room Name

    class Meta:
        model = Item
        fields = '__all__'  # Ensures all item details are serialized
        # ✅ Ensures additional fields are included
        extra_fields = ["location_name", "room_name"]


class RoomSerializer(serializers.ModelSerializer):
    # Ensures locations include items
    locations = serializers.SerializerMethodField()

    def get_locations(self, obj):
        # Dynamically serialize locations using LocationSerializer
        locations = obj.locations.all()
        return LocationSerializer(locations, many=True).data
    
    class Meta:
        model = Room
        fields = '__all__'  # Ensures nested structure


class LocationSerializer(serializers.ModelSerializer):
    room = RoomSerializer(read_only=True)  # Ensures room details are included
    room_id = serializers.PrimaryKeyRelatedField(
        queryset=Room.objects.all(),
        source='room',
        write_only=True,
        allow_null=True  # Allow null for sublocations
    )
    parent_location = serializers.PrimaryKeyRelatedField(
        # Only main locations as parents
        queryset=Location.objects.filter(parent_location__isnull=True),
        allow_null=True
    )
    sublocations = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True)

    def validate(self, data):
        # Ensure sublocations don't have a room
        if data.get('parent_location') and data.get('room'):
            raise serializers.ValidationError(
                {"room_id": "Sublocations cannot have a room directly."}
            )
        # Ensure main locations have a room
        if not data.get('parent_location') and not data.get('room'):
            raise serializers.ValidationError(
                {"room_id": "Main locations must have a room."}
            )
        return data

    class Meta:
        model = Location
        fields = [
            'id',
            'name',
            'room',
            'room_id',
            'parent_location',
            'sublocations',
            'description'
        ]
