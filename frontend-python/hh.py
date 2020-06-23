import requests
import urllib.parse
import pandas as pd
import json


def add_data(path):
    try:
        login_url = 'https://rnsit-ecert.herokuapp.com/users/login'
        login_data = {
            "userName": "admin",
            "password": "password"
        }
        session = requests.session()

        r = session.post(login_url, data=login_data)
        user_token = (json.loads(r.text))['data']['userToken']
        # print(r.text)
        print(user_token)
        file_data = {
            'file': (path, open(path, 'rb'))
        }
        form_data = {
            'file': path,
            'usertoken': user_token
        }
        response = requests.post('https://rnsit-ecert.herokuapp.com/data/add-files', files=file_data, data=form_data)
        # print(response.text)
        l = []
        for i in json.loads(response.text)['data']['result']:
            l.append(i['verifyUrl'])

        logout_url = 'https://rnsit-ecert.herokuapp.com/users/logout/' + user_token
        logout_response = requests.get(logout_url)
        # print(logout_response.text)
        datagram = pd.read_csv(path)
        datagram['serial'] = l
        datagram.to_csv(path)
    except:
        print("error")
        logout_url = 'https://rnsit-ecert.herokuapp.com/users/logout/' + user_token
        logout_response = requests.get(logout_url)
        print(logout_response.text)


add_data('C://Users//vivek//Desktop//ncetest3//csv//participants.csv')
