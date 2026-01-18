import uuid

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models


class Severity(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'
    CRITICAL = 'critical', 'Critical'


class Status(models.TextChoices):
    OPEN = 'open', 'Open'
    IN_PROGRESS = 'in_progress', 'In Progress'
    RESOLVED = 'resolved', 'Resolved'
    CLOSED = 'closed', 'Closed'


class BugReport(models.Model):
    """Model representing a bug report."""
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    title = models.CharField(
        max_length=255,
        help_text="Brief description of the bug"
    )
    description = models.TextField(
        help_text="Detailed description of the bug"
    )
    steps_to_reproduce = models.TextField(
        blank=True,
        default='',
        help_text="Steps to reproduce the bug"
    )
    expected_result = models.TextField(
        blank=True,
        default='',
        help_text="What should happen"
    )
    actual_result = models.TextField(
        blank=True,
        default='',
        help_text="What actually happens"
    )
    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        default=Severity.MEDIUM,
        help_text="Severity level of the bug"
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
        help_text="Current status of the bug"
    )
    environment = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Environment where the bug was found (e.g., 'Windows 11 / Chrome 121')"
    )
    tags = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        default=list,
        help_text="Tags for categorizing the bug"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bug_reports',
        help_text="User who created this bug report"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Bug Report'
        verbose_name_plural = 'Bug Reports'

    def __str__(self):
        return f"{self.title} ({self.get_severity_display()} - {self.get_status_display()})"
