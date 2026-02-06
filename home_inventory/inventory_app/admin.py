from django.contrib import admin
from django import forms
from .models import Category, Room, Location, Item


class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_room_display', 'parent_location', 'description')
    list_filter = ('room', 'parent_location')
    search_fields = ('name', 'description')
    raw_id_fields = ('room', 'parent_location')  # Improves performance
    ordering = ('room',)  # Sort by name for clarity

    def get_room_display(self, obj):
        """Display the inherited room in the admin list view."""
        room = obj.get_room()
        return room.name if room else 'None'
    get_room_display.short_description = 'Room'

    def get_form(self, request, obj=None, **kwargs):
        """Make the room field read-only for sublocations."""
        form = super().get_form(request, obj, **kwargs)
        if obj and obj.parent_location:
            form.base_fields['room'].disabled = True
        return form


class CategoryAdminForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        # Rufe die Modell-clean-Methode explizit auf
        instance = self.instance
        instance.name = cleaned_data.get('name', instance.name)
        instance.description = cleaned_data.get(
            'description', instance.description)
        instance.parent = cleaned_data.get('parent', instance.parent)
        instance.clean()
        return cleaned_data


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    form = CategoryAdminForm
    list_display = ('name', 'parent', 'created_at')
    list_filter = ('parent',)
    search_fields = ('name', 'description')
    ordering = ('name',)
    fields = ('name', 'description', 'parent')
    autocomplete_fields = ['parent']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('parent').order_by('name')


admin.site.register(Room)
admin.site.register(Location, LocationAdmin)
admin.site.register(Item)
