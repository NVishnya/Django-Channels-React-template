# Virtual environment
The main purpose of Python virtual environments is to create an isolated environment for Python projects. This means that each project can have its own dependencies, regardless of what dependencies every other project has.
So before installing Django we should create a virtual environment. I suggest using [virtualenvwrapper](http://virtualenvwrapper.readthedocs.io/en/latest/) for that purpose.
# Django instalation
To install the latest Django version just run the following command in your command line:
```console
$ pip3 install Django
```
To check that Django is installed run the following:
```console
$ python3 -m django --version
```
# Start a project and create an app
The next thing to do is to create a project. From the command line, go into a directory where you’d like to store your code, then run the following command:
```console
$ django-admin startproject djtemplate
```
(djtemplate is the name of the project. You can use the name you like, but you’ll need to avoid naming projects after built-in Python or Django components)

Next we will create an app. The app is a Web application that does something – e.g., a Weblog system, a database of public records or a simple poll app. A project is a collection of configuration and apps for a particular website. A project can contain multiple apps. An app can be in multiple projects. To create your app, **make sure you’re in the same directory as `manage.py`** and type this command:
```console
$  python manage.py startapp chat
```
To include the app in our project, we need to add a reference to its configuration class in the INSTALLED_APPS setting. 
In `settings.py` in `INSTALLED_APPS` at `chat` at the top :
```python
INSTALLED_APPS = [
    'chat',
    ...
]
```

# Models
A [model](https://docs.djangoproject.com/en/2.1/topics/db/models/) is the single, definitive source of information about your data. It contains the essential fields and behaviors of the data you’re storing.

For our chat app we will create a model Message. A model is the single, definitive source of information about your data. It contains the essential fields and behaviors of the data you’re storing. In `chat/models.py`:
```python
from django.db import models

class Message(models.Model):
    room_name = models.TextField(max_length=50)
    text = models.TextField(max_length=300)
```
Now run the following command:
```console
$ python manage.py makemigrations chat
```
By running makemigrations, you’re telling Django that you’ve made some changes to your models (in this case, you’ve made new ones) and that you’d like the changes to be stored as a migration.

Now, run migrate again to create the model tables in your database:
```console
$ python manage.py migrate
```
The migrate command takes all the migrations that haven’t been applied (Django tracks which ones are applied using a special table in your database called django_migrations) and runs them against your database - essentially, synchronizing the changes you made to your models with the schema in the database.
# Django Rest Framework instalation
To install [DRF](http://www.django-rest-framework.org/) type the following in console:
```console
$ pip3 install djangorestframework
```
Next include DRF in `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    'chat',
    ...
    'rest_framework’,
]
```
# Serializers
[Serializers](http://www.django-rest-framework.org/api-guide/serializers/) allow complex data such as querysets and model instances to be converted to native Python datatypes that can then be easily rendered into JSON, XML or other content types. Serializers also provide deserialization, allowing parsed data to be converted back into complex types, after first validating the incoming data.

In `chat/serializers.py`:
```python
from rest_framework import serializers
from chat.models import Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
```
The [ModelSerializer](http://www.django-rest-framework.org/api-guide/serializers/#modelserializer) class provides a shortcut that lets you automatically create a Serializer class with fields that correspond to the Model fields.
# Views
A [view](https://docs.djangoproject.com/en/2.1/topics/class-based-views/) is a callable which takes a request and returns a response. This can be more than just a function, and Django provides an example of some classes which can be used as views.

Now we will create some class-based views. In `views.py`:
```python
from django.views.generic.base import TemplateView
from chat.serializers import MessageSerializer
from django.utils.safestring import mark_safe
from rest_framework import generics
from chat.models import Message
import json


class IndexView(TemplateView):
    template_name = "room_input.html"


class RoomView(TemplateView):
    template_name = "chat_room.html"

    def get_context_data(self, **kwargs):
        context = super(RoomView, self).get_context_data()
        context['room_name_json'] = mark_safe(json.dumps(self.kwargs['room_name']))
        return context


class MessagesListView(generics.ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        return Message.objects.filter(room_name=self.kwargs['room_name'])
```
(`room_input.html` and `chat_room.html` templates we will create later.)

**IndexView** and **RoomView** subclass [TemplateView](https://docs.djangoproject.com/en/2.1/ref/class-based-views/base/#templateview), which renders a given template, with the context containing parameters captured in the URL. (We will create chat_room.html and room_input.html a bit later.)

**MessagesListView** subclasses **ModelSerializer** which is provided by DRF. It is used for read-only endpoints to represent a collection of model instances.
# URLs
To call the view, we need to map it to a URL - and for this we need a URLconf.

In chat/urls.py:
```python
from chat.views import IndexView, RoomView, MessagesListView
from django.urls.conf import path

urlpatterns = [
    path('chat/', IndexView.as_view(), name='index'),
    path('chat/<room_name>/', RoomView.as_view(), name='room'),
    path('api/messages/<room_name>/', MessagesListView.as_view()),
]
```
The next step is to point the root URLconf at the chat.urls module.

In djtemplate/urls.py, add an import for django.urls.include and insert an include() in the urlpatterns list, so you have:
```python
from django.contrib import admin
from django.urls import path
from django.urls.conf import include

urlpatterns = [
    path('', include('chat.urls')),
    path('admin/', admin.site.urls),
]
```
# Channels installation
[Channels]() is a project that takes Django and extends its abilities beyond HTTP - to handle WebSockets, chat protocols, IoT protocols, and more. 

To install Channels:
```console
$ pip3 install -U channels
```
`-U, --upgrade Upgrade all packages to the newest available version`

Once that’s done, add channels to your INSTALLED_APPS setting:
```python
INSTALLED_APPS = [
    'chat',
    ...
    'rest_framework', 
    'channels',
]
```
# Consumers
[Consumers](https://channels.readthedocs.io/en/latest/topics/consumers.html) do a couple of things in particular:

+ Structures your code as a series of functions to be called whenever an event happens, rather than making you write an event loop.
+ Allow you to write synchronous or async code and deals with handoffs and threading for you.

In `chat/consumers.py`:
```python
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from chat.models import Message
from chat.serializers import MessageSerializer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_{}'.format(self.room_name)
        # Join room group
        await self.channel_layer.group_add(self.room_group_name,
                                           self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name,
                                               self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        text = text_data_json['message']
        message = Message(text=text, room_name=self.scope['url_route']['kwargs']['room_name'])
        message.save()

        await self.channel_layer.group_send(self.room_group_name,
                                            {'type': 'chat_message',
                                             'message': MessageSerializer(message).data})

    # Recieve messege from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({'message': message}))

```
`await` is used to call asynchronous functions that perform I/O.

# Routing
We need to create a routing configuration for the chat app that has a route to the consumer. Create a new file `chat/routing.py`. In `chat/routing.py`:
```python
from django.urls.conf import path
from chat import consumers

websocket_urlpatterns = [
    path('ws/chat/<room_name>/', consumers.ChatConsumer),
]

```
The next step is to point the root routing configuration at the chat.routing module. In `djtemplate/routing.py`:
```python
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': AuthMiddlewareStack(
        URLRouter(
           chat.routing.websocket_urlpatterns
        )
    )
})

```
Now in `settings.py` add the line:
```python
ASGI_APPLICATION = 'djtemplate.routing.application'
```
Also add:
```python
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    },
}
```
A [channel layer](https://channels.readthedocs.io/en/latest/topics/channel_layers.html) is a kind of communication system. It allows multiple consumer instances to talk with each other and with other parts of Django.

# NPM
Now we need to install node.js and npm.
Instructions can be found [here](https://www.npmjs.com/get-npm).

# React, Babel, Webpack installation
Once you’ve had npm installed in terminal, at the root of the project, type:
```console
$ npm init
```
Just accept the defaults for now and then you should have a new package.json file.
Now install react and react-dom:
```console
$ npm install --save react react-dom
```
Also install react-websocket. We will need it to use websockets within react.
```console
$ npm install --save react-websocket
```
We also need to install [Babel](https://babeljs.io/), which is a JavaScript compiler.
```console
$ npm install --save-dev babel-loader @babel/core @babel/preset-env @babel/preset-react 
```
`--save-dev` is used to save the package for development purpose (in “devDependencies” in package.json).

We need to install webpack, webpack-cli and webpack-bundle-tracker:
```console
$ npm install --save-dev webpack webpack-cli webpack-bundle-tracker
```
[Webpack](https://webpack.js.org/) is a module bundler. Its main purpose is to bundle JavaScript files for usage in a browser, yet it is also capable of transforming, bundling or packaging just about any resource or asset.

**`webpack-bundle-tracker`** spits out some stats about webpack compilation process to a file.

Out of the box, webpack only understands JavaScript files. Loaders allow webpack to process other types of files and convert them into valid modules that can be consumed by your application and added to the dependency graph.

We need to install css-loader, style-loader, node-sass, sass-loader:
```console
$ npm install --save-dev css-loader style-loader
```
**`style-loader`** adds CSS to the DOM by injecting a `<style>` tag.

**`css-loader`** interprets `@import` and `url()` like `import/require()` and will resolve them.

To extract CSS into separate files we need `mini-css-extract-plugin`:
```console
$ npm install --save-dev mini-css-extract-plugin
```
We need to install bootstrap in order to use botstraps’s css:
```console
$ npm install --save-dev bootstrap@4.0.0-alpha.6
```
We will also need jquery, so run the command:
```console
$ npm install --save jquery
```
# Babel configuration
At the root of the project create the file `.babelrc`. In this file:
```javascript
{
    "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```
# Webpack configuration
With webpack installed now, we need to create config file. Create a `webpack.config.js` file in the root of your project (same directory as `manage.py`). Add the following to that file:
```javascript
const path = require("path");
const BundleTracker = require("webpack-bundle-tracker");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
    context: __dirname,
    entry: {
        room_input: './templates/components/room_input_component/index.jsx',
        chat_room: './templates/components/chat_room_component/index.jsx',
    },
    output: {
        path: path.resolve('./static/bundles/'),
        filename: "[name]-[hash].js"
    },
    plugins: [
        new BundleTracker({path: __dirname, filename: './webpack-stats.json'}),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        })
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\s?[ac]ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader', options: { sourceMap: true } }
                ]
            }
        ]    
    }
}

```
The **entry** object is where webpack looks to start building the bundle.

The **output** property tells webpack where to emit the bundles it creates and how to name these files.
We will have two entry points: `room_input` and `chat_room`.

In `package.json` add scripts to run webpack:
```json
{
  "name": "djtemplate",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    ...
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production"
  },
  ...
}
```
Webpack can watch files and recompile whenever they change. In order to make it do so we use `--watch` option.
# React Components
At the root of the project create forled called `templates`. In this folder create a folder called `components`. In it create folders `chat_room_component` and `room_input_component`.

In `templates/components/room_input_component` create `RoomInput.jsx` file. In the file:
```javascript
import React from 'react'

class RoomInput extends React.Component{
    constructor(props){
        super(props);
        this.state = {room_name: ''}
        this.roomNameInputRef = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmin = this.handleSubmin.bind(this);
    }
    componentDidMount(){
        this.roomNameInputRef.current.focus();
    }
    handleChange(event){
        this.setState({room_name: event.target.value});
    }
    handleSubmin(event){
        event.preventDefault();
        window.location.pathname = window.location.pathname + this.state.room_name
    }
    render(){
        return (
            <form onSubmit={this.handleSubmin} className="form-inline col-12">
                <div className="form-group">
                    <input type="text" placeholder="ROOM NAME"
                        ref={this.roomNameInputRef} value={this.state.room_name} onChange={this.handleChange}
                        className="form-control mr-2" />   
                </div>
                <input type="submit" value="Go!" className='btn btn-primary'/>
            </form>
        )
    }
}
export default RoomInput;
```
In `templates/components/room_input_component/index.jsx` put this:
```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import RoomInput from './RoomInput.jsx'


ReactDOM.render(
  <RoomInput />,
  document.getElementById('room_input')
);
```
Now in `templates/components/chat_room_component/ChatRoom.jsx`:
```javascript
import React from 'react'
import Websocket from 'react-websocket'

class MessagesList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            content: this.props.content
        }
    }
    componentWillReceiveProps(nextProps){
        this.setState({content: nextProps.content});
    }
    render(){
        return(
            <div className="col-12">
                {this.state.content.map(item => <p key={item.id}>{item.text}</p>)}
            </div>
        )
    }
}
class ChatRoom extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            messages: props.messages,
            current_message: '',
        }
        this.socketRef = React.createRef();
        this.messageInputRef = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmin = this.handleSubmin.bind(this);
        this.sendSocketMessage = this.sendSocketMessage.bind(this);

    }
    componentWillUnmount(){
        this.serverRequest.abort();
    }
    handleData(data){
        let result  = JSON.parse(data);
        this.setState({ messages: [ ...this.state.messages, result['message']]});
    }
    sendSocketMessage(message){
        const socket = this.socketRef.current;
        socket.state.ws.send(JSON.stringify({'message': message}));
    }
    handleChange(event){
        this.setState({current_message: event.target.value});
    }
    handleSubmin(event){
        event.preventDefault();
        if(this.state.current_message != ""){
            this.sendSocketMessage(this.state.current_message);
        }
        this.setState({current_message: ''});
    }
    render(){
        return(
            <div>
                <form onSubmit={this.handleSubmin} className="form-inline col-12">
                    <div className="form-group">
                    <input type="text" placeholder="Type your message here" 
                        ref={this.messageInputRef} value={this.state.current_message} onChange={this.handleChange} 
                        className="form-control mr-2"/>
                    </div>
                    <input type="submit" value="Send" className='btn btn-primary'/>
                </form>
                <MessagesList content={this.state.messages}/>
                <Websocket ref={this.socketRef} url={this.props.socket} 
                    onMessage={this.handleData.bind(this)} reconnect={true} />
            </div>
        )
    }
}

export default ChatRoom;
export {MessagesList};
```
In `templates/components/chat_room_component/index.jsx`:
```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import ChatRoom from './ChatRoom.jsx'
import $ from 'jquery'

var chat_socket = 'ws://' + window.location.host + '/ws' + window.location.pathname;
var messages_in_room = null;

var room = window.location.pathname.split('/').reverse().filter(x => x)[0];
$.get('/api/messages/' + room + '/?format=json', function(result){
  messages_in_room = result;
  render_component();
})
function render_component(){
  ReactDOM.render(
    <ChatRoom socket={chat_socket} messages={messages_in_room}/>,
    document.getElementById('chat_room')
  );
}
```
# Django Webpack Loader
To use our components in Django templates we first need to install `django-webpack-loader`:
```console
$ pip3 install django-webpack-loader
```
Add it to `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    'chat',
    ...
    'rest_framework', 
    'channels',
    'webpack_loader',
]
```
In `settings.py` add:
```python
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
] # We do this so that django's collectstatic copies or our bundles to the STATIC_ROOT or syncs them to whatever storage we use.

WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': '/bundles/',
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats.json')
    }
}
```
Now in `templates/base.html`:
```html
<html>
<head>
    <meta charset="utf-8"/>
    <title>Chat</title>
</head>
<body>
    <div class="container">
        <div class="row mt-5">
            <div class="offset-4">
            {% block content %}
            {% endblock %}
            </div>
        </div>
    </div>
</body>
</html>
```
This is our base template. Think of the base template as the frame for all pages in the application. It sets the top navigation bar, the site footer, and provides a body canvas for any page to customize. By using the base template we can ensure a standard look and feel without having to duplicate HTML code.

In `templates/room_input.html` add:
```html
{% extends 'base.html' %}
{% load render_bundle from webpack_loader %}

{% block content %}
    <div id="room_input" class=""></div>
    {% render_bundle 'room_input' %}
{% endblock %}
```
render_bundle will render the required `<script>` and `<link>` tags in the template.

Now in `templates/chat_room.html`:
```html
{% extends 'base.html' %}
{% load render_bundle from webpack_loader %}

{% block content %}
    <div id="chat_room"></div>
    {% render_bundle 'chat_room' %}
{% endblock %}
```
In `setting.py` find `TEMPLATES` and modify `DIRS`:
```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        ...
    },
]
```
# Run the app
Now run:
```console
$ npm run build
```
```console
$ python manage.py runserver
```
Now you can visit [http://127.0.0.1:8000/chat/](http://127.0.0.1:8000/chat/) and try out the template!
# Tests
Now we will run some tests. We will use [Mocha framework](https://mochajs.org/).

To install mocha:
```console
$ npm install --save-dev mocha
```
We will also need [chai](http://www.chaijs.com/) which is a BDD / TDD assertion library for node.
```console
$ npm install --save-dev chai
```
We will need [enzyme](https://www.npmjs.com/package/enzyme) which is a JavaScript Testing utility for React that makes it easier to assert, manipulate, and traverse your React Components' output.
```console
$ npm i --save-dev enzyme enzyme-adapter-react-16
```
One last thing is [jsdom](https://www.npmjs.com/package/jsdom).
```console
$ npm install --save-dev jsdom
```
Now create the folder `test`.


In `test/dom.js` we will setup the pseudo browser environment for our React components which render HTML eventually. Open the `test/dom.js` file and add the following lines to it:
```javascript
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');

global.window = dom.window;
global.document = dom.window.document;
```
In `test/helpers.js`:
```javascript
import { expect } from 'chai';
import { mount, render, shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

global.expect = expect;

global.mount = mount;
global.render = render;
global.shallow = shallow;
```
We import **expect** function from chai, **shallow**, **render** and **mount** from Enzyme to make them globally accessible. That way, we don’t need to import it explicitly in your test files anymore.

And finally in `test/test.js`:
```javascript
import React from 'react';
import  ChatRoom, { MessagesList } from '../templates/components/chat_room_component/ChatRoom.jsx';
describe('ChatRoom cpmponent', () => {
    it('renders the MessagesList component', () =>{
        const wrapper = shallow(<ChatRoom messages={[]}/>);
        expect(wrapper.find(MessagesList)).to.have.length(1);
    });
    it('passes messages to MessagesList component', () =>{
        const wrapper = shallow(<ChatRoom messages={[]}/>);
        let messageslistWrapper = wrapper.find(MessagesList);
        
        wrapper.setState({ messages: ["1"] });

        messageslistWrapper = wrapper.find(MessagesList);
        expect(messageslistWrapper.props().content).to.eql(["1"]);
    });

});
```
We need to instal `@babel/register`:
```console
$ npm install --save-dev @babel/register
```
To run the tests in `package.json` add the script:
```json
{
  "name": "djtemplate",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "mocha --require babel-core/register --require ./test/helpers.js --require ./test/dom.js",
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production"
  },
  ...
}
```
Now we can run the tests with the following command:
```console
$ npm run test
```
