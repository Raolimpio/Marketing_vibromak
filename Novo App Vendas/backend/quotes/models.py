from django.db import models
from products.models import Product

class Quote(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('negotiating', 'Negotiating'),
        ('approved', 'Approved'),
        ('closed', 'Closed'),
        ('lost', 'Lost')
    ]
    
    number = models.CharField(max_length=50, unique=True)
    client = models.ForeignKey('clients.Client', on_delete=models.PROTECT)
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    payment_terms = models.TextField(blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def __str__(self):
        return f'Quote #{self.number} - {self.client}'

class QuoteItem(models.Model):
    quote = models.ForeignKey(Quote, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, null=True, blank=True)
    description = models.CharField(max_length=200)  # Para itens manuais
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    @property
    def total(self):
        return self.price * self.quantity
    
    def __str__(self):
        return self.description or self.product.name
