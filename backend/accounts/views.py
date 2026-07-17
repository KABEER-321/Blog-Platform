from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth.models import User
from django.db.models import Count
from .models import Profile
from posts.models import Post, PostLike
from comments.models import Comment
from .serializers import UserSerializer, RegisterSerializer, ProfileSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Registration successful. Please log in."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, created = Profile.objects.get_or_create(user=user)
        user_data = UserSerializer(user, context={'request': request}).data
        
        total_blogs = user.posts.count()
        published_blogs = user.posts.filter(published=True).count()
        draft_blogs = user.posts.filter(published=False).count()
        
        likes_received = PostLike.objects.filter(post__author=user).count()
        comments_received = Comment.objects.filter(post__author=user).count()
        
        activities = []
        recent_posts = user.posts.order_by('-created_at')[:5]
        for p in recent_posts:
            activities.append({
                'id': f"post-{p.id}",
                'type': 'post',
                'description': f"Created blog post '{p.title}'",
                'date': p.created_at,
                'published': p.published
            })
            
        recent_comments = user.comments.order_by('-created_at')[:5]
        for c in recent_comments:
            activities.append({
                'id': f"comment-{c.id}",
                'type': 'comment',
                'description': f"Commented on '{c.post.title}'",
                'date': c.created_at
            })
            
        activities = sorted(activities, key=lambda x: x['date'], reverse=True)[:5]
        
        latest_posts = user.posts.order_by('-created_at')[:3]
        latest_posts_data = []
        for lp in latest_posts:
            img_url = lp.image_url
            if lp.featured_image:
                img_url = request.build_absolute_uri(lp.featured_image.url)
            latest_posts_data.append({
                'id': lp.id,
                'title': lp.title,
                'slug': lp.slug,
                'summary': lp.summary,
                'image_display_url': img_url,
                'published': lp.published,
                'created_at': lp.created_at
            })

        response_data = {
            "user": user_data,
            "stats": {
                "total_blogs": total_blogs,
                "published_blogs": published_blogs,
                "draft_blogs": draft_blogs,
                "likes_received": likes_received,
                "comments_received": comments_received,
            },
            "recent_activity": activities,
            "latest_blogs": latest_posts_data
        }
        return Response(response_data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        profile, created = Profile.objects.get_or_create(user=user)
        
        username = request.data.get('username')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')

        user_changed = False
        if username and username != user.username:
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return Response({"username": ["A user with that username already exists."]}, status=status.HTTP_400_BAD_REQUEST)
            user.username = username
            user_changed = True
        
        if first_name is not None and first_name != user.first_name:
            user.first_name = first_name
            user_changed = True
            
        if last_name is not None and last_name != user.last_name:
            user.last_name = last_name
            user_changed = True
            
        if email is not None and email != user.email:
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response({"email": ["A user with that email already exists."]}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email
            user_changed = True
            
        if user_changed:
            user.save()

        profile_serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if profile_serializer.is_valid():
            profile_serializer.save()
            return Response(profile_serializer.data, status=status.HTTP_200_OK)
            
        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_blogs = Post.objects.count()
        published_blogs = Post.objects.filter(published=True).count()
        draft_blogs = Post.objects.filter(published=False).count()
        total_comments = Comment.objects.count()
        
        # Most active authors (Top 5)
        active_authors = User.objects.annotate(posts_count=Count('posts')).order_by('-posts_count')[:5]
        active_authors_data = []
        for author in active_authors:
            active_authors_data.append({
                'id': author.id,
                'name': f"{author.first_name} {author.last_name}".strip() or author.username,
                'username': author.username,
                'email': author.email,
                'posts_count': author.posts_count
            })
            
        # Recent Users (Top 5)
        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_users_data = []
        for u in recent_users:
            recent_users_data.append({
                'id': u.id,
                'name': f"{u.first_name} {u.last_name}".strip() or u.username,
                'email': u.email,
                'date_joined': u.date_joined
            })
            
        # Recent Blogs (Top 5)
        recent_blogs = Post.objects.order_by('-created_at')[:5]
        recent_blogs_data = []
        for p in recent_blogs:
            recent_blogs_data.append({
                'id': p.id,
                'title': p.title,
                'author': f"{p.author.first_name} {p.author.last_name}".strip() or p.author.username,
                'published': p.published,
                'created_at': p.created_at
            })
            
        # Recent Comments (Top 5)
        recent_comments = Comment.objects.order_by('-created_at')[:5]
        recent_comments_data = []
        for c in recent_comments:
            recent_comments_data.append({
                'id': c.id,
                'post_title': c.post.title,
                'user_name': f"{c.user.first_name} {c.user.last_name}".strip() or c.user.username,
                'comment': c.comment,
                'created_at': c.created_at
            })
            
        return Response({
            'stats': {
                'total_users': total_users,
                'total_blogs': total_blogs,
                'published_blogs': published_blogs,
                'draft_blogs': draft_blogs,
                'total_comments': total_comments
            },
            'active_authors': active_authors_data,
            'recent_users': recent_users_data,
            'recent_blogs': recent_blogs_data,
            'recent_comments': recent_comments_data
        }, status=status.HTTP_200_OK)
