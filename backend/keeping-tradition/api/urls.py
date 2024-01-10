from django.urls import path
from . import views

urlpatterns = [
    path("user/sign-in",views.user_login ,name="user_login"),
    path("user/sign-up", views.user_signup, name="user_signup"),
    path("user/logout", views.user_logout, name="user_logout"),
    path("user/check-login", views.check_login, name="check_login"),
]
