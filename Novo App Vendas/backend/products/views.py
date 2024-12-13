from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum
from django.db.models.functions import ExtractMonth
from datetime import datetime, timedelta
from .models import Product, Document, Video
from .serializers import ProductSerializer, DocumentSerializer, VideoSerializer

# Create your views here.

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code', 'price']
    ordering = ['category', 'code']  # default ordering

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        # Obtém o ano atual
        current_year = datetime.now().year
        
        # Vendas por mês (últimos 12 meses)
        sales_history = (
            Product.objects.filter(
                created_at__year=current_year
            ).annotate(
                month=ExtractMonth('created_at')
            ).values('month').annotate(
                value=Count('id')
            ).order_by('month')
        )

        # Converter números de mês para nomes
        month_names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        sales_history_formatted = [
            {
                'month': month_names[item['month'] - 1],
                'value': item['value']
            }
            for item in sales_history
        ]

        # Vendas por categoria
        sales_by_category = (
            Product.objects.values('category').annotate(
                value=Count('id')
            ).order_by('-value')
        )

        # Top produtos
        top_products = (
            Product.objects.values('name').annotate(
                value=Count('id')
            ).order_by('-value')[:10]
        )

        return Response({
            'salesHistory': sales_history_formatted,
            'salesByCategory': list(sales_by_category),
            'topProducts': list(top_products)
        })

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'type']

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product']
