from rest_framework import serializers
from .models import Family, Notification,  UserProfile, Post

class UserProfileSerializer(serializers.ModelSerializer):
    connectionStatus = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'first_name', 'last_name', 'profile_picture', 'connectionStatus']

    def to_representation(self, instance):
        # Get the default representation
        representation = super().to_representation(instance)
        
        # Check if the request user is the same as the user being viewed
        request = self.context.get('request')
        if request and request.user == instance:
            # Add families only if viewing own profile
            representation['families'] = FamilySerializer(instance.families, many=True, context=self.context).data
        
        return representation

    def get_connectionStatus(self, obj):
        """
        Retrieve the connection status between the current authenticated user
        and the user being serialized.
        """
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            current_user = request.user
            # Assuming current_user has a method get_connection_status that takes another user as argument.
            return current_user.get_connection_status(obj)
        return None

class PostSerializer(serializers.ModelSerializer):
    datePosted = serializers.DateTimeField(format='%m-%d-%Y %H:%M:%S')
    class Meta:
        model = Post
        fields = ['id', 'user','family','title', 'message', 'datePosted']
        # Include other fields related to the Post model

    


class FamilySerializer(serializers.ModelSerializer):
    invite_code = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()
    class Meta:
        model = Family
        fields = ['id', 'family_name', 'family_description', 'invite_code', 'members','family_picture']
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
    
class NotificationSerializer(serializers.ModelSerializer):
    sender_profile_picture = serializers.SerializerMethodField()
    recipient_profile_picture = serializers.SerializerMethodField()
    family_joined_name = serializers.SerializerMethodField()
    post_mentioned_title = serializers.SerializerMethodField()
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'timestamp', 'sender', 'recipient', 
                  'family_joined', 'post_mentioned', 
                  'sender_profile_picture', 'recipient_profile_picture', 
                  'family_joined_name', 'post_mentioned_title']
        
    def get_sender_profile_picture(self, obj):
        # Assuming 'sender' is a UserProfile instance and has a profile_picture field
        if obj.sender.profile_picture:
            return str(obj.sender.profile_picture)  # Convert to string for JSON serialization
        return None

    def get_recipient_profile_picture(self, obj):
        # Assuming 'recipient' is a UserProfile instance and has a profile_picture field
        if obj.recipient.profile_picture:
            return str(obj.recipient.profile_picture)  # Convert to string for JSON serialization
        return None

    def get_family_joined_name(self, obj):
        # Assuming 'family_joined' is a ForeignKey to a Family model
        if obj.family_joined:
            return obj.family_joined.family_name  # Return the name of the family
        return None

    def get_post_mentioned_title(self, obj):
        # Assuming 'post_mentioned' is a ForeignKey to a Post model
        if obj.post_mentioned:
            return obj.post_mentioned.title  # Return the title of the post
        return None