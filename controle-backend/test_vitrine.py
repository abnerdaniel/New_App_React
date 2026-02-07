import requests
import json

BASE_URL = "http://localhost:5024/api"

def test_vitrine():
    try:
        print(f"Testing GET {BASE_URL}/vitrine...")
        response = requests.get(f"{BASE_URL}/vitrine")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            lojas = response.json()
            print(f"Lojas encontradas: {len(lojas)}")
            print(json.dumps(lojas, indent=2))
            
            if len(lojas) > 0:
                first_loja_id = lojas[0]['id']
                test_vitrine_details(first_loja_id)
        else:
            print("Error response:", response.text)

    except Exception as e:
        print(f"Exception: {e}")

def test_vitrine_details(loja_id):
    try:
        print(f"\nTesting GET {BASE_URL}/vitrine/{loja_id}...")
        response = requests.get(f"{BASE_URL}/vitrine/{loja_id}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            details = response.json()
            print("Loja Details (summary):")
            print(f"Nome: {details.get('nomeLoja')}")
            print(f"LojaId: {details.get('lojaId')}")
            if 'cardapio' in details and details['cardapio']:
                cats = details['cardapio'].get('categorias', [])
                print(f"Categorias: {len(cats)}")
                if len(cats) > 0:
                    prods = cats[0].get('produtos', [])
                    print(f"Produtos na primeira categoria: {len(prods)}")
                    if len(prods) > 0:
                        print("Primeiro produto:", prods[0])
        else:
            print("Error response:", response.text)

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_vitrine()
