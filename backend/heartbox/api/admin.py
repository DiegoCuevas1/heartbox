from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Category, Comment, Connection, Family, Notification, Post, UserProfile


class CustomUserAdmin(UserAdmin):
    model = UserProfile
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'birthdate', 'profile_picture')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'birthdate', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)


@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ('family_name', 'creator', 'invite_code', 'get_members_count', 'created_at')
    search_fields = ('family_name', 'invite_code')
    ordering = ('family_name',)
    fields = ('family_name', 'family_description', 'creator', 'invite_code', 'members', 'family_picture')
    readonly_fields = ('invite_code',)
    filter_horizontal = ('members',)
    raw_id_fields = ('creator',)

    @admin.display(description='Members')
    def get_members_count(self, obj):
        return obj.members.count()


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'family', 'datePosted', 'like_count')
    list_filter = ('datePosted', 'media_type')
    search_fields = ('title', 'message', 'user__email', 'family__family_name')
    readonly_fields = ('datePosted',)
    raw_id_fields = ('user', 'family', 'likes')

    @admin.display(description='Likes')
    def like_count(self, obj):
        return obj.likes.count()


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post', 'datePosted')
    raw_id_fields = ('user', 'post', 'parent')


admin.site.register(UserProfile, CustomUserAdmin)
admin.site.register(Category)
admin.site.register(Connection)
admin.site.register(Notification)
