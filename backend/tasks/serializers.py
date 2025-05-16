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
        read_only_fields = ['user', 'created_at', 'task']
    
    def create(self, validated_data):
        return Comment.objects.create(**validated_data)

class TaskSerializer(serializers.ModelSerializer):
    created_by_username = serializers.SerializerMethodField(read_only=True)
    assigned_to_name = serializers.SerializerMethodField(read_only=True)
    team_name = serializers.SerializerMethodField(read_only=True)
    
    # Add these nested serializers for detailed information
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
    
    # Add these fields to handle the IDs during creation/update
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    team_id = serializers.IntegerField(write_only=True, required=False)
    
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
    
    def validate(self, data):
        # Handle assigned_to_id if present
        assigned_to_id = data.pop('assigned_to_id', None)
        if assigned_to_id:
            try:
                data['assigned_to'] = User.objects.get(id=assigned_to_id)
            except User.DoesNotExist:
                raise serializers.ValidationError({"assigned_to_id": "User does not exist"})
        
        # Handle team_id if present
        team_id = data.pop('team_id', None)
        if team_id:
            from teams.models import Team
            try:
                data['team'] = Team.objects.get(id=team_id)
            except Team.DoesNotExist:
                raise serializers.ValidationError({"team_id": "Team does not exist"})
        
        return data