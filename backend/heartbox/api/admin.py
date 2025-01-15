from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UserProfile, Family, Post

class CustomUserAdmin(UserAdmin):
    model = UserProfile
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_superuser')
    list_filter = ('is_staff', 'is_superuser', 'groups')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'birthdate', 'pin', 'profile_picture')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'birthdate', 'pin', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

class FamilyAdmin(admin.ModelAdmin):
    list_display = ('family_name', 'invite_code', 'get_members_count', 'family_picture')  # Display family picture
    search_fields = ('family_name', 'invite_code')
    list_filter = ('family_name',)
    ordering = ('family_name',)
    fields = ('family_name', 'family_description', 'invite_code', 'members', 'posts', 'family_picture')  # Include the family picture field
    readonly_fields = ('invite_code',)  # Make invite_code read-only
    filter_horizontal = ('members', 'posts')

    def get_members_count(self, obj):
        return obj.members.count()
    get_members_count.short_description = 'Members Count'

class PostAdmin(admin.ModelAdmin):
    # Display fields in the admin list view
    list_display = ('id', 'title', 'user', 'family', 'datePosted', 'like_count')
    
    # Enable filtering
    list_filter = ('datePosted', 'family', 'user')
    
    # Add a search bar
    search_fields = ('title', 'message', 'user__email', 'family__family_name')
    
    # Read-only fields
    readonly_fields = ('datePosted',)
    
    # Custom method to display like count
    def like_count(self, obj):
        return obj.likes.count()
    like_count.short_description = 'Likes'

admin.site.register(UserProfile, CustomUserAdmin)
admin.site.register(Family,FamilyAdmin)
admin.site.register(Post,PostAdmin)