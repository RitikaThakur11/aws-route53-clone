def test_login_success(client):
    response = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@example.com"
    assert "account_id" in data["user"]


def test_login_invalid_password(client):
    response = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "detail" in response.json()


def test_get_current_user_me(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@example.com"


def test_logout(client, auth_headers):
    response = client.post("/api/auth/logout", headers=auth_headers)
    assert response.status_code == 200
    assert "message" in response.json()
