from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from .models import Comment
from .serializers import CommentSerializer

class IsCommentOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow only owners of a comment to edit/delete it.
    Admins (is_staff=True) can delete any comment.
    """
    def has_object_permission(self, request, view, obj):
        # Read operations are public
        if request.method in permissions.SAFE_METHODS:
            return True

        # Admin delete permission
        if request.method == 'DELETE' and request.user.is_authenticated and request.user.is_staff:
            return True

        # Owner permission
        return obj.user == request.user

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommentOwnerOrAdminOrReadOnly]
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        # Handle partial updates and regular updates
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
