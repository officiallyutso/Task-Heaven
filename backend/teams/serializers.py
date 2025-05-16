from rest_framework import serializers
from .models import Team, TeamMembership
from django.contrib.auth.models import User

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class TeamMembershipSerializer(serializers.ModelSerializer):
    user = TeamMemberSerializer(read_only=True)
    
    class Meta:
        model = TeamMembership
        fields = ['id', 'user', 'team', 'role', 'joined_at']
        read_only_fields = ['joined_at']

class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(many=True, read_only=True)
    created_by = TeamMemberSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'created_at', 'created_by', 'members', 'members_count', 'is_admin']
    
    def get_members_count(self, obj):
        return obj.members.count()
    
    def get_is_admin(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return TeamMembership.objects.filter(team=obj, user=request.user, role='admin').exists()
        return False
