from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import BugReport, Severity, Status

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password_confirm']
        extra_kwargs = {
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': "Passwords don't match."
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = ['id']


class BugReportSerializer(serializers.ModelSerializer):
    """Serializer for BugReport model."""
    
    created_by = UserSerializer(read_only=True)
    severity_display = serializers.CharField(
        source='get_severity_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    class Meta:
        model = BugReport
        fields = [
            'id',
            'title',
            'description',
            'steps_to_reproduce',
            'expected_result',
            'actual_result',
            'severity',
            'severity_display',
            'status',
            'status_display',
            'environment',
            'tags',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError(
                "Title must be at least 5 characters long."
            )
        if len(value) > 255:
            raise serializers.ValidationError(
                "Title must not exceed 255 characters."
            )
        return value

    def validate_description(self, value):
        if len(value) < 10:
            raise serializers.ValidationError(
                "Description must be at least 10 characters long."
            )
        return value

    def validate_severity(self, value):
        valid_choices = [choice[0] for choice in Severity.choices]
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"Invalid severity. Choose from: {', '.join(valid_choices)}"
            )
        return value

    def validate_status(self, value):
        valid_choices = [choice[0] for choice in Status.choices]
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"Invalid status. Choose from: {', '.join(valid_choices)}"
            )
        return value

    def validate_tags(self, value):
        if value:
            # Ensure all tags are strings and not too long
            cleaned_tags = []
            for tag in value:
                if not isinstance(tag, str):
                    raise serializers.ValidationError("All tags must be strings.")
                tag = tag.strip().lower()
                if len(tag) > 50:
                    raise serializers.ValidationError(
                        f"Tag '{tag[:20]}...' exceeds 50 characters."
                    )
                if tag:
                    cleaned_tags.append(tag)
            return cleaned_tags
        return value


class BugReportCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating BugReport."""
    
    class Meta:
        model = BugReport
        fields = [
            'title',
            'description',
            'steps_to_reproduce',
            'expected_result',
            'actual_result',
            'severity',
            'status',
            'environment',
            'tags',
        ]

    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError(
                "Title must be at least 5 characters long."
            )
        if len(value) > 255:
            raise serializers.ValidationError(
                "Title must not exceed 255 characters."
            )
        return value

    def validate_description(self, value):
        if len(value) < 10:
            raise serializers.ValidationError(
                "Description must be at least 10 characters long."
            )
        return value

    def validate_severity(self, value):
        valid_choices = [choice[0] for choice in Severity.choices]
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"Invalid severity. Choose from: {', '.join(valid_choices)}"
            )
        return value

    def validate_status(self, value):
        valid_choices = [choice[0] for choice in Status.choices]
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"Invalid status. Choose from: {', '.join(valid_choices)}"
            )
        return value

    def validate_tags(self, value):
        if value:
            cleaned_tags = []
            for tag in value:
                if not isinstance(tag, str):
                    raise serializers.ValidationError("All tags must be strings.")
                tag = tag.strip().lower()
                if len(tag) > 50:
                    raise serializers.ValidationError(
                        f"Tag '{tag[:20]}...' exceeds 50 characters."
                    )
                if tag:
                    cleaned_tags.append(tag)
            return cleaned_tags
        return value
