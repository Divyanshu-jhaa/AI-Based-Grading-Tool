from flask import Flask
from flask import request
import json
import pickle
from openai import OpenAI
from dotenv import load_dotenv,dotenv_values
from flask_cors import CORS
from ocr import analyze_read
from utils import extract_features
import spacy
app=Flask(__name__)
CORS(app)
nlp = spacy.load("D:/AI-CP/NER/models/model-best")
model=pickle.load(open("./model_rf","rb"))
config=dotenv_values(".env")
client=OpenAI()
@app.get("/")
def home():
    return "Model Server is Running!"
@app.post("/api/ocr")
def receive():
    request_data_bytes = request.data
    request_data_string = request_data_bytes.decode('utf-8')
    request_data_dict = json.loads(request_data_string)
    res=analyze_read(request_data_dict['secure_url'])
  

    result=json.dumps({'content':res})
    print(result)
    
    return result
@app.post("/api/ner")
def predict():
    request_data_bytes=request.data
    request_data_string = request_data_bytes.decode('utf-8')
    request_data_dict = json.loads(request_data_string)
    doc = nlp(request_data_dict['content'])
    entities = [{"text": ent.text, "start": ent.start_char, "end": ent.end_char, "label": ent.label_} for ent in doc.ents]
    result=json.dumps({"entities":entities})
    print(result)
    return result
@app.post("/api/evaluate")
def cal_score():
    request_data_bytes=request.data
    request_data_string = request_data_bytes.decode('utf-8')
    request_data_dict = json.loads(request_data_string)
    features=extract_features(request_data_dict['content'])
    score=model.predict([features])
    return json.dumps({
        "score":score[0],
        "chars":features[0],
        "words":features[1],
        "sents":features[2],
        "avg":features[3],
        "error":features[4],
        "nouns":features[5],
        "verbs":features[6],
        "adjectives":features[7],
        "adverbs":features[8]
    })
@app.post("/api/prompt")
def openai():
    request_bytes=request.data
    request_string=request_bytes.decode('utf-8')
    request_dict=json.loads(request_string)
    completion = client.chat.completions.create(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "system", "content": "You are an English teacher and i want you to grade the english writing that i will provide you. first you need to determine the type of english writing like formal letter, informal letter,essay etc, then i want you to grade the english writing on a scal of 1 to 10 based on various factors like vocabulary, spelling mistakes,format etc. i want you to return the response in the form a python dictionary containing three keys: type,score,feedback. The english writing is : "+request_dict['content']},
  ]
)
    response=completion.choices[0].message
    print(response)
    return response


