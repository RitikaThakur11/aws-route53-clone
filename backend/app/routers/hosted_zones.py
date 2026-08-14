import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.database import get_db
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord
from app.models.user import User
from app.schemas.hosted_zone import (
    HostedZoneCreate,
    HostedZoneUpdate,
    HostedZoneResponse,
    HostedZoneListResponse
)
from app.schemas.dns_record import (
    DNSRecordListResponse,
    DNSRecordResponse,
    ZoneImportRequest,
    ZoneImportResponse
)
from app.services.auth_service import get_current_user
from app.services.dns_validator import validate_domain_name
from app.services.zone_service import (
    create_default_zone_records,
    get_zone_record_count
)
from app.services.bind_formatter import export_zone_to_bind, parse_bind_zone

router = APIRouter(prefix="/hosted-zones", tags=["Hosted Zones"])

@router.get("", response_model=HostedZoneListResponse)
def list_hosted_zones(
    search: Optional[str] = Query(None, description="Search domain name or description"),
    type: Optional[str] = Query(None, description="Filter by zone type: 'Public' or 'Private'"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List hosted zones with search, type filter, and pagination.
    """
    query = db.query(HostedZone)

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(HostedZone.name).like(s),
                func.lower(HostedZone.description).like(s),
                func.lower(HostedZone.id).like(s)
            )
        )

    if type and type != "ALL":
        query = query.filter(HostedZone.type == type)

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size

    zones = query.order_by(HostedZone.created_at.desc()).offset(offset).limit(page_size).all()

    # Calculate record counts
    items = []
    for z in zones:
        count = get_zone_record_count(db, z.id)
        resp = HostedZoneResponse.model_validate(z)
        resp.record_count = count
        items.append(resp)

    return HostedZoneListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("", response_model=HostedZoneResponse, status_code=status.HTTP_201_CREATED)
def create_hosted_zone(
    payload: HostedZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new hosted zone and automatically provision default NS and SOA records.
    Validates domain name and duplicate detection.
    """
    domain = payload.name.strip().lower()
    if not domain.endswith('.'):
        domain_with_dot = domain + '.'
    else:
        domain_with_dot = domain
        domain = domain[:-1]

    # Validate domain name
    if not validate_domain_name(domain):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Enter a valid domain name, such as 'example.com'. '{payload.name}' is invalid."
        )

    # Check duplicate domain with same type
    zone_type = "Private" if (payload.is_private or payload.type == "Private") else "Public"
    existing = db.query(HostedZone).filter(
        HostedZone.name == domain_with_dot,
        HostedZone.type == zone_type
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A {zone_type} hosted zone for '{domain}' already exists (Zone ID: {existing.id})."
        )

    new_zone = HostedZone(
        name=domain_with_dot,
        type=zone_type,
        description=payload.description or "",
        is_private=(zone_type == "Private")
    )
    db.add(new_zone)
    db.flush()

    # Automatically provision Route53 default NS and SOA records
    default_records = create_default_zone_records(db, new_zone)
    db.commit()
    db.refresh(new_zone)

    resp = HostedZoneResponse.model_validate(new_zone)
    resp.record_count = len(default_records)
    return resp


@router.get("/{id}", response_model=HostedZoneResponse)
def get_hosted_zone(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve hosted zone details and record count by ID.
    """
    zone = db.query(HostedZone).filter(HostedZone.id == id).first()
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hosted zone '{id}' not found."
        )

    count = get_zone_record_count(db, zone.id)
    resp = HostedZoneResponse.model_validate(zone)
    resp.record_count = count
    return resp


@router.patch("/{id}", response_model=HostedZoneResponse)
@router.put("/{id}", response_model=HostedZoneResponse)
def update_hosted_zone(
    id: str,
    payload: HostedZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update hosted zone metadata (e.g. description) without altering domain name or records.
    """
    zone = db.query(HostedZone).filter(HostedZone.id == id).first()
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hosted zone '{id}' not found."
        )

    if payload.description is not None:
        zone.description = payload.description

    db.commit()
    db.refresh(zone)

    count = get_zone_record_count(db, zone.id)
    resp = HostedZoneResponse.model_validate(zone)
    resp.record_count = count
    return resp


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a hosted zone and all associated DNS records safely via relational cascade.
    """
    zone = db.query(HostedZone).filter(HostedZone.id == id).first()
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hosted zone '{id}' not found."
        )

    db.delete(zone)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{id}/records", response_model=DNSRecordListResponse)
def list_zone_records(
    id: str,
    search: Optional[str] = Query(None, description="Search record name, type, or value"),
    type: Optional[str] = Query(None, description="Filter by record type (A, CNAME, etc.)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(25, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List DNS records for a given hosted zone with search and filtering.
    """
    zone = db.query(HostedZone).filter(HostedZone.id == id).first()
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hosted zone '{id}' not found."
        )

    query = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == id)

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(DNSRecord.name).like(s),
                func.lower(DNSRecord.value).like(s),
                func.lower(DNSRecord.type).like(s)
            )
        )

    if type and type != "ALL":
        query = query.filter(DNSRecord.type == type.upper())

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size

    # Order SOA first, then NS, then alphabetically by name and type
    records = query.order_by(
        (DNSRecord.type == "SOA").desc(),
        (DNSRecord.type == "NS").desc(),
        DNSRecord.name.asc(),
        DNSRecord.type.asc()
    ).offset(offset).limit(page_size).all()

    zone_resp = HostedZoneResponse.model_validate(zone)
    zone_resp.record_count = db.query(func.count(DNSRecord.id)).filter(DNSRecord.hosted_zone_id == id).scalar() or 0

    return DNSRecordListResponse(
        items=[DNSRecordResponse.model_validate(r) for r in records],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        hosted_zone=zone_resp
    )


@router.get("/{id}/export")
def export_hosted_zone(
    id: str,
    format: str = Query("bind", description="'bind' or 'json'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export hosted zone records in standard BIND format or JSON.
    """
    zone = db.query(HostedZone).filter(HostedZone.id == id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Hosted zone '{id}' not found.")

    records = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == id).all()

    if format.lower() == "json":
        return {
            "zone": HostedZoneResponse.model_validate(zone),
            "records": [DNSRecordResponse.model_validate(r) for r in records]
        }

    # BIND format export
    bind_text = export_zone_to_bind(zone, records)
    filename = f"{zone.name.rstrip('.')}.zone.txt"
    return Response(
        content=bind_text,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/{id}/import", response_model=ZoneImportResponse)
def import_zone_records(
    id: str,
    payload: ZoneImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Import DNS records from BIND zone file text.
    """
    zone = db.query(HostedZone).filter(HostedZone.id == id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Hosted zone '{id}' not found.")

    parsed_records = parse_bind_zone(payload.zone_content, zone.name)
    if not parsed_records:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid DNS records found in uploaded content.")

    created_records = []
    for item in parsed_records:
        rec = DNSRecord(
            hosted_zone_id=zone.id,
            name=item["name"],
            type=item["type"],
            ttl=item["ttl"],
            value=item["value"],
            priority=item["priority"],
            weight=item["weight"],
            port=item["port"],
            flags=item["flags"],
            tag=item["tag"],
            routing_policy=item["routing_policy"]
        )
        db.add(rec)
        created_records.append(rec)

    db.commit()
    for r in created_records:
        db.refresh(r)

    return ZoneImportResponse(
        imported_count=len(created_records),
        records=[DNSRecordResponse.model_validate(r) for r in created_records],
        message=f"Successfully imported {len(created_records)} records into {zone.name}."
    )
