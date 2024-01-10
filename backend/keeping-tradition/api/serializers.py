from rest_framework import serializers
from .models import UserProfile, Relic

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'first_name', 'last_name', 'birthdate']
        # You can include other fields as needed

class RelicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relic
        fields = ['id', 'user_id', 'title', 'description', 'datePosted', 'image']
        # Include other fields related to the Relic model
