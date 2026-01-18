import django_filters

from .models import BugReport


class BugReportFilter(django_filters.FilterSet):
    """Filter for BugReport queryset."""
    
    severity = django_filters.CharFilter(field_name='severity', lookup_expr='exact')
    status = django_filters.CharFilter(field_name='status', lookup_expr='exact')
    created_after = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='gte'
    )
    created_before = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='lte'
    )
    tags = django_filters.CharFilter(method='filter_tags')

    class Meta:
        model = BugReport
        fields = ['severity', 'status']

    def filter_tags(self, queryset, name, value):
        """Filter by tag (checks if tag is in the tags array)."""
        if value:
            return queryset.filter(tags__contains=[value.lower()])
        return queryset
