from rest_framework import serializers
from .models import Product, Document, Video

class DocumentSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Document
        fields = ['id', 'type', 'type_display', 'title', 'nextcloud_link']

class VideoSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Video
        fields = ['id', 'type', 'type_display', 'title', 'youtube_link']

class ProductSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'code', 'category', 'category_display', 
                 'price', 'specs', 'documents', 'videos']
        read_only_fields = ['category_display']
