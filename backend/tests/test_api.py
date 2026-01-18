import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from bugs.models import BugReport, Severity, Status

User = get_user_model()


@pytest.fixture
def api_client():
    """Return an API client."""
    return APIClient()


@pytest.fixture
def user(db):
    """Create a test user."""
    return User.objects.create_user(
        username='testuser',
        email='testuser@example.com',
        password='TestPass123!'
    )


@pytest.fixture
def other_user(db):
    """Create another test user."""
    return User.objects.create_user(
        username='otheruser',
        email='otheruser@example.com',
        password='OtherPass123!'
    )


@pytest.fixture
def authenticated_client(api_client, user):
    """Return an authenticated API client."""
    response = api_client.post(
        reverse('token-obtain-pair'),
        {'username': 'testuser', 'password': 'TestPass123!'}
    )
    token = response.data['access']
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return api_client


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


@pytest.fixture
def other_user_bug(other_user):
    """Create a bug report owned by another user."""
    return BugReport.objects.create(
        title="Other User Bug",
        description="This bug belongs to another user.",
        severity=Severity.LOW,
        status=Status.CLOSED,
        created_by=other_user
    )


@pytest.mark.django_db
class TestUserRegistration:
    """Tests for user registration endpoint."""

    def test_register_user(self, api_client):
        """Test successful user registration."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!'
        }
        response = api_client.post(reverse('auth-register'), data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'user' in response.data
        assert response.data['user']['username'] == 'newuser'
        assert User.objects.filter(username='newuser').exists()

    def test_register_duplicate_username(self, api_client, user):
        """Test registration with duplicate username fails."""
        data = {
            'username': 'testuser',  # Already exists
            'email': 'another@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!'
        }
        response = api_client.post(reverse('auth-register'), data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestAuthentication:
    """Tests for authentication endpoints."""

    def test_obtain_token(self, api_client, user):
        """Test obtaining JWT token."""
        response = api_client.post(
            reverse('token-obtain-pair'),
            {'username': 'testuser', 'password': 'TestPass123!'}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_obtain_token_invalid_credentials(self, api_client, user):
        """Test obtaining token with invalid credentials fails."""
        response = api_client.post(
            reverse('token-obtain-pair'),
            {'username': 'testuser', 'password': 'wrongpassword'}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_token(self, api_client, user):
        """Test refreshing JWT token."""
        # Get initial tokens
        response = api_client.post(
            reverse('token-obtain-pair'),
            {'username': 'testuser', 'password': 'TestPass123!'}
        )
        refresh_token = response.data['refresh']
        
        # Refresh the token
        response = api_client.post(
            reverse('token-refresh'),
            {'refresh': refresh_token}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data


@pytest.mark.django_db
class TestBugReportList:
    """Tests for bug report list endpoint."""

    def test_list_bugs_unauthenticated(self, api_client):
        """Test that unauthenticated users cannot list bugs."""
        response = api_client.get(reverse('bug-list'))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_bugs_authenticated(self, authenticated_client, bug_report):
        """Test listing bugs as authenticated user."""
        response = authenticated_client.get(reverse('bug-list'))
        
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['title'] == 'Test Bug Report'

    def test_list_only_own_bugs(self, authenticated_client, bug_report, other_user_bug):
        """Test that users only see their own bugs."""
        response = authenticated_client.get(reverse('bug-list'))
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['title'] == 'Test Bug Report'

    def test_filter_by_severity(self, authenticated_client, user):
        """Test filtering bugs by severity."""
        BugReport.objects.create(
            title="Low Bug",
            description="Low severity bug.",
            severity=Severity.LOW,
            created_by=user
        )
        BugReport.objects.create(
            title="High Bug",
            description="High severity bug.",
            severity=Severity.HIGH,
            created_by=user
        )
        
        response = authenticated_client.get(
            reverse('bug-list'),
            {'severity': 'low'}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['title'] == 'Low Bug'

    def test_filter_by_status(self, authenticated_client, user):
        """Test filtering bugs by status."""
        BugReport.objects.create(
            title="Open Bug",
            description="Open status bug.",
            status=Status.OPEN,
            created_by=user
        )
        BugReport.objects.create(
            title="Closed Bug",
            description="Closed status bug.",
            status=Status.CLOSED,
            created_by=user
        )
        
        response = authenticated_client.get(
            reverse('bug-list'),
            {'status': 'closed'}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['title'] == 'Closed Bug'

    def test_search_bugs(self, authenticated_client, user):
        """Test searching bugs by title and description."""
        BugReport.objects.create(
            title="Login Bug",
            description="Cannot login to the system.",
            created_by=user
        )
        BugReport.objects.create(
            title="Button Bug",
            description="Button not working properly.",
            created_by=user
        )
        
        response = authenticated_client.get(
            reverse('bug-list'),
            {'search': 'login'}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['title'] == 'Login Bug'


@pytest.mark.django_db
class TestBugReportCreate:
    """Tests for bug report creation endpoint."""

    def test_create_bug(self, authenticated_client):
        """Test creating a bug report."""
        data = {
            'title': 'New Bug Report',
            'description': 'This is a new bug description.',
            'severity': 'high',
            'status': 'open',
            'tags': ['ui', 'button']
        }
        response = authenticated_client.post(reverse('bug-list'), data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'New Bug Report'
        assert response.data['severity'] == 'high'
        assert BugReport.objects.filter(title='New Bug Report').exists()

    def test_create_bug_validation_error(self, authenticated_client):
        """Test creating a bug with invalid data."""
        data = {
            'title': 'Bug',  # Too short
            'description': 'Short',  # Too short
            'severity': 'invalid',
            'status': 'open'
        }
        response = authenticated_client.post(reverse('bug-list'), data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestBugReportDetail:
    """Tests for bug report detail endpoint."""

    def test_get_bug_detail(self, authenticated_client, bug_report):
        """Test getting bug report details."""
        response = authenticated_client.get(
            reverse('bug-detail', kwargs={'pk': bug_report.id})
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Test Bug Report'

    def test_get_other_user_bug_detail(self, authenticated_client, other_user_bug):
        """Test that users cannot access other users' bug details."""
        response = authenticated_client.get(
            reverse('bug-detail', kwargs={'pk': other_user_bug.id})
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestBugReportUpdate:
    """Tests for bug report update endpoint."""

    def test_update_bug(self, authenticated_client, bug_report):
        """Test updating a bug report."""
        data = {
            'title': 'Updated Bug Report',
            'description': 'This is an updated description.',
            'severity': 'critical',
            'status': 'in_progress'
        }
        response = authenticated_client.put(
            reverse('bug-detail', kwargs={'pk': bug_report.id}),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Bug Report'
        assert response.data['severity'] == 'critical'
        assert response.data['status'] == 'in_progress'

    def test_partial_update_bug(self, authenticated_client, bug_report):
        """Test partially updating a bug report."""
        data = {'status': 'resolved'}
        response = authenticated_client.patch(
            reverse('bug-detail', kwargs={'pk': bug_report.id}),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'resolved'

    def test_update_other_user_bug(self, authenticated_client, other_user_bug):
        """Test that users cannot update other users' bugs."""
        data = {'title': 'Hacked Bug'}
        response = authenticated_client.patch(
            reverse('bug-detail', kwargs={'pk': other_user_bug.id}),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestBugReportDelete:
    """Tests for bug report delete endpoint."""

    def test_delete_bug(self, authenticated_client, bug_report):
        """Test deleting a bug report."""
        bug_id = bug_report.id
        response = authenticated_client.delete(
            reverse('bug-detail', kwargs={'pk': bug_id})
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not BugReport.objects.filter(id=bug_id).exists()

    def test_delete_other_user_bug(self, authenticated_client, other_user_bug):
        """Test that users cannot delete other users' bugs."""
        response = authenticated_client.delete(
            reverse('bug-detail', kwargs={'pk': other_user_bug.id})
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert BugReport.objects.filter(id=other_user_bug.id).exists()
