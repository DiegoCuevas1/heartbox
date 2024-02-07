from rest_framework import serializers
from .models import Family, Notification, UserProfile, Post

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'first_name', 'last_name', 'birthdate']
        # You can include other fields as needed

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'user_id', 'title', 'description', 'datePosted', 'image']
        # Include other fields related to the Relic model


class FamilySerializer(serializers.ModelSerializer):
    invite_code = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()

    class Meta:
        model = Family
        fields = ['id', 'family_name', 'family_description', 'invite_code', 'members']
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
    
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id','user_id','message','notification_type']