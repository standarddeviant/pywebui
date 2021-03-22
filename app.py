# built-in imports
import time
import random
import queue
import threading
import webbrowser

# pip-installed imports
import socketio
import eventlet
eventlet.monkey_patch()

# create SocketIO Server and WSGI App
sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
    '/': './public/'
})

def task(sid):
    sio.sleep(5)
    result = sio.call('mult', {'numbers': [3, 4]}, to=sid)
    print(result)


@sio.event
def connect(sid, environ):
    print(sid, 'connected')
    sio.start_background_task(task, sid)


@sio.event
def disconnect(sid):
    print(sid, 'disconnected')


@sio.event
def sum(sid, data):
    result = data['numbers'][0] + data['numbers'][1]
    return {'result': result}


@sio.event
def btn1_click(sid, data):
    print(f"btn1_click : sid = {sid}, data = {data}")
    return {'result': 'success'}


@sio.event
def btn2_click(sid, data):
    print(f"btn2_click : sid = {sid}, data = {data}")
    return {'result': 'super-good'}


def open_url(url=None, delay=None):
    try:
        time.sleep(delay)
    except TypeError:
        print("unable to delay in open_url")
        pass

    try:
        webbrowser.open_new(url)
    except Exception:
        print("unable to open_new in open_url")
# end open_url


def should_stop(stopQ):
    try:
        stopQ.get_nowait()
        return True
    except queue.Empty:
        return False


def sensor_read_func(**kwargs):
    sensorQ = kwargs['sensorQ']
    stopQ = kwargs['stopQ']
    while True:
        sensorQ.put(random.random())
        time.sleep(0.5)
        if(should_stop(stopQ)):
            break


def sensor_relay_func(**kwargs):
    print(kwargs)
    sensorQ = kwargs['sensorQ']
    while True:
        try:
            itm = sensorQ.get_nowait()
            print(itm)
            sio.emit('rawdata', {'value': itm})
        except queue.Empty:
            pass
            time.sleep(0.050)


if __name__ == '__main__':
    # make dict of common queues to pass to normal-thread and green-threads
    sensorQ = queue.Queue()
    stopQ = queue.Queue()
    thread_kwargs = dict(sensorQ=sensorQ, stopQ=stopQ)

    # spawn fake sensor read as a normal thread
    # this could also be another process if needed - but...
    # the sensorQ above would need to be a process-safe queue
    threading.Thread(target=sensor_read_func, kwargs=thread_kwargs).start()

    # spawn a green thread to receive sensor data
    # this is a green thread in order to safely emit (broadcast)
    # to sensor data to all connected clients
    eventlet.spawn(sensor_relay_func, **thread_kwargs)

    # open a web-link in two seconds
    url_kwargs = dict(url="http://127.0.0.1:8000", delay=2.0)
    threading.Thread(target=open_url, kwargs=url_kwargs).start()

    # start server
    eventlet.wsgi.server(eventlet.listen(('', 8000)), app)

    # except KeyboardInterrupt:
    #     for ix in range(2):
    #         stopQ.put(None)
