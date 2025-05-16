from django.urls import path
from .views import RegisterView, UserListView, ProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('list/', UserListView.as_view(), name='user-list'),
    path('profile/', ProfileView.as_view(), name='profile'),
]