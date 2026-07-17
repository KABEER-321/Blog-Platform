from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, PostViewSet, BookmarkViewSet, AuthorProfileView

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('posts', PostViewSet, basename='post')
router.register('bookmarks', BookmarkViewSet, basename='bookmark')

urlpatterns = [
    path('', include(router.urls)),
    path('authors/<int:pk>/', AuthorProfileView.as_view(), name='author-profile'),
]
