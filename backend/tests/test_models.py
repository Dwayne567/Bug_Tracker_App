import pytest
from django.contrib.auth import get_user_model

from bugs.models import BugReport, Severity, Status

User = get_user_model()


@pytest.mark.django_db
class TestBugReportModel:
    """Tests for the BugReport model."""

    def test_create_bug_report(self, user):
        """Test creating a bug report with required fields."""
        bug = BugReport.objects.create(
            title="Test Bug Report",
            description="This is a test bug description.",
            created_by=user
        )
        
        assert bug.id is not None
        assert bug.title == "Test Bug Report"
        assert bug.description == "This is a test bug description."
        assert bug.severity == Severity.MEDIUM
        assert bug.status == Status.OPEN
        assert bug.created_by == user
        assert bug.created_at is not None
        assert bug.updated_at is not None

    def test_bug_report_str_representation(self, user):
        """Test the string representation of a bug report."""
        bug = BugReport.objects.create(
            title="Login button not working",
            description="The login button does not respond to clicks.",
            severity=Severity.HIGH,
            status=Status.IN_PROGRESS,
            created_by=user
        )
        
        assert str(bug) == "Login button not working (High - In Progress)"

    def test_bug_report_default_values(self, user):
        """Test that default values are set correctly."""
        bug = BugReport.objects.create(
            title="Default Values Bug",
            description="Testing default values.",
            created_by=user
        )
        
        assert bug.severity == Severity.MEDIUM
        assert bug.status == Status.OPEN
        assert bug.steps_to_reproduce == ''
        assert bug.expected_result == ''
        assert bug.actual_result == ''
        assert bug.environment == ''
        assert bug.tags == []

    def test_bug_report_with_all_fields(self, user):
        """Test creating a bug report with all fields."""
        bug = BugReport.objects.create(
            title="Complete Bug Report",
            description="This is a complete bug description.",
            steps_to_reproduce="1. Open app\n2. Click button\n3. See error",
            expected_result="Button should work",
            actual_result="Button does nothing",
            severity=Severity.CRITICAL,
            status=Status.OPEN,
            environment="Windows 11 / Chrome 121",
            tags=["ui", "button", "critical"],
            created_by=user
        )
        
        assert bug.steps_to_reproduce == "1. Open app\n2. Click button\n3. See error"
        assert bug.expected_result == "Button should work"
        assert bug.actual_result == "Button does nothing"
        assert bug.severity == Severity.CRITICAL
        assert bug.environment == "Windows 11 / Chrome 121"
        assert bug.tags == ["ui", "button", "critical"]

    def test_bug_report_ordering(self, user):
        """Test that bug reports are ordered by created_at descending."""
        bug1 = BugReport.objects.create(
            title="First Bug",
            description="First bug description.",
            created_by=user
        )
        bug2 = BugReport.objects.create(
            title="Second Bug",
            description="Second bug description.",
            created_by=user
        )
        
        bugs = BugReport.objects.all()
        assert bugs[0] == bug2
        assert bugs[1] == bug1

    def test_bug_report_cascade_delete(self, user):
        """Test that bug reports are deleted when user is deleted."""
        bug = BugReport.objects.create(
            title="Cascade Delete Bug",
            description="This bug should be deleted with the user.",
            created_by=user
        )
        bug_id = bug.id
        
        user.delete()
        
        assert not BugReport.objects.filter(id=bug_id).exists()


@pytest.fixture
def user(db):
    """Create a test user."""
    return User.objects.create_user(
        username='testuser',
        email='testuser@example.com',
        password='testpass123'
    )
