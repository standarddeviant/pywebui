# `pywebui`

This repo is a simple example of using `python-socketio` to create a very simple webui with a couple buttons and plotting one stream of data.

This repo is heavily adapted from Miguel Grinberg's tutorial code. To learn more about `python-socketio` I highly encourage people to view Miguel's excellent series of tutorial videos here:
[![Quick Socket.IO Tutorial](https://img.youtube.com/vi/H1eLJMC5oTg/0.jpg)](https://www.youtube.com/watch?v=H1eLJMC5oTg&list=PLCuWRxjbgFnPZTBMYbz9UNGvTLNggRMjb "Quick Socket.IO Tutorial")

The script `app.py` has three parts:
### 1. a "normal-thread" (`threading.Thread`)
This thread generates (random) data and puts that data to a thread-safe queue.

### 2. a "green-thread" (`eventlet.greenthread`)
This thread reads data from a thread-safe queue and emits (broadcasts) to all connected socketio clients - i.e. i.e. active web pages

### 3. a WSGI server (`eventlet.wsgi.server`)
This server listens for incoming requests on `127.0.0.1:8000` and manages all socketio sockets.


# Running the demo
1. Install pre-requisites with `pip3 install -r requirements.txt`
2. Run the main script with `python3 app.py`

 
