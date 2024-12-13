from django.db import models
from django.conf import settings

# Create your models here.

class Client(models.Model):
    name = models.CharField(max_length=200)
    company = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        if self.company:
            return f'{self.name} ({self.company})'
        return self.name

class ClientContact(models.Model):
    client = models.ForeignKey(Client, related_name='contacts', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    position = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_primary = models.BooleanField(default=False)
    
    def __str__(self):
        return f'{self.name} - {self.position}'
