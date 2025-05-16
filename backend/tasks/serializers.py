from rest_framework import serializers
from .models import Task, Comment
from django.contrib.auth.models import User
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
    created_by_username = serializers.SerializerMethodField(read_only=True)
    assigned_to_name = serializers.SerializerMethodField(read_only=True)
    team_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['created_by']
    
    def get_created_by_username(self, obj):
        return obj.created_by.username if obj.created_by else None
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip() or obj.assigned_to.username
        return None
    
    def get_team_name(self, obj):
        return obj.team.name if obj.team else None
    
    # Remove this create method as it's causing the conflict
    # The created_by will be set in the perform_create method in the view