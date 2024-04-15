from rest_framework import serializers
from .models import Family,  UserProfile, Post

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'first_name', 'last_name','profile_picture']
        # You can include other fields as needed

class PostSerializer(serializers.ModelSerializer):
    datePosted = serializers.DateTimeField(format='%m-%d-%Y %H:%M:%S')
    class Meta:
        model = Post
        fields = ['id', 'user','family','title', 'message', 'datePosted']
        # Include other fields related to the Post model

    


class FamilySerializer(serializers.ModelSerializer):
    invite_code = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()
    posts = serializers.SerializerMethodField()
    class Meta:
        model = Family
        fields = ['id', 'family_name', 'family_description', 'invite_code', 'members','posts','family_picture']
        # Include other fields related to the Family model

    def get_members(self, obj):
        # Check if 'family_id' is present in the context
        request = self.context.get('request')
        user = request.user if request.user.is_authenticated else None

        if user and user in obj.members.all():
            # Exclude the current user from the members list
            members = obj.members.exclude(pk=user.pk)
            return UserProfileSerializer(members, many=True).data

        return None
    
    def get_invite_code(self, obj):
        # Check if the user making the request is a member of the family
        request = self.context.get('request')
        user = request.user if request.user.is_authenticated else None

        if user and user in obj.members.all():
            return obj.invite_code

        return None
    
    def get_posts(self, obj):
        # Check if the user making the request is a member of the family
        request = self.context.get('request')
        user = request.user if request.user.is_authenticated else None

        if user and user in obj.members.all():
            # Assuming you have a 'Post' model with a 'family' ForeignKey
            posts = obj.posts.all()
            return PostSerializer(posts, many=True).data

        return None
    
# class NotificationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Notification
#         fields = ['id','user_id','message','notification_type']