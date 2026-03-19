from django.contrib.auth import authenticate, get_user_model, login, logout
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from accounts.models import Profile
from accounts.serializers import LoginSerializer, RegisterSerializer, UserSerializer
from common.responses import api_response

User = get_user_model()


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return api_response(data=serializer.data, message="Profile fetched")


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["identifier"].strip()
        password = serializer.validated_data["password"]

        user = authenticate(request, username=identifier, password=password)
        if user is None:
            matched = User.objects.filter(email__iexact=identifier).first()
            if matched:
                user = authenticate(request, username=matched.username, password=password)
        if user is None:
            return api_response(message="Invalid credentials", status_code=401)

        login(request, user)
        return api_response(data=UserSerializer(user).data, message="Login successful")


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        tenant = request.tenant
        if tenant is None:
            return api_response(message="Tenant not resolved", status_code=400)

        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        username = serializer.validated_data.get("username") or email.split("@", 1)[0]
        password = serializer.validated_data["password"]
        company_name = serializer.validated_data.get("company_name", "")

        if User.objects.filter(email=email).exists():
            return api_response(message="Email already registered", status_code=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        Profile.objects.create(user=user, tenant=tenant, company_name=company_name)
        login(request, user)
        return api_response(data=UserSerializer(user).data, message="Account created", status_code=201)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return api_response(message="Logged out")
