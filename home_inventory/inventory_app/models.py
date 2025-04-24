from django.db import models
from django.core.exceptions import ValidationError


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', null=True, blank=True,
                               on_delete=models.CASCADE, related_name='subcategories')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name

    def clean(self):
        # Verhindere Selbstreferenz
        if self.parent and self.pk and self.parent.pk == self.pk:
            raise ValidationError("Eine Kategorie kann nicht ihre eigene Parent-Kategorie sein.")

        # Prüfe auf Zyklen
        if self.parent:
            seen = {self.pk} if self.pk else set()
            current = self.parent
            while current:
                if current.pk and current.pk in seen:
                    raise ValidationError("Diese Zuweisung würde einen Zyklus in der Kategorienhierarchie verursachen.")
                if current == self:  # Direktvergleich für ungespeicherte Objekte
                    raise ValidationError("Diese Zuweisung würde einen Zyklus verursachen (direkte Selbstreferenz).")
                seen.add(current.pk)
                current = current.parent

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
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
    name = models.CharField(max_length=100)
    room = models.ForeignKey(
        Room, related_name='locations', on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} in {self.room.name}"


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
