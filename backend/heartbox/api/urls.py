from django.urls import path
from . import views

urlpatterns = [
    path("user/sign-in",views.user_login ,name="user_login"),
    path("user/sign-up", views.user_signup, name="user_signup"),
    path("user/logout", views.user_logout, name="user_logout"),
    path("user/check-login", views.check_login, name="check_login"),
    path("user/families",views.family,name="family"),
    path('user/families/join-family', views.join_family, name='join_family'),
    path('user/families/<int:familyId>/', views.family, name='family_by_id'),
    path('user/families/leave-family',views.leave_family,name="leave_family"),
    path('user/posts',views.post,name="post"),
    path('user/posts/<int:familyId>/',views.post,name="posts"),
    path("user/posts/<int:postId>/", views.post, name="posts"),
    path('user/notifications',views.notification,name='notifications')
]
