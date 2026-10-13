import os
from dotenv import load_dotenv
load_dotenv()
from config import app, api, db, bcrypt, cache
import requests
from sqlalchemy.exc import IntegrityError
from flask import jsonify, request, make_response, session
from flask_restful import Resource
from models import User, UserSchema, Sound, SoundSchema

CURATED_SOUNDS = [
    {"id": 126152, "name": "Beach"},
    {"id": 467129, "name": "Fireplace"},
    {"id": 346562, "name": "Rain"},
    {"id": 265567, "name": "Crickets"},
    {"id": 410742, "name": "Birds"},
    {"id": 577846, "name": "Thunderstorm"},
    {"id": 733199, "name": "Stream"},
    {"id": 156414, "name": "Desert Wind"},
]

class Signup(Resource):
    def post(self):
        request_json = request.get_json()
        username = request_json.get('username')
        password = request_json.get('password')
        user = User(
            username=username
        )
        user.password_hash = password

        try:
            db.session.add(user)
            db.session.commit()
            return UserSchema().dump(user), 201
        except IntegrityError:
            return {'error': '422 Unprocessable Entity'}, 422
        
class CheckSession(Resource):
    def get(self):
        if session.get('user_id'):
            user = User.query.filter(User.id == session['user_id']).first()
            return UserSchema().dump(user), 200
        
        return {'error': '401 Unauthorized'}, 401
    
class Login(Resource):
    def post(self):
        username = request.get_json()['username']
        password = request.get_json()['password']

        user = User.query.filter(User.username == username).first()
        if user and user.authenticate(password):
            session['user_id'] = user.id
            return UserSchema().dump(user), 200
        
        return {'error': '401 Unauthorized'}, 401
    
class Logout(Resource):
    def delete(self):
        if session.get('user_id'):
            session['user_id'] = None
            return {}, 204
        return {'error': '401 Unauthorized'}, 401
    
class CuratedSounds(Resource):
    @cache.cached(timeout=3600, key_prefix='curated_sounds')
    def get(self):
        token = os.environ.get("FREESOUND_TOKEN")
        results = []

        for sound in CURATED_SOUNDS:
            response = requests.get(
                f"https://freesound.org/apiv2/sounds/{sound['id']}",
                params={
                    "fields": "id,name,duration,tags,username,previews,images,avg_rating",
                    "token": token
                }
            )
            if response.status_code == 200:
                data = response.json()
                data['custom_name'] = sound['name']
                results.append(data)

        return results, 200



class Sounds(Resource):
    def get(self):
        user_id = session.get('user_id')
        if user_id:
            sounds = Sound.query.filter_by(user_id=user_id).all()
            return SoundSchema(many=True).dump(sounds), 200
        return {'error': '401 Unauthorized'}, 401
  
    
    def post(self):
        user_id = session.get('user_id')
        if user_id:
            data = request.get_json()
            sound = Sound(
                freesound_id = data['freesound_id'],
                name = data['name'],
                user_id = user_id
            )
            try:
                db.session.add(sound)
                db.session.commit()
                return SoundSchema().dump(sound), 201
            except IntegrityError:
                return {'error': '422 Unprocessable Entity'}, 422
        else:
            return {'error': '401 Unauthorized'}, 401

    
class SoundById(Resource):
    def get(self, freesound_id):
        token = os.environ.get("FREESOUND_TOKEN")
        response = requests.get(
            f"https://freesound.org/apiv2/sounds/{freesound_id}",
            params={
                "fields": "id,name,duration,tags,username,previews,images,avg_rating",
                "token": token
            }
        )
        if response.status_code != 200:
            return {"error": "Freesound API error"}, response.status_code
        return response.json(), 200
    
class SoundSearch(Resource):
    def get(self):
        query = request.args.get("query", "").strip()
        page = request.args.get("page", 1)
        token = os.environ.get("FREESOUND_TOKEN")
        
        params = {
            "page": page,
            "page_size": 20,
            "fields": "id,name,duration,tags,username,previews,images,avg_rating",
            "token": token
        }

        if query:
            params["query"] = query 
        else:
            params["query"] = ""

        response = requests.get(
            "https://freesound.org/apiv2/search/text/",
            params=params
        )

        if response.status_code != 200:
            return {"error": "Freesound API error"}, response.status_code
        
        return response.json(), 200
    
class Ping(Resource):
    def get(self):
        return {"status": "ok"}, 200

api.add_resource(Signup, '/signup', endpoint='signup')
api.add_resource(CheckSession, '/check_session', endpoint='check_session')
api.add_resource(Login, '/login', endpoint='login')
api.add_resource(Logout, '/logout', endpoint='logout')
api.add_resource(CuratedSounds, '/curated-sounds')
api.add_resource(Sounds, '/sounds')
api.add_resource(SoundById, '/sounds/<int:freesound_id>')
api.add_resource(SoundSearch, '/sounds/search')
api.add_resource(Ping, '/ping')

if __name__ == '__main__':
    app.run(debug=True)