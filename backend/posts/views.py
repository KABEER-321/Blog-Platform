from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db.models import Count, Q
from .models import Category, Post, PostLike, Bookmark
from .serializers import CategorySerializer, PostSerializer, BookmarkSerializer
from accounts.serializers import UserSerializer
from accounts.models import Profile
from comments.models import Comment
from comments.serializers import CommentSerializer

class IsAuthorOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authors of a post to edit or delete it.
    Admins (is_staff=True) can delete any post.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        # Admins can delete any post
        if request.method == 'DELETE' and request.user.is_authenticated and request.user.is_staff:
            return True

        # Otherwise, the user must be the author of the post.
        return obj.author == request.user

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        # Prevent deletion if category contains posts (published or draft)
        if category.posts.exists():
            return Response(
                {"error": "Cannot delete category because it contains active posts. Please reassign or delete those posts first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrAdminOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        queryset = Post.objects.all()
        request = self.request

        # Filtering parameters
        search_query = request.query_params.get('search', None)
        category_id = request.query_params.get('category', None)
        published_status = request.query_params.get('published', None)
        author_id = request.query_params.get('author', None)
        sort_by = request.query_params.get('sort_by', 'newest')

        # Filter by search term (Title, Summary, Author, Category)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(summary__icontains=search_query) |
                Q(author__username__icontains=search_query) |
                Q(author__first_name__icontains=search_query) |
                Q(author__last_name__icontains=search_query) |
                Q(category__name__icontains=search_query)
            )

        # Filter by Category ID
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter by Author ID
        if author_id:
            queryset = queryset.filter(author_id=author_id)

        # Filter by Published Status
        if published_status is not None:
            val = published_status.lower() == 'true'
            queryset = queryset.filter(published=val)
        else:
            # By default, public users can only see published posts.
            # Logged-in users can filter by drafts or see drafts if they own them.
            if not request.user or not request.user.is_authenticated:
                queryset = queryset.filter(published=True)
            elif not request.user.is_staff:
                queryset = queryset.filter(Q(published=True) | Q(author=request.user))

        # Annotate count of comments for sorting
        queryset = queryset.annotate(num_comments=Count('comments'))

        # Sorting
        if sort_by == 'oldest':
            queryset = queryset.order_by('created_at')
        elif sort_by == 'alphabetical':
            queryset = queryset.order_by('title')
        elif sort_by == 'most_commented':
            queryset = queryset.order_by('-num_comments', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, id=None):
        post = self.get_object()
        like_filter = PostLike.objects.filter(user=request.user, post=post)
        if like_filter.exists():
            like_filter.delete()
            liked = False
        else:
            PostLike.objects.create(user=request.user, post=post)
            liked = True
        return Response({
            "is_liked": liked,
            "likes_count": post.likes.count()
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def bookmark(self, request, id=None):
        post = self.get_object()
        bookmark_filter = Bookmark.objects.filter(user=request.user, post=post)
        if bookmark_filter.exists():
            bookmark_filter.delete()
            bookmarked = False
        else:
            Bookmark.objects.create(user=request.user, post=post)
            bookmarked = True
        return Response({
            "is_bookmarked": bookmarked,
            "bookmarks_count": post.bookmarks.count()
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def related(self, request, id=None):
        post = self.get_object()
        related_posts = Post.objects.filter(category=post.category, published=True).exclude(id=post.id).order_by('-created_at')[:3]
        serializer = self.get_serializer(related_posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def comments(self, request, id=None):
        post = self.get_object()
        if request.method == 'GET':
            comments_list = post.comments.all().order_by('-created_at')
            serializer = CommentSerializer(comments_list, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Add comment
        serializer = CommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookmarkViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).order_by('-created_at')

class AuthorProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk=None):
        try:
            author = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({"error": "Author profile not found."}, status=status.HTTP_404_NOT_FOUND)

        profile, created = Profile.objects.get_or_create(user=author)
        author_serializer = UserSerializer(author, context={'request': request})
        
        # Author published posts
        published_posts = author.posts.filter(published=True).order_by('-created_at')
        posts_serializer = PostSerializer(published_posts, many=True, context={'request': request})
        
        # Statistics
        total_blogs = author.posts.count()
        published_blogs = published_posts.count()

        return Response({
            "author": author_serializer.data,
            "stats": {
                "total_blogs": total_blogs,
                "published_blogs": published_blogs
            },
            "posts": posts_serializer.data
        }, status=status.HTTP_200_OK)
