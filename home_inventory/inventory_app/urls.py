from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import rooms_overview, room_detail, RoomViewSet, LocationViewSet, ItemViewSet, voice_add_item  # ✅ Explicit

# ✅ Use DefaultRouter for API
router = DefaultRouter()
router.register(r'api/rooms', RoomViewSet, basename='room')
router.register(r'api/locations', LocationViewSet,
                basename='location')  # ✅ Added Location API
router.register(r'api/items', ItemViewSet, basename='item')

urlpatterns = [
    # ✅ Template-based views
    path('rooms/', rooms_overview, name='rooms_overview'),
    path('rooms/<int:pk>/', room_detail, name='room_detail'),
    path('api/voice-add-item/', voice_add_item, name="voice_add_item"),

    # ✅ API ViewSet (Handles Listing, Retrieving, Updating, Deleting)
    path('', include(router.urls)),
]
