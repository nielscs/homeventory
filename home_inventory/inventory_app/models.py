from django.db import models
from django.core.exceptions import ValidationError


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='subcategories'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name

    def clean(self):
        # Verhindere Selbstreferenz
        if self.parent and self.pk and self.parent.pk == self.pk:
            raise ValidationError(
                "Eine Kategorie kann nicht ihre eigene Parent-Kategorie sein.")

        # Prüfe auf Zyklen
        if self.parent:
            seen = {self.pk} if self.pk else set()
            current = self.parent
            while current:
                if current.pk and current.pk in seen:
                    raise ValidationError(
                        "Diese Zuweisung würde einen Zyklus in der Kategorienhierarchie verursachen.")
                if current == self:  # Direktvergleich für ungespeicherte Objekte
                    raise ValidationError(
                        "Diese Zuweisung würde einen Zyklus verursachen (direkte Selbstreferenz).")
                seen.add(current.pk)
                current = current.parent

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ['name']  # Alphabetische Sortierung nach name
        unique_together = ['name', 'parent']  # Ensures unique name per parent
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['parent']),
        ]


class Room(models.Model):
    name = models.CharField(max_length=100)
    floor_level = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Location(models.Model):
    name = models.CharField(max_length=100, default='add description here')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='locations', null=True, blank=True)
    parent_location = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='sublocations'
    )
    description = models.TextField(blank=True)

    def get_room(self):
        """Return the room for this location, inheriting from parent if a sublocation."""
        if self.parent_location:
            return self.parent_location.get_room()
        return self.room

    def validate_hierarchy(self):
        # Ensure top-level locations have a room
        if self.parent_location is None and self.room is None:
            raise ValidationError("Top-level locations must have a room.")
        # Ensure sublocations don't have a room
        if self.parent_location is not None and self.room is not None:
            raise ValidationError("Sublocations cannot have a room directly.")
        # Prevent cycles in location hierarchy
        if self.parent_location:
            seen = {self.id}
            current = self.parent_location
            while current:
                if current.id in seen:
                    raise ValidationError(f"Cycle detected in location hierarchy: {self.name}.")
                seen.add(current.id)
                current = current.parent_location

    def save(self, *args, **kwargs):
        self.validate_hierarchy()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.parent_location:
            return f"{self.name} (in {self.parent_location.name})"
        return self.name


class Item(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    serial_number = models.CharField(max_length=100, blank=True, null=True)
    purchase_date = models.DateField(blank=True, null=True)
    purchase_price = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True)
    current_value = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True)
    quantity = models.IntegerField(default=1)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True)
    location = models.ForeignKey(
        Location, related_name='items', on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
