from chat.views import IndexView, MessagesListView
from django.urls.conf import path

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('<room_name>/', IndexView.as_view(), name='room'),
    path('api/messages/<room_name>/', MessagesListView.as_view()),
]