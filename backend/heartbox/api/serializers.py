from django.db.models import Q
from rest_framework import serializers

from .models import Comment, Connection, Family, UserProfile


def user_summary(user):
    return {
        'id': user.id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'profile_picture': user.profile_picture,
    }


class UserProfileSerializer(serializers.ModelSerializer):
    connectionStatus = serializers.SerializerMethodField()
    isIncomingRequest = serializers.SerializerMethodField()
    connectionId = serializers.SerializerMethodField()
    connection_count = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'first_name', 'last_name', 'profile_picture', 'connectionStatus', 'isIncomingRequest',
                  'connectionId', 'connection_count']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user == instance:
            # Families are only listed on your own profile.
            representation['families'] = FamilySerializer(
                instance.families.all(), many=True, context=self.context
            ).data
        return representation

    def _viewer(self):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user
        return None

    def _connection_with(self, obj):
        """The viewer's connection with obj. All of the viewer's connections are loaded once per serializer."""
        viewer = self._viewer()
        if viewer is None:
            return None
        cache = self.context.get('_connections_by_user')
        if cache is None:
            cache = {}
            for connection in Connection.objects.filter(Q(from_user=viewer) | Q(to_user=viewer)):
                other = connection.to_user_id if connection.from_user_id == viewer.pk else connection.from_user_id
                cache[other] = connection
            self.context['_connections_by_user'] = cache
        return cache.get(obj.pk)

    def get_connectionStatus(self, obj):
        if self._viewer() is None:
            return None
        connection = self._connection_with(obj)
        return connection.status if connection else 'none'

    def get_isIncomingRequest(self, obj):
        connection = self._connection_with(obj)
        return bool(connection and connection.status == 'PENDING' and connection.from_user_id == obj.pk)

    def get_connectionId(self, obj):
        connection = self._connection_with(obj)
        return str(connection.id) if connection else None

    def get_connection_count(self, obj):
        return Connection.objects.filter(Q(from_user=obj) | Q(to_user=obj), status='ACCEPTED').count()


class CommentSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    parent_user = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'message', 'datePosted', 'user_details', 'parent', 'parent_user', 'replies']

    def get_user_details(self, obj):
        return user_summary(obj.user)

    def get_parent_user(self, obj):
        return user_summary(obj.parent.user) if obj.parent_id else None

    def get_replies(self, obj):
        replies = sorted(obj.replies.all(), key=lambda r: r.datePosted)
        return CommentSerializer(replies, many=True).data


class FamilySerializer(serializers.ModelSerializer):
    invite_code = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()
    is_creator = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Family
        fields = ['id', 'family_name', 'family_description', 'invite_code', 'members', 'family_picture',
                  'is_creator', 'member_count']

    def _viewer_is_member(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.members.filter(pk=request.user.pk).exists()

    def get_members(self, obj):
        if not self._viewer_is_member(obj):
            return None
        members = obj.members.exclude(pk=self.context['request'].user.pk)
        return UserProfileSerializer(members, many=True, context={'request': self.context['request']}).data

    def get_invite_code(self, obj):
        return obj.invite_code if self._viewer_is_member(obj) else None

    def get_is_creator(self, obj):
        request = self.context.get('request')
        return bool(request and obj.creator_id == request.user.pk)

    def get_member_count(self, obj):
        return obj.members.count()
