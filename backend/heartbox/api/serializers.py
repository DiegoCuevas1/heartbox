from rest_framework import serializers
from .models import Family, Notification, UserProfile, Post

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'first_name', 'last_name']
        # You can include other fields as needed

class PostSerializer(serializers.ModelSerializer):
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
        fields = ['id', 'family_name', 'family_description', 'invite_code', 'members','posts']
        # Include other fields related to the Family model

    def get_members(self, obj):
        # Check if 'family_id' is present in the context
        request = self.context.get('request')
        family_id = request.query_params.get('familyId')
        
        if family_id and obj.id == int(family_id):
            # If 'family_id' is present and matches the current family, include the members
            return UserProfileSerializer(obj.members.all(), many=True).data

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
    
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id','user_id','message','notification_type']