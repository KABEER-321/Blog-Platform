from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_image_url = serializers.SerializerMethodField()
    is_edited = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'user_name', 'user_image_url', 'comment', 'is_edited', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        user = obj.user
        if user.first_name or user.last_name:
            return f"{user.first_name} {user.last_name}".strip()
        return user.username

    def get_user_image_url(self, obj):
        profile = getattr(obj.user, 'profile', None)
        if profile and profile.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(profile.profile_image.url)
            return profile.profile_image.url
        return None

    def get_is_edited(self, obj):
        # Allow a small 1-second margin for auto_now/auto_now_add sync
        return (obj.updated_at - obj.created_at).total_seconds() > 2.0
