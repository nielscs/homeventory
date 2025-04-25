from django.contrib import admin
from django import forms
from .models import Category, Room, Location, Item


class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'room', 'parent_location', 'description')
    list_filter = ('room', 'parent_location')
    search_fields = ('name', 'description')
    raw_id_fields = ('room', 'parent_location')  # Improves performance


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
