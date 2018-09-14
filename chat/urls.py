from chat.views import IndexView, RoomView, MessagesListView
from django.urls.conf import path

urlpatterns = [
    path('chat/', IndexView.as_view(), name='index'),
    path('chat/<room_name>/', RoomView.as_view(), name='room'),
    path('api/messages/<room_name>/', MessagesListView.as_view()),
]