from gevent.wsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
import server


@app.route('/api')
def api():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        while True:
            message = ws.recieve()
            ws.send(message)
    return

if __name__ == '__main__':
    http_server = WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
