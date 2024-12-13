from django.db import models
from django.utils.text import slugify

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('compactadores', 'Compactadores de Solo'),
        ('placas', 'Placas Vibratórias'),
        ('cortadoras', 'Cortadoras'),
        ('bombas', 'Bombas'),
        ('vibradores', 'Vibradores'),
        ('motores', 'Motores'),
        ('outros', 'Outros'),
    ]
    
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    specs = models.JSONField(default=dict, help_text='Dynamic specifications like {"potência": "2000W"}')
    
    def __str__(self):
        return f'{self.code} - {self.name}'

class Document(models.Model):
    DOCUMENT_TYPES = [
        ('vista_explodida', 'Vista Explodida'),
        ('manual', 'Manual'),
    ]
    
    product = models.ForeignKey(Product, related_name='documents', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    external_link = models.URLField()
    nextcloud_link = models.URLField()
    
    def __str__(self):
        return f'{self.title} - {self.get_type_display()} - {self.product.name}'

class Video(models.Model):
    VIDEO_TYPES = [
        ('tecnico', 'Vídeo Técnico'),
    ]
    
    product = models.ForeignKey(Product, related_name='videos', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=VIDEO_TYPES)
    title = models.CharField(max_length=200)
    external_link = models.URLField()
    youtube_link = models.URLField()
    
    def __str__(self):
        return f'{self.title} - {self.get_type_display()} - {self.product.name}'
