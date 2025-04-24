from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import openai
from .models import Room, Location, Item
from .serializers import ItemSerializer, RoomSerializer, LocationSerializer

# ✅ OpenAI API Key (Replace with your actual key)
OPENAI_API_KEY = "your_openai_api_key"


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.prefetch_related(
        'items')  # ✅ Load related items efficiently
    serializer_class = LocationSerializer


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.prefetch_related(
        'locations__items')  # ✅ Optimize room queries
    serializer_class = RoomSerializer


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.select_related(
        "location", "location__room")  # ✅ Optimize item queries
    serializer_class = ItemSerializer


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
