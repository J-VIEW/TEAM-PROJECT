from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import pymongo

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = pymongo.MongoClient("mongodb://localhost:27017/")  # Change as needed
db = client['mymental']  # Replace 'chatbot_database' with your database name
messages_collection = db['messages']  # Replace 'messages' with your collection name

def get_gpt_response(message):
    gpt_url = 'https://api.openai.com/v1/chat/completions'

    # Keep your API key here for now
    headers = {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
    }

    payload = {
        'messages': [{'role': 'user', 'content': message}],
        'max_tokens': 300,
        'model': 'gpt-3.5-turbo'
    }

    response = requests.post(gpt_url, headers=headers, json=payload)

    if response.status_code == 200:
        gpt_response = response.json()
        return gpt_response['choices'][0]['message']['content'].strip()
    else:
        raise Exception('Error from GPT model API:', response.text)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    message = data['message']
    session_id = data.get('session_id', '')  # Get session ID if provided, otherwise use empty string

    try:
        gpt_response = get_gpt_response(message)

        # Store the message and response in MongoDB
        messages_collection.insert_one({
            "session_id": session_id,
            "user_message": message,
            "gpt_response": gpt_response
        })

        return jsonify({'answer': gpt_response})
    except Exception as e:
        return jsonify({'answer': 'Error: ' + str(e)})

if __name__ == '__main__':
    app.run(debug=True)
