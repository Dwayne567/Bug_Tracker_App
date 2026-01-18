from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a bug report to view/edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Check if the user is the owner of the bug report
        return obj.created_by == request.user
