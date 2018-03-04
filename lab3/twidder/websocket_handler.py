import json
import string
from geventwebsocket import WebSocketError
loggedin_users = {}
current_websockets = {}


def handle_websocket(ws):
    try:
        while True:
            message = ws.receive()
            if message is None:
                break
            else:
                message = json.loads(message)
                if message["login"]:
                    handle_login(message['token'], message['user'], ws)
                else:
                    resp = json.dumps({"logout": False, "message": "Echo: " + message["message"]})
                    ws.send(resp)
    except WebSocketError as e:
        print e
        return


def handle_login(token, user, ws):
    if user in loggedin_users.values():
        other_token = loggedin_users.keys()[loggedin_users.values().index(user)]
        try:
            current_websockets[other_token]
            old_ws = current_websockets[other_token]
            del loggedin_users[other_token]
            resp = json.dumps({"logout": True, "message": "signout"})
            old_ws.send(resp)
            #del current_websockets[other_token]
        except: 
            #del current_websockets[other_token]
            print "error"
        del current_websockets[other_token]
        loggedin_users[token] = user
        current_websockets[token] = ws
    else:
        current_websockets[token] = ws
        loggedin_users[token] = user
    return


def manual_logout(user, token):
    if token in loggedin_users:
        del current_websockets[token]
        del loggedin_users[token]

