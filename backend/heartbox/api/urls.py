from django.urls import path

from . import views

urlpatterns = [
    # Auth
    path("user/sign-in", views.user_login, name="user_login"),
    path("user/sign-up", views.user_signup, name="user_signup"),
    path("user/logout", views.user_logout, name="user_logout"),
    path("user/check-login", views.check_login, name="check_login"),
    path("user/forgot-password", views.forgot_password, name="forgot_password"),
    path("user/reset-password", views.reset_password, name="reset_password"),
    # Families (HeartBoxes)
    path("user/families", views.family, name="family"),
    path("user/families/join-family", views.join_family, name="join_family"),
    path("user/families/leave-family", views.leave_family, name="leave_family"),
    path("user/families/members", views.getMembersOfFamily, name="family_members"),
    path("user/families/<int:family_id>/settings", views.update_family, name="update_family"),
    path("user/families/<int:family_id>/remove-member", views.remove_family_member, name="remove_family_member"),
    # Posts (Relics). Filters are query params: ?postId= ?familyId= ?userId= plus ?before= &limit=
    path("user/posts", views.post, name="posts"),
    path("user/posts/category/<str:category>/", views.post, name="posts_by_category"),
    path("user/posts/<int:post_id>", views.post_detail, name="post_detail"),
    path("user/posts/<int:post_id>/like", views.like_post, name="like_post"),
    path("user/categories", views.categories, name="categories"),
    path("user/comments", views.comments, name="comments"),
    # Notifications
    path("user/notifications", views.notification, name="notifications"),
    path("user/notification/count", views.notification_count, name="notification_count"),
    path("user/notification/<int:notification_id>/read", views.mark_notification_read, name="mark_notification_read"),
    path("user/notification/mark-all-read", views.mark_all_notifications_read, name="mark_all_notifications_read"),
    # People
    path("user/users", views.get_user_details, name="user_details_by_id"),
    path("user/search", views.search, name="search"),
    path("user/connections", views.connections, name="connections"),
    path("connections/request", views.send_connection_request, name="send_connection_request"),
    path("connections/respond", views.respond_to_connection_request, name="respond_to_connection_request"),
    path("connections/cancel", views.cancel_connection_request, name="cancel_connection_request"),
    path("connections/remove", views.remove_connection, name="remove_connection"),
]
