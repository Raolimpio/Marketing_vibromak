from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class User(AbstractUser):
    ROLES = [
        ('admin', 'Administrator'),
        ('seller', 'Seller'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLES, default='seller')
    
    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
    
    def __str__(self):
        return self.username
