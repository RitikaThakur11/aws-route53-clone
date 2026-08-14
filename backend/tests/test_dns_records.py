import pytest

@pytest.fixture
def test_zone(client, auth_headers):
    resp = client.post("/api/hosted-zones", headers=auth_headers, json={"name": "testzone.org"})
    assert resp.status_code == 201
    return resp.json()


def test_create_all_dns_record_types(client, auth_headers, test_zone):
    zone_id = test_zone["id"]

    # 1. A Record
    r_a = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "web", "type": "A", "value": "192.0.2.55", "ttl": 300
    })
    assert r_a.status_code == 201
    assert r_a.json()["name"] == "web.testzone.org."

    # 2. AAAA Record
    r_aaaa = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "web", "type": "AAAA", "value": "2001:db8::1", "ttl": 300
    })
    assert r_aaaa.status_code == 201
    assert r_aaaa.json()["value"] == "2001:db8::1"

    # 3. CNAME Record
    r_cname = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "docs", "type": "CNAME", "value": "web.testzone.org.", "ttl": 300
    })
    assert r_cname.status_code == 201

    # 4. TXT Record
    r_txt = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "@", "type": "TXT", "value": "v=spf1 ip4:192.0.2.0/24 -all", "ttl": 600
    })
    assert r_txt.status_code == 201

    # 5. MX Record
    r_mx = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "@", "type": "MX", "value": "mail.testzone.org.", "priority": 10, "ttl": 3600
    })
    assert r_mx.status_code == 201
    assert r_mx.json()["priority"] == 10

    # 6. NS Record
    r_ns = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "sub", "type": "NS", "value": "ns1.externaldns.net.", "ttl": 86400
    })
    assert r_ns.status_code == 201

    # 7. PTR Record
    r_ptr = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "55.2.0.192.in-addr.arpa", "type": "PTR", "value": "web.testzone.org.", "ttl": 300
    })
    assert r_ptr.status_code == 201

    # 8. SRV Record
    r_srv = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "_sip._tcp", "type": "SRV", "value": "sipserver.testzone.org.",
        "priority": 10, "weight": 50, "port": 5060, "ttl": 3600
    })
    assert r_srv.status_code == 201
    assert r_srv.json()["port"] == 5060

    # 9. CAA Record
    r_caa = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "@", "type": "CAA", "value": "letsencrypt.org",
        "flags": 0, "tag": "issue", "ttl": 86400
    })
    assert r_caa.status_code == 201
    assert r_caa.json()["tag"] == "issue"


def test_validation_errors(client, auth_headers, test_zone):
    zone_id = test_zone["id"]

    # Invalid IPv4 for A record
    r1 = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "badip", "type": "A", "value": "999.999.999.999", "ttl": 300
    })
    assert r1.status_code == 400
    assert "IPv4" in r1.json()["detail"]

    # Negative TTL
    r2 = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "badttl", "type": "A", "value": "192.0.2.1", "ttl": -5
    })
    assert r2.status_code in (400, 422)

    # Invalid CAA tag
    r3 = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "@", "type": "CAA", "value": "example.com", "flags": 0, "tag": "invalid_tag", "ttl": 300
    })
    assert r3.status_code == 400
    assert "CAA tag" in r3.json()["detail"]


def test_cname_collision_rules(client, auth_headers, test_zone):
    zone_id = test_zone["id"]

    # Create A record for "blog"
    client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "blog", "type": "A", "value": "192.0.2.1", "ttl": 300
    })

    # Creating CNAME for "blog" should be rejected
    r_cname = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "blog", "type": "CNAME", "value": "target.example.com.", "ttl": 300
    })
    assert r_cname.status_code == 409
    assert "CNAME" in r_cname.json()["detail"]


def test_update_and_delete_dns_record(client, auth_headers, test_zone):
    zone_id = test_zone["id"]

    create_resp = client.post(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers, json={
        "name": "server1", "type": "A", "value": "10.0.0.1", "ttl": 300
    })
    rec_id = create_resp.json()["id"]

    # Update value & TTL
    patch_resp = client.patch(f"/api/records/{rec_id}", headers=auth_headers, json={
        "value": "10.0.0.99", "ttl": 60
    })
    assert patch_resp.status_code == 200
    assert patch_resp.json()["value"] == "10.0.0.99"
    assert patch_resp.json()["ttl"] == 60

    # Delete record
    del_resp = client.delete(f"/api/records/{rec_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    # Verify deleted
    get_resp = client.get(f"/api/records/{rec_id}", headers=auth_headers)
    assert get_resp.status_code == 404
