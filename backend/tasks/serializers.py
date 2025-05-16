from rest_framework import serializers
from .models import Task, Comment
from django.contrib.auth.models import User  # Add this import
from users.serializers import UserSerializer
from teams.serializers import TeamSerializer

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'task', 'user', 'content', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        return Comment.objects.create(user=user, **validated_data)

class TaskSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='assigned_to', 
        write_only=True,
        required=False,
        allow_null=True
    )
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority', 
            'created_at', 'updated_at', 'due_date', 'created_by', 
            'assigned_to', 'assigned_to_id', 'team', 'comments'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def create(self, validated_data):
        user = self.context['request'].user
        return Task.objects.create(created_by=user, **validated_data)