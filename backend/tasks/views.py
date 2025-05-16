from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Task, Comment
from .serializers import TaskSerializer, CommentSerializer
from teams.models import TeamMembership

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'team', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'priority']
    
    def get_queryset(self):
        user = self.request.user
        user_teams = user.teams.all()
        return Task.objects.filter(team__in=user_teams)
    
    def perform_create(self, serializer):
        # This is the only place where created_by should be set
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        task = self.get_object()
        
        if request.method == 'GET':
            comments = Comment.objects.filter(task=task).order_by('-created_at')
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Check if user is a member of the team
            if not TeamMembership.objects.filter(team=task.team, user=request.user).exists():
                return Response({"detail": "You are not a member of this team"}, status=status.HTTP_403_FORBIDDEN)
            
            # Create a new comment
            content = request.data.get('content')
            if not content:
                return Response({"detail": "Comment content is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            comment = Comment.objects.create(
                task=task,
                user=request.user,
                content=content
            )
            
            serializer = CommentSerializer(comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        user_teams = user.teams.all()
        return Comment.objects.filter(task__team__in=user_teams)
    
    def perform_create(self, serializer):
        task_id = self.request.data.get('task')
        task = Task.objects.get(id=task_id)
        if not TeamMembership.objects.filter(team=task.team, user=self.request.user).exists():
            return Response({"detail": "You are not a member of this team"}, status=403)
        serializer.save(user=self.request.user)
