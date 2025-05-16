from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Team, TeamMembership
from .serializers import TeamSerializer, TeamMembershipSerializer
from django.contrib.auth.models import User

class TeamViewSet(viewsets.ModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Team.objects.filter(members=self.request.user)
    
    def perform_create(self, serializer):
        team = serializer.save(created_by=self.request.user)
        TeamMembership.objects.create(
            team=team,
            user=self.request.user,
            role='admin'
        )
    
    @action(detail=True, methods=['post'])
    def members(self, request, pk=None):
        """Add a member to a team"""
        team = self.get_object()
        
        # Check if user is admin
        if not TeamMembership.objects.filter(team=team, user=request.user, role='admin').exists():
            return Response({"detail": "Only team admins can add members"}, status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get('user')
        role = request.data.get('role', 'member')
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if TeamMembership.objects.filter(team=team, user=user).exists():
            return Response({"detail": "User is already a member of this team"}, status=status.HTTP_400_BAD_REQUEST)
        
        membership = TeamMembership.objects.create(team=team, user=user, role=role)
        serializer = TeamMembershipSerializer(membership)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'])
    def remove_member(self, request, pk=None):
        team = self.get_object()
        
        # Check if user is admin
        if not TeamMembership.objects.filter(team=team, user=request.user, role='admin').exists():
            return Response({"detail": "Only team admins can remove members"}, status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get('user_id')
        
        try:
            membership = TeamMembership.objects.get(team=team, user_id=user_id)
        except TeamMembership.DoesNotExist:
            return Response({"detail": "User is not a member of this team"}, status=status.HTTP_404_NOT_FOUND)
        
        # Prevent removing the last admin
        if membership.role == 'admin' and TeamMembership.objects.filter(team=team, role='admin').count() <= 1:
            return Response({"detail": "Cannot remove the last admin"}, status=status.HTTP_400_BAD_REQUEST)
        
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get', 'post'])
    def members(self, request, pk=None):
        """Get or add team members"""
        team = self.get_object()
        
        if request.method == 'GET':
            # Get all members of a team
            memberships = TeamMembership.objects.filter(team=team)
            serializer = TeamMembershipSerializer(memberships, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Check if user is admin
            if not TeamMembership.objects.filter(team=team, user=request.user, role='admin').exists():
                return Response({"detail": "Only team admins can add members"}, status=status.HTTP_403_FORBIDDEN)
            
            user_id = request.data.get('user')
            role = request.data.get('role', 'member')
            
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            if TeamMembership.objects.filter(team=team, user=user).exists():
                return Response({"detail": "User is already a member of this team"}, status=status.HTTP_400_BAD_REQUEST)
            
            membership = TeamMembership.objects.create(team=team, user=user, role=role)
            serializer = TeamMembershipSerializer(membership)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

