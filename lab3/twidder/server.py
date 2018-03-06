from flask import Flask, request, jsonify, g, render_template
from gevent.wsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
import uuid
import database_helper
import json
import sys
import websocket_handler

app = Flask(__name__, static_url_path="")

current_sockets = {}

@app.route('/', methods=['POST', 'GET'])
def startup():
    return app.send_static_file('client.html')


@app.teardown_appcontext
def teardown_db(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route('/signin', methods = ['POST'])
def signin():
    email = request.form['email']
    password = request.form['password']
    token = ''
    user_exist = database_helper.user_exists(email)
    if user_exist:
        result = database_helper.correct_password(email, password)
        if result:
            token = str(uuid.uuid4())
            if database_helper.add_loggedin_user(email,token):
                return jsonify({"success": True, "message": token})
            else:
                return jsonify({"success": False, "message": "not able to add user"})
        else:
            return jsonify({"success": False, "message": "wrong password"})
    else:
        return jsonify({"success": False, "message": "There is no such user"})



@app.route('/getuser/<email>', methods=['GET', 'POST'])
def getuserbyemail(email):
    result = database_helper.get_user(email)
    return json.dumps(result)

@app.route('/adduser', methods=['POST'])
def adduser():
    email = request.form['email']
    password = request.form['password']
    firstname = request.form['firstname']
    familyname = request.form['familyname']
    gender = request.form['gender']
    city = request.form['city']
    country = request.form['country']
    if not database_helper.user_exists(email):
        if len(password) > 2:
            if len(email) != 0 and len(firstname) != 0 and len(familyname) != 0 and len(gender) != 0 and len(city) != 0 and len(country) != 0:
                try:
                    database_helper.add_user(email, password, firstname, familyname, gender, city, country)
                    return jsonify({"success": True, "message": "User created successfully"})
                except:
                    return jsonify({"success": False, "message": "Could not add user"})
            else:
                return jsonify({"success": False, "message": "No empty spaces"})
        else:
            return jsonify({"success": False, "message": "Password is too short"})
    else:
        return jsonify({"success": False, "message": "User already exists"})


@app.route('/signout/<token>', methods=['POST'])
def signout(token):
    result = database_helper.loggedin_user(token)  # checks if there is an email logged in
    if result:
        email = database_helper.get_useremail(token)[0]
        websocket_handler.manual_logout(email, token)
        database_helper.logout_user(token)
        return jsonify({"success": True, "message": "Successfully signed out."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})




@app.route('/changepass/<token>', methods=['POST'])
def change_password(token):
    old_password = request.form['oldpass']
    new_password = request.form['newpass']

    logged_in = database_helper.loggedin_user(token)
    if logged_in:
        email = database_helper.get_useremail(token)[0]
        result = database_helper.correct_password(email, old_password)
        if len(new_password) > 2:
            if result:
                database_helper.change_password(email, new_password)
                return jsonify({"success": True, "message": "Password changed"})
            else:
                return jsonify({"success": False, "message": "Wrong password."})
        else:
            return jsonify({"success": False, "message": "Password is too short."})
    else:
        return jsonify({"success": False, "message": "You are not logged in."})


@app.route('/databytoken/<token>', methods=['GET'])
def get_user_data_by_token(token):
    logged_in = database_helper.loggedin_user(token)
    response = database_helper.get_userdata_by_token(token)
    if logged_in:
        return jsonify({"success": True, "message": response})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})


@app.route('/databyemail/<token>/<email>', methods=['GET'])
def get_user_data_by_email(token, email):
    logged_in = database_helper.loggedin_user(token)
    if logged_in:
        user_exists = database_helper.user_exists(email)
        if user_exists:
            response = database_helper.get_userdata_by_email(email)
            return jsonify({"success": False, "message": response})
        else:
            return jsonify({"success": False, "message": "No such user exists."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})

@app.route('/postmessage/<token>/<email>/<message>', methods=['GET'])
def post_message(token, email, message):
    #token = request.form['token']
    #message = request.form['message']
    #email = request.form['email']
    sender_email = database_helper.get_useremail(token)
    logged_in = database_helper.loggedin_user(token)
    if logged_in:
        user_exists = database_helper.user_exists(email)
        if user_exists:
            result= database_helper.post_message(token, message, email)
            if result:
                return jsonify({"success": True, "message": "Message posted"})
            else:
                return jsonify({"success": False, "message": "Not able to post."})
        else:
            return jsonify({"success": False, "message": "There is no such user."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})

@app.route('/messagebytoken/<token>', methods=['GET'])
def get_user_messages_by_token(token):
    logged_in = database_helper.loggedin_user(token)
    if logged_in:
        messages = database_helper.get_messages_by_token(token)

        return jsonify({"success": True, "message": "User messages retrieved", "data": messages})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})


@app.route('/messagebyemail/<token>/<email>', methods=['GET'])
def get_user_messages_by_email(token, email):
    logged_in = database_helper.loggedin_user(token)
    if logged_in:
        user_exists = database_helper.user_exists(email)
        if user_exists:
            messages = database_helper.get_messages_by_email(email) 
            return jsonify({"success": True, "message": "User messages retrieved", "data": messages})
        else:
            return jsonify({"success": False, "message": "There is no such user."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})


database_helper.init_db(app)

@app.route('/api')
def api():
    if request.environ.get('wsgi.websocket'):
        websocket_handler.handle_websocket(request.environ['wsgi.websocket'])


if __name__ == '__main__':	
    http_server = WSGIServer(("127.0.0.1", 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()


