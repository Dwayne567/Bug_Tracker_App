from django.contrib import admin

from .models import BugReport


@admin.register(BugReport)
class BugReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'severity', 'status', 'created_by', 'created_at', 'updated_at']
    list_filter = ['severity', 'status', 'created_at']
    search_fields = ['title', 'description', 'tags']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('id', 'title', 'description')
        }),
        ('Details', {
            'fields': ('steps_to_reproduce', 'expected_result', 'actual_result')
        }),
        ('Classification', {
            'fields': ('severity', 'status', 'environment', 'tags')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
