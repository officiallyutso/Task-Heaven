from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# router.register(r'', views.UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', views.search_users, name='search_users'),
    path('profile/', views.get_user_profile, name='user_profile'),
    path('register/', views.RegisterView.as_view(), name='register'),

]