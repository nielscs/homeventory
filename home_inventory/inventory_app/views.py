from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status
import openai
from .models import Room, Location, Item, Category
from .serializers import ItemSerializer, RoomSerializer, LocationSerializer, CategorySerializer

# ✅ OpenAI API Key (Replace with your actual key)
OPENAI_API_KEY = "your_openai_api_key"


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().prefetch_related('locations__sublocations')
    serializer_class = RoomSerializer


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all().select_related(
        'room', 'parent_location').prefetch_related('sublocations')
    serializer_class = LocationSerializer

    @action(detail=False, methods=['get'])
    def tree(self, request):
        def build_tree(location):
            room = location.get_room()
            return {
                'id': location.id,
                'name': location.name,
                'room': {'id': room.id, 'name': room.name} if room else None,
                'description': location.description,
                'sublocations': [build_tree(sub) for sub in location.sublocations.all()]
            }

        top_level = Location.objects.filter(parent_location__isnull=True).select_related('room')
        tree = [build_tree(loc) for loc in top_level]
        return Response(tree)


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all().select_related('location', 'category')
    serializer_class = ItemSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().select_related(
        'parent').prefetch_related('subcategories')
    serializer_class = CategorySerializer


@api_view(['POST'])
def voice_add_item(request):
    """
    API endpoint to process voice input and add new items based on transcribed text.
    """
    try:
        audio_file = request.FILES.get("audio")  # ✅ Capture uploaded audio
        if not audio_file:
            return Response({"error": "No audio file provided"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Transcribe audio to text using OpenAI Whisper
        openai.api_key = OPENAI_API_KEY
        transcription = openai.Audio.transcribe("whisper-1", audio_file)
        user_input = transcription["text"]

        prompt = f"""
        Extract structured information from the following text:
        - Identify item names and quantities.
        - Identify room and location (if mentioned).
        - Output in JSON format: {{
          "items": [
            {{"name": "Item1", "quantity": 1, "room": "Room1", "location": "Location1"}},
            {{"name": "Item2", "quantity": 2, "room": null, "location": null}}
          ]
        }}
        Text: {user_input}
        """

        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an assistant that extracts structured data from text."},
                {"role": "user", "content": prompt}
            ]
        )
        extracted_data = response["choices"][0]["message"]["content"]
        items_data = extracted_data.get("items", [])

        created_items = []
        for item_data in items_data:
            room = None
            location = None

            if item_data["room"]:
                room, _ = Room.objects.get_or_create(name=item_data["room"])

            if item_data["location"]:
                location, _ = Location.objects.get_or_create(
                    name=item_data["location"], room=room)

            new_item = Item.objects.create(
                name=item_data["name"],
                quantity=item_data["quantity"],
                location=location
            )
            created_items.append(new_item)

        return Response(ItemSerializer(created_items, many=True).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def rooms_overview(request):
    rooms = Room.objects.prefetch_related('locations__items').all()
    return render(request, 'inventory_app/rooms_overview.html', {'rooms': rooms})


def room_detail(request, pk):
    room = get_object_or_404(
        Room.objects.prefetch_related('locations__items'), pk=pk)
    return render(request, 'inventory_app/room_detail.html', {'room': room})
