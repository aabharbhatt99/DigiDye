"""Domain entities for DyeMix."""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import uuid


def new_id() -> str:
    return str(uuid.uuid4())


def now() -> datetime:
    return datetime.utcnow()


@dataclass
class Tenant:
    id: str = field(default_factory=new_id)
    name: str = ""
    created_at: datetime = field(default_factory=now)


@dataclass
class User:
    id: str = field(default_factory=new_id)
    tenant_id: str = ""
    email: str = ""
    display_name: str = ""
    password_hash: str = ""
    role: str = "owner"  # owner | admin | member
    created_at: datetime = field(default_factory=now)


@dataclass
class Profile:
    id: str = field(default_factory=new_id)
    tenant_id: str = ""
    user_id: str = ""
    name: str = ""
    dye_form: str = "powder"  # powder | liquid
    material: str = "Wool"
    created_at: datetime = field(default_factory=now)
    updated_at: datetime = field(default_factory=now)


@dataclass
class BaseDye:
    id: str = field(default_factory=new_id)
    profile_id: str = ""
    name: str = ""
    ci_number: str = ""
    color_hex: str = "#000000"
    color_lab: dict = field(default_factory=lambda: {"L": 0, "a": 0, "b": 0})
    form: str = "powder"  # powder | liquid
    concentration_g_per_l: Optional[float] = None
    manufacturer: str = ""
    sku: str = ""
    created_at: datetime = field(default_factory=now)


@dataclass
class Recipe:
    id: str = field(default_factory=new_id)
    profile_id: str = ""
    name: str = ""
    target_color_hex: str = "#000000"
    target_color_lab: dict = field(default_factory=lambda: {"L": 0, "a": 0, "b": 0})
    material: str = "Wool"
    total_batch_weight_mg: float = 1000.0
    thread_weight_g: Optional[float] = None
    liquor_ratio: Optional[str] = None
    water_volume_ml: Optional[float] = None
    notes: str = ""
    source_image_url: Optional[str] = None
    created_at: datetime = field(default_factory=now)
    updated_at: datetime = field(default_factory=now)
    ingredients: list[RecipeIngredient] = field(default_factory=list)
    auxiliaries: list[RecipeAuxiliary] = field(default_factory=list)


@dataclass
class RecipeIngredient:
    id: str = field(default_factory=new_id)
    recipe_id: str = ""
    base_dye_id: str = ""
    base_dye_name: str = ""
    quantity_mg: float = 0.0
    quantity_ml: Optional[float] = None
    percentage: float = 0.0


@dataclass
class RecipeAuxiliary:
    id: str = field(default_factory=new_id)
    recipe_id: str = ""
    name: str = ""
    quantity_g: float = 0.0
    quantity_ml: Optional[float] = None
    unit: str = "grams"  # grams | milliliters
    purpose: str = ""


@dataclass
class DirectoryEntry:
    id: str = field(default_factory=new_id)
    profile_id: str = ""
    name: str = ""
    category: str = ""
    recipe_id: Optional[str] = None
    color_hex: str = "#000000"
    color_lab: dict = field(default_factory=lambda: {"L": 0, "a": 0, "b": 0})
    created_at: datetime = field(default_factory=now)


@dataclass
class UploadedImage:
    id: str = field(default_factory=new_id)
    profile_id: str = ""
    file_name: str = ""
    storage_path: str = ""
    url: str = ""
    created_at: datetime = field(default_factory=now)
