from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, status, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .filters import BugReportFilter
from .models import BugReport
from .permissions import IsOwner
from .serializers import (
    BugReportCreateUpdateSerializer,
    BugReportSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)

User = get_user_model()


@extend_schema(tags=['Authentication'])
class UserRegistrationView(generics.CreateAPIView):
    """
    Register a new user account.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'User registered successfully.',
                'user': UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )


@extend_schema_view(
    list=extend_schema(
        tags=['Bug Reports'],
        summary='List all bug reports',
        description='Retrieve a list of bug reports created by the authenticated user. '
                    'Supports filtering by severity and status, searching in title and description, '
                    'and ordering by various fields.'
    ),
    create=extend_schema(
        tags=['Bug Reports'],
        summary='Create a bug report',
        description='Create a new bug report. The authenticated user will be set as the creator.'
    ),
    retrieve=extend_schema(
        tags=['Bug Reports'],
        summary='Retrieve a bug report',
        description='Get details of a specific bug report owned by the authenticated user.'
    ),
    update=extend_schema(
        tags=['Bug Reports'],
        summary='Update a bug report',
        description='Fully update a bug report owned by the authenticated user.'
    ),
    partial_update=extend_schema(
        tags=['Bug Reports'],
        summary='Partially update a bug report',
        description='Partially update a bug report owned by the authenticated user.'
    ),
    destroy=extend_schema(
        tags=['Bug Reports'],
        summary='Delete a bug report',
        description='Delete a bug report owned by the authenticated user.'
    ),
)
class BugReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing bug reports.
    
    Only authenticated users can access this endpoint.
    Users can only view and modify their own bug reports.
    """
    permission_classes = [IsAuthenticated, IsOwner]
    filterset_class = BugReportFilter
    filter_backends = [
        SearchFilter,
        OrderingFilter,
    ]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'severity', 'status', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return only bug reports belonging to the current user."""
        if getattr(self, 'swagger_fake_view', False):
            return BugReport.objects.none()
        return BugReport.objects.filter(created_by=self.request.user)

    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action in ['create', 'update', 'partial_update']:
            return BugReportCreateUpdateSerializer
        return BugReportSerializer

    def perform_create(self, serializer):
        """Set the created_by field to the current user."""
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create a new bug report and return full details."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full bug report data with nested user info
        bug_report = BugReport.objects.get(pk=serializer.instance.pk)
        response_serializer = BugReportSerializer(bug_report)
        
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        """Update a bug report and return full details."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full bug report data with nested user info
        instance.refresh_from_db()
        response_serializer = BugReportSerializer(instance)
        
        return Response(response_serializer.data)
