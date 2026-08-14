from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord
from app.models.user import User
from app.schemas.dns_record import (
    DNSRecordCreate,
    DNSRecordUpdate,
    DNSRecordResponse
)
from app.services.auth_service import get_current_user
from app.services.dns_validator import (
    normalize_domain_name,
    validate_dns_record,
    SUPPORTED_RECORD_TYPES
)

router = APIRouter(tags=["DNS Records"])

@router.post("/hosted-zones/{zone_id}/records", response_model=DNSRecordResponse, status_code=status.HTTP_201_CREATED)
@router.post("/records", response_model=DNSRecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(
    payload: DNSRecordCreate,
    zone_id: Optional[str] = None,
    hosted_zone_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new DNS record under a specified hosted zone.
    Validates DNS type-specific formatting, normalizes record name, and handles CNAME conflict rules.
    """
    target_zone_id = zone_id or hosted_zone_id
    if not target_zone_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="hosted_zone_id is required."
        )

    zone = db.query(HostedZone).filter(HostedZone.id == target_zone_id).first()
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hosted zone '{target_zone_id}' not found."
        )

    rec_type = payload.type.upper()
    if rec_type not in SUPPORTED_RECORD_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported record type '{payload.type}'."
        )

    # Normalize record name
    normalized_name = normalize_domain_name(payload.name, zone.name)

    # Perform thorough DNS RFC validation
    is_valid, error_msg = validate_dns_record(
        record_type=rec_type,
        name=payload.name,
        value=payload.value,
        ttl=payload.ttl,
        zone_name=zone.name,
        priority=payload.priority,
        weight=payload.weight,
        port=payload.port,
        flags=payload.flags,
        tag=payload.tag
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    # Check for CNAME collision rules (CNAME cannot coexist with other record types for the exact same name)
    if rec_type == "CNAME":
        existing_other = db.query(DNSRecord).filter(
            DNSRecord.hosted_zone_id == zone.id,
            DNSRecord.name == normalized_name
        ).first()
        if existing_other:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A record with name '{normalized_name}' already exists ({existing_other.type}). CNAME records cannot coexist with other records of the same name."
            )
    else:
        existing_cname = db.query(DNSRecord).filter(
            DNSRecord.hosted_zone_id == zone.id,
            DNSRecord.name == normalized_name,
            DNSRecord.type == "CNAME"
        ).first()
        if existing_cname:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A CNAME record already exists for '{normalized_name}'. Cannot add a {rec_type} record."
            )

    # Check exact duplicate record (same name, type, and value)
    duplicate = db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == zone.id,
        DNSRecord.name == normalized_name,
        DNSRecord.type == rec_type,
        DNSRecord.value == payload.value.strip()
    ).first()
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A {rec_type} record with name '{normalized_name}' and value '{payload.value}' already exists."
        )

    record = DNSRecord(
        hosted_zone_id=zone.id,
        name=normalized_name,
        type=rec_type,
        ttl=payload.ttl,
        value=payload.value.strip(),
        priority=payload.priority,
        weight=payload.weight,
        port=payload.port,
        flags=payload.flags,
        tag=payload.tag,
        routing_policy=payload.routing_policy or "Simple"
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return DNSRecordResponse.model_validate(record)


@router.get("/records/{id}", response_model=DNSRecordResponse)
def get_record(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve single DNS record by ID.
    """
    record = db.query(DNSRecord).filter(DNSRecord.id == id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DNS record '{id}' not found."
        )
    return DNSRecordResponse.model_validate(record)


@router.patch("/records/{id}", response_model=DNSRecordResponse)
@router.put("/records/{id}", response_model=DNSRecordResponse)
def update_record(
    id: str,
    payload: DNSRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing DNS record.
    """
    record = db.query(DNSRecord).filter(DNSRecord.id == id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DNS record '{id}' not found."
        )

    # Protect system-critical apex SOA record type modification if needed
    new_value = payload.value.strip() if payload.value is not None else record.value
    new_ttl = payload.ttl if payload.ttl is not None else record.ttl
    new_priority = payload.priority if payload.priority is not None else record.priority
    new_weight = payload.weight if payload.weight is not None else record.weight
    new_port = payload.port if payload.port is not None else record.port
    new_flags = payload.flags if payload.flags is not None else record.flags
    new_tag = payload.tag if payload.tag is not None else record.tag

    # Validate updated values
    is_valid, error_msg = validate_dns_record(
        record_type=record.type,
        name=record.name,
        value=new_value,
        ttl=new_ttl,
        zone_name=record.hosted_zone.name,
        priority=new_priority,
        weight=new_weight,
        port=new_port,
        flags=new_flags,
        tag=new_tag
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    record.value = new_value
    record.ttl = new_ttl
    if payload.priority is not None:
        record.priority = payload.priority
    if payload.weight is not None:
        record.weight = payload.weight
    if payload.port is not None:
        record.port = payload.port
    if payload.flags is not None:
        record.flags = payload.flags
    if payload.tag is not None:
        record.tag = payload.tag
    if payload.routing_policy is not None:
        record.routing_policy = payload.routing_policy

    db.commit()
    db.refresh(record)

    return DNSRecordResponse.model_validate(record)


@router.delete("/records/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a DNS record by ID.
    """
    record = db.query(DNSRecord).filter(DNSRecord.id == id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DNS record '{id}' not found."
        )

    db.delete(record)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
