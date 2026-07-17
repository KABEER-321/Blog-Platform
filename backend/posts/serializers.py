from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Post, PostLike, Bookmark

class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'post_count']

    def get_post_count(self, obj):
        # Count only published posts in the category
        return obj.posts.filter(published=True).count()

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_image_url = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    likes_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    bookmarks_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()
    image_display_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'author_name', 'author_image_url', 'category', 'category_name',
            'title', 'slug', 'featured_image', 'image_url', 'image_display_url',
            'summary', 'content', 'published', 'reading_time',
            'likes_count', 'comment_count', 'bookmarks_count',
            'is_liked', 'is_bookmarked', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'slug', 'created_at', 'updated_at']

    def get_author_name(self, obj):
        user = obj.author
        if user.first_name or user.last_name:
            return f"{user.first_name} {user.last_name}".strip()
        return user.username

    def get_author_image_url(self, obj):
        # Fetch author profile avatar
        profile = getattr(obj.author, 'profile', None)
        if profile and profile.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(profile.profile_image.url)
            return profile.profile_image.url
        return None

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_bookmarks_count(self, obj):
        return obj.bookmarks.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.bookmarks.filter(user=request.user).exists()
        return False

    def get_reading_time(self, obj):
        words = obj.content.split() if obj.content else []
        word_count = len(words)
        minutes = max(1, round(word_count / 200))
        return f"{minutes} min read"

    def get_image_display_url(self, obj):
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return obj.image_url or None
class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLike
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class BookmarkSerializer(serializers.ModelSerializer):
    post_details = PostSerializer(source='post', read_only=True)

    class Meta:
        model = Bookmark
        fields = ['id', 'user', 'post', 'post_details', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
