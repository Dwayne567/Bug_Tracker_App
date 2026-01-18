import pytest
from django.contrib.auth import get_user_model

from bugs.models import BugReport, Severity, Status
from bugs.serializers import (
    BugReportCreateUpdateSerializer,
    BugReportSerializer,
    UserRegistrationSerializer,
)

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistrationSerializer:
    """Tests for UserRegistrationSerializer."""

    def test_valid_registration(self):
        """Test valid user registration."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!'
        }
        serializer = UserRegistrationSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()
        assert user.username == 'newuser'
        assert user.email == 'newuser@example.com'
        assert user.check_password('SecurePass123!')

    def test_password_mismatch(self):
        """Test that mismatched passwords fail validation."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'DifferentPass123!'
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password_confirm' in serializer.errors

    def test_weak_password(self):
        """Test that weak passwords fail validation."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': '123',
            'password_confirm': '123'
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password' in serializer.errors


@pytest.mark.django_db
class TestBugReportSerializer:
    """Tests for BugReportSerializer."""

    def test_serialize_bug_report(self, user, bug_report):
        """Test serializing a bug report."""
        serializer = BugReportSerializer(bug_report)
        data = serializer.data
        
        assert data['id'] == str(bug_report.id)
        assert data['title'] == bug_report.title
        assert data['description'] == bug_report.description
        assert data['severity'] == bug_report.severity
        assert data['severity_display'] == bug_report.get_severity_display()
        assert data['status'] == bug_report.status
        assert data['status_display'] == bug_report.get_status_display()
        assert data['created_by']['username'] == user.username

    def test_title_too_short(self):
        """Test that short titles fail validation."""
        data = {
            'title': 'Bug',
            'description': 'This is a valid description.',
            'severity': 'medium',
            'status': 'open'
        }
        serializer = BugReportSerializer(data=data)
        assert not serializer.is_valid()
        assert 'title' in serializer.errors

    def test_description_too_short(self):
        """Test that short descriptions fail validation."""
        data = {
            'title': 'Valid Title Here',
            'description': 'Short',
            'severity': 'medium',
            'status': 'open'
        }
        serializer = BugReportSerializer(data=data)
        assert not serializer.is_valid()
        assert 'description' in serializer.errors

    def test_invalid_severity(self):
        """Test that invalid severity fails validation."""
        data = {
            'title': 'Valid Title Here',
            'description': 'This is a valid description.',
            'severity': 'invalid',
            'status': 'open'
        }
        serializer = BugReportSerializer(data=data)
        assert not serializer.is_valid()
        assert 'severity' in serializer.errors

    def test_invalid_status(self):
        """Test that invalid status fails validation."""
        data = {
            'title': 'Valid Title Here',
            'description': 'This is a valid description.',
            'severity': 'medium',
            'status': 'invalid'
        }
        serializer = BugReportSerializer(data=data)
        assert not serializer.is_valid()
        assert 'status' in serializer.errors

    def test_valid_tags(self):
        """Test that valid tags pass validation."""
        data = {
            'title': 'Valid Title Here',
            'description': 'This is a valid description.',
            'severity': 'medium',
            'status': 'open',
            'tags': ['ui', 'button', 'frontend']
        }
        serializer = BugReportCreateUpdateSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_tags_cleaned_and_lowercased(self):
        """Test that tags are cleaned and lowercased."""
        data = {
            'title': 'Valid Title Here',
            'description': 'This is a valid description.',
            'severity': 'medium',
            'status': 'open',
            'tags': ['  UI  ', 'BUTTON', '  Frontend  ']
        }
        serializer = BugReportCreateUpdateSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data['tags'] == ['ui', 'button', 'frontend']


@pytest.fixture
def user(db):
    """Create a test user."""
    return User.objects.create_user(
        username='testuser',
        email='testuser@example.com',
        password='testpass123'
    )


@pytest.fixture
def bug_report(user):
    """Create a test bug report."""
    return BugReport.objects.create(
        title="Test Bug Report",
        description="This is a test bug description.",
        severity=Severity.HIGH,
        status=Status.OPEN,
        tags=["test", "bug"],
        created_by=user
    )
