from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings

User = get_user_model()

# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Adiciona logging para debug
    print(f"Tentativa de login para usuário: {username}")
    print(f"Request data: {request.data}")
    print(f"Request headers: {request.headers}")
    
    if not username or not password:
        return Response(
            {'error': 'Por favor, forneça usuário e senha'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'username': user.username,
                'email': user.email
            }
        })
    else:
        print(f"Falha na autenticação para usuário: {username}")
        return Response(
            {'error': 'Credenciais inválidas'},
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def test_view(request):
    print("Teste view foi chamada!")
    return Response({
        'status': 'ok',
        'message': 'API está funcionando!',
        'method': request.method,
        'path': request.path,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def test_post(request):
    print("Teste POST foi chamado!")
    print("Headers:", request.headers)
    print("Data:", request.data)
    return Response({
        'status': 'ok',
        'message': 'POST recebido!',
        'data': request.data
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    
    if not username or not password:
        return Response(
            {'error': 'Por favor, forneça usuário e senha'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Este usuário já existe'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email
    )
    
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'username': user.username,
            'email': user.email
        }
    }, status=status.HTTP_201_CREATED)
