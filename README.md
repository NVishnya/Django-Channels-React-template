# Quickstart
```consile
$ npm install
$ npm run build

$ pip3 install -r requirements.txt
$ python3 manage.py migrate
$ python3 manage.py runserver
```


Available scripts
---
The script to run the tests:
```console
npm test
```
The script to run webpack in the development mode:
```console
npm run dev
```
The script to run webpack in the production mode:
```console
npm run build
```
Debugging
---
To enable source maps in `webpack.config.js` uncomment the line:
```javascript
...
    // devtool: 'source-map',
...
``` 
# Project structure
App modules
---
**chat/** is an app folder. In it you can find such modules:
* **`models.py`** In this module there is a simple **`MessageModel`** with two `TextField`s: `room_name`(the room where the message was sent) and `text` (massege itself).
* **`serializers.py`** It this module we have a **`MessageSerializer`**, which provides a way of serializing and deserializing the Message instances into representations such as json. 
* **`views.py`** Here we have these views:
  * `IndexView`- the view that just displays one template, `room_input.html`
  * `RoomView` just like the previos one displays one template `chat_room.html` but here we also ovveride `def get_context_data(self, **kwargs):` method in oreder to put extra information into the template’s context.
  * `MessagesListView` is used for read-only endpoints to represent a collection of model instances.
* **`urls.py`** Here we map URL path expressions to our views.
* **`consumers.py`** In this module we define the `ChatConsumer` which tells what should be done when an event happens.
* **`routing.py`** Here we have a routing configuration for the chat app that has a route to the `ChatConsumer`. 

Project configuration
---
**djtemplate/** is Django root directory. Here you can find:
* `settings.py` Django confuguration file.
* `routing.py` Channels routing configuration file.
* `urls.py` The URL declarations for this Django project.




Templates and React Components
---
In **templates/** folder we have:
* `base.html` This is the most basic template that you extend on every page of your website.
* `room_input.html` This is the template whish is used for page, where we choose the chat room.
* `chat_room.html` This is the template which is used for the chat representation.
* **components/**
  * chat_room_component/:
    * `ChatRoom.jsx` In this file we define `MessageList` and `ChatRoom` components. The first one is used to represent the message history. 
    * `index.jsx` Import all we need from `ChatRoom.jsx` and define a websocket.
  * room_input_component/
    * `RoomInput.jsx` Here we have `RoomInput` component, which is used to enter some room. 
    * `index.jsx` Import all we need from `RoomInput.jsx`.
  
  


Tests
---


* `helper.js` We import some functions here in order to make them globally accessible. That way, you don’t need to import them explicitly in your test files anymore.

* `dom.js`  In this file we setup pseudo browser environment for React components which render HTML eventually. 

* `test.js` Here we write our tests.
