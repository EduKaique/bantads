import re
import time

import pytest
import requests

MAILPIT_URL = "http://localhost:8025"


def buscar_senha_no_email(email_destino: str, tentativas: int = 20) -> str:
    """
    Aguarda o e-mail chegar no Mailpit e extrai a senha inicial.
    Tenta por até ~20s (20 tentativas x 1s).
    """
    for i in range(tentativas):
        try:
            resp = requests.get(f"{MAILPIT_URL}/api/v1/messages", timeout=5)
            messages = resp.json().get("messages", [])

            for msg in messages:
                destinatarios = str(msg.get("To", ""))
                if email_destino.lower() in destinatarios.lower():
                    msg_id = msg["ID"]
                    body = requests.get(
                        f"{MAILPIT_URL}/api/v1/message/{msg_id}", timeout=5
                    ).json().get("Text", "")

                    match = re.search(r"Senha inicial:\s+(\S+)", body)
                    if match:
                        senha = match.group(1)
                        print(f"\n[conftest] ✅ Senha interceptada do Mailpit para {email_destino}: {senha}")
                        return senha
        except requests.RequestException as e:
            print(f"\n[conftest] ⚠️  Erro ao consultar Mailpit (tentativa {i+1}): {e}")

        time.sleep(1)

    print(f"\n[conftest] ❌ Senha não encontrada no Mailpit para {email_destino} após {tentativas}s")
    return ""


@pytest.fixture(autouse=True)
def mock_input(monkeypatch):
    """
    Substitui o input() do script de teste.
    Quando o prompt pede a senha de um e-mail, busca automaticamente no Mailpit.
    Para qualquer outro input(), retorna string vazia.
    """
    def input_interceptado(prompt=""):
        print(prompt)

        match = re.search(r"[\w.+-]+@[\w.-]+\.\w+", prompt)
        if match:
            email = match.group(0)
            return buscar_senha_no_email(email)

        return ""

    monkeypatch.setattr("builtins.input", input_interceptado)