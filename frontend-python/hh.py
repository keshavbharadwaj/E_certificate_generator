import requests
import urllib.parse
import numpy as np
import pandas as pd
import json
import sys


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
        print(user_token)

        datagram = pd.read_csv(path)
        datagram['verifyUrl'] = np.nan

        datagram.drop(datagram.index, inplace=True)
        print('here1')
        # print(r.text)
        # print(user_token)
        file_data = {
            'file': (path, open(path, 'rb'))
        }
        form_data = {
            'file': path,
            'usertoken': user_token
        }
        response = requests.post('https://rnsit-ecert.herokuapp.com/data/add-files', files=file_data, data=form_data)
        print(response.text)
        print("here")
        for i in json.loads(response.text)['data']['result']:
            k = pd.DataFrame(i, index=[0])
            datagram = datagram.append(k)
        # datagram.append(k)
        # datagram.append(i)

        logout_url = 'https://rnsit-ecert.herokuapp.com/users/logout/' + user_token
        logout_response = requests.get(logout_url)
        print(datagram)
        # print(logout_response.text)
        # datagram['serial']=l
        datagram.rename(columns={'verifyUrl': 'serial'}, inplace=True)
        datagram.to_csv(path, index=False)
    except:
        print("Unexpected error:", sys.exc_info()[0])
        print("error")
        logout_url = 'https://rnsit-ecert.herokuapp.com/users/logout/' + user_token
        logout_response = requests.get(logout_url)
        print(logout_response.text)


add_data('C://Users//vivek//Desktop//ncetest3//csv//bgp2.csv')
