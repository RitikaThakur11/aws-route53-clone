def test_create_hosted_zone_success(client, auth_headers):
    response = client.post(
        "/api/hosted-zones",
        headers=auth_headers,
        json={
            "name": "example.org",
            "type": "Public",
            "description": "Production domain for example.org"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "example.org."
    assert data["type"] == "Public"
    assert data["record_count"] == 5  # 4 NS records + 1 SOA record
    assert data["id"].startswith("Z")


def test_create_hosted_zone_invalid_domain(client, auth_headers):
    response = client.post(
        "/api/hosted-zones",
        headers=auth_headers,
        json={
            "name": "invalid..domain!!",
            "type": "Public"
        }
    )
    assert response.status_code == 400
    assert "detail" in response.json()


def test_create_hosted_zone_duplicate(client, auth_headers):
    # First creation
    client.post(
        "/api/hosted-zones",
        headers=auth_headers,
        json={"name": "duplicate-test.com", "type": "Public"}
    )
    # Second creation should conflict
    response = client.post(
        "/api/hosted-zones",
        headers=auth_headers,
        json={"name": "duplicate-test.com", "type": "Public"}
    )
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_list_hosted_zones_and_search(client, auth_headers):
    client.post("/api/hosted-zones", headers=auth_headers, json={"name": "alpha.com", "type": "Public"})
    client.post("/api/hosted-zones", headers=auth_headers, json={"name": "beta.net", "type": "Private", "is_private": True})

    # Search for alpha
    resp = client.get("/api/hosted-zones?search=alpha", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "alpha.com."

    # Filter by type Private
    resp_priv = client.get("/api/hosted-zones?type=Private", headers=auth_headers)
    assert resp_priv.status_code == 200
    assert resp_priv.json()["total"] == 1
    assert resp_priv.json()["items"][0]["name"] == "beta.net."


def test_get_and_update_hosted_zone(client, auth_headers):
    create_resp = client.post(
        "/api/hosted-zones",
        headers=auth_headers,
        json={"name": "update-test.com", "description": "Original description"}
    )
    zone_id = create_resp.json()["id"]

    # Get by ID
    get_resp = client.get(f"/api/hosted-zones/{zone_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["description"] == "Original description"

    # Update description
    patch_resp = client.patch(
        f"/api/hosted-zones/{zone_id}",
        headers=auth_headers,
        json={"description": "Updated description"}
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["description"] == "Updated description"


def test_delete_hosted_zone_cascade(client, auth_headers):
    create_resp = client.post(
        "/api/hosted-zones",
        headers=auth_headers,
        json={"name": "delete-test.com"}
    )
    zone_id = create_resp.json()["id"]

    # Add a custom A record
    rec_resp = client.post(
        f"/api/hosted-zones/{zone_id}/records",
        headers=auth_headers,
        json={"name": "api", "type": "A", "value": "1.2.3.4", "ttl": 300}
    )
    assert rec_resp.status_code == 201
    rec_id = rec_resp.json()["id"]

    # Delete the zone
    del_resp = client.delete(f"/api/hosted-zones/{zone_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    # Verify zone is gone
    get_resp = client.get(f"/api/hosted-zones/{zone_id}", headers=auth_headers)
    assert get_resp.status_code == 404

    # Verify record was cascaded away
    rec_get = client.get(f"/api/records/{rec_id}", headers=auth_headers)
    assert rec_get.status_code == 404


def test_export_and_import_bind(client, auth_headers):
    create_resp = client.post(
        "/api/hosted-zones",
        headers=auth_headers,
        json={"name": "bind-test.com"}
    )
    zone_id = create_resp.json()["id"]

    # Add A record
    client.post(
        f"/api/hosted-zones/{zone_id}/records",
        headers=auth_headers,
        json={"name": "www", "type": "A", "value": "192.0.2.1", "ttl": 300}
    )

    # Export BIND
    export_resp = client.get(f"/api/hosted-zones/{zone_id}/export?format=bind", headers=auth_headers)
    assert export_resp.status_code == 200
    bind_text = export_resp.text
    assert "$ORIGIN bind-test.com." in bind_text
    assert "192.0.2.1" in bind_text

    # Test import into a new zone
    new_zone_resp = client.post(
        "/api/hosted-zones",
        headers=auth_headers,
        json={"name": "imported-zone.com"}
    )
    new_zone_id = new_zone_resp.json()["id"]

    import_resp = client.post(
        f"/api/hosted-zones/{new_zone_id}/import",
        headers=auth_headers,
        json={"zone_content": "app 300 IN A 10.0.0.1\nmail 300 IN MX 10 mx1.imported-zone.com."}
    )
    assert import_resp.status_code == 200
    assert import_resp.json()["imported_count"] == 2
