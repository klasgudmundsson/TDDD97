import sqlite3
from flask import g
DATABASE = 'database.db'


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


'''
@app.teardown_appcontext
def teardown_db(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
'''


def init_db(app):
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()


# def init_db():
#     with app.app_context():
#         db = get_db()
#         with open('schema.sql', 'r') as f:
#             db.cursor().executescript(f.read())
#         db.commit()


def query_db(query, args=(), one=False):
    db = get_db()
    cur = db.execute(query, args)
    rv = cur.fetchall()
    cur.close()
    db.commit()
    return (rv[0] if rv else None) if one else rv


def add_user(email, password, firstname, familyname, gender, city, country):
    try:
        query_db('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)',
                 [email, password, firstname, familyname, gender, city, country])
        return True
    except:
        return False


def user_exists(email):
    user = query_db('SELECT * FROM users WHERE email=?', [email])
    if len(user) == 0:
        return False
    else:
        return True


def get_user(email):
    user_data = query_db('SELECT email,firstname,familyname,gender,city FROM users WHERE email=?', [email], one=True)
    return user_data


def get_useremail(token):
    user_data = query_db('SELECT email FROM users WHERE email IN (SELECT email FROM logged_in WHERE token=?)', [token], one=True)
    return user_data


def correct_password(email, password):
    correct_password = query_db('SELECT password FROM users WHERE email=?', [email])
    pas = correct_password[0][0]
    if password == pas:
        return True
    else:
        return False


def add_loggedin_user(email, token):
    try:
        query_db('INSERT INTO logged_in VALUES (?,?)', [token, email])
        return True
    except:
        return False


def loggedin_user(token):
     email = query_db('SELECT email FROM logged_in WHERE token=?', [token])
     if len(email) != 0:
         return True
     else:
        return False


def logout_user(token):
    try:
        query_db('DELETE FROM logged_in WHERE token=?', [token])
        return True
    except:
        return False


def change_password(email, newpass):
    try:
        query_db('UPDATE users SET password =? WHERE email=?', [newpass, email])
        return True
    except:
        return False


def get_userdata_by_token(token):
    user_data = query_db('SELECT email,firstname,familyname,gender,city,country FROM users WHERE email IN (SELECT email FROM logged_in WHERE token=?)', [token], one=True)
    return user_data


def get_userdata_by_email(email):
    user_data = query_db('SELECT email,firstname,familyname,gender,city,country FROM users WHERE email=?', [email], one=True)
    return user_data


def post_message(token, message,reciever):
    try:
        sender = get_useremail(token)[0]
        query_db('INSERT INTO messages VALUES (?,?,?)', [sender, str(reciever),str(message)])
        return True
    except:
        return False


def get_messages_by_token(token):
    email = get_useremail(token)[0]
    messages = query_db('SELECT message,from_email FROM messages WHERE to_email=?', [email])
    tempobj = {}
    data = []
    for i in range(0, len(messages)):
        tempobj = {"message": messages[i][0], "from_user": messages[i][1]}
        data.append(tempobj)
    return data

def get_messages_by_email(email):
    messages = query_db('SELECT message,from_email FROM messages WHERE to_email=?', [email])
    tempobj = {}
    data = []
    for i in range(0, len(messages)):
        tempobj = {"message": messages[i][0], "from_user": messages[i][1]}
        data.append(tempobj)
    return data
