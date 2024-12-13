from django.db import models
from django.conf import settings

# Create your models here.

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    all_day = models.BooleanField(default=False)
    client = models.ForeignKey('clients.Client', on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class Reminder(models.Model):
    event = models.ForeignKey(Event, related_name='reminders', on_delete=models.CASCADE)
    remind_at = models.DateTimeField()
    sent = models.BooleanField(default=False)
    
    def __str__(self):
        return f'Reminder for {self.event.title}'
