from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import BugReportViewSet, UserRegistrationView

router = DefaultRouter()
router.register(r'bugs', BugReportViewSet, basename='bug')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', UserRegistrationView.as_view(), name='auth-register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    # Bug report endpoints
    path('', include(router.urls)),
]
