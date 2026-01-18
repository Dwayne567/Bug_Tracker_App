import pytest
from django.contrib.auth import get_user_model

from bugs.models import BugReport, Severity, Status

User = get_user_model()


@pytest.fixture
def user(db):
    """Create a test user."""
    return User.objects.create_user(
        username='testuser',
        email='testuser@example.com',
        password='testpass123'
    )


@pytest.fixture
def other_user(db):
    """Create another test user."""
    return User.objects.create_user(
        username='otheruser',
        email='otheruser@example.com',
        password='otherpass123'
    )


@pytest.fixture
def bug_report(user):
    """Create a test bug report."""
    return BugReport.objects.create(
        title="Test Bug Report",
        description="This is a test bug description.",
        severity=Severity.HIGH,
        status=Status.OPEN,
        created_by=user
    )
