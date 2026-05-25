"""Color value objects for DyeMix domain."""

from __future__ import annotations
from dataclasses import dataclass
import math


@dataclass(frozen=True)
class LabColor:
    """CIELAB color value object."""
    L: float  # 0-100
    a: float  # -128 to +128
    b: float  # -128 to +128

    def delta_e_00(self, other: LabColor) -> float:
        """Compute CIE2000 Delta-E between two LAB colors (simplified)."""
        dL = other.L - self.L
        L_avg = (self.L + other.L) / 2.0

        C1 = math.sqrt(self.a**2 + self.b**2)
        C2 = math.sqrt(other.a**2 + other.b**2)
        C_avg = (C1 + C2) / 2.0

        C_avg7 = C_avg**7
        G = 0.5 * (1 - math.sqrt(C_avg7 / (C_avg7 + 25**7)))

        a1p = self.a * (1 + G)
        a2p = other.a * (1 + G)

        C1p = math.sqrt(a1p**2 + self.b**2)
        C2p = math.sqrt(a2p**2 + other.b**2)
        dCp = C2p - C1p
        C_avgp = (C1p + C2p) / 2.0

        h1p = math.degrees(math.atan2(self.b, a1p)) % 360
        h2p = math.degrees(math.atan2(other.b, a2p)) % 360

        if abs(h1p - h2p) <= 180:
            dhp = h2p - h1p
        elif h2p - h1p > 180:
            dhp = h2p - h1p - 360
        else:
            dhp = h2p - h1p + 360

        dHp = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dhp / 2))

        if abs(h1p - h2p) <= 180:
            H_avgp = (h1p + h2p) / 2
        elif h1p + h2p < 360:
            H_avgp = (h1p + h2p + 360) / 2
        else:
            H_avgp = (h1p + h2p - 360) / 2

        T = (1
             - 0.17 * math.cos(math.radians(H_avgp - 30))
             + 0.24 * math.cos(math.radians(2 * H_avgp))
             + 0.32 * math.cos(math.radians(3 * H_avgp + 6))
             - 0.20 * math.cos(math.radians(4 * H_avgp - 63)))

        SL = 1 + 0.015 * (L_avg - 50)**2 / math.sqrt(20 + (L_avg - 50)**2)
        SC = 1 + 0.045 * C_avgp
        SH = 1 + 0.015 * C_avgp * T

        C_avgp7 = C_avgp**7
        RT = (-2 * math.sqrt(C_avgp7 / (C_avgp7 + 25**7))
              * math.sin(math.radians(60 * math.exp(-((H_avgp - 275) / 25)**2))))

        dE = math.sqrt(
            (dL / SL)**2 +
            (dCp / SC)**2 +
            (dHp / SH)**2 +
            RT * (dCp / SC) * (dHp / SH)
        )
        return dE

    def to_dict(self) -> dict:
        return {"L": self.L, "a": self.a, "b": self.b}

    @classmethod
    def from_dict(cls, d: dict) -> LabColor:
        return cls(L=float(d["L"]), a=float(d["a"]), b=float(d["b"]))


@dataclass(frozen=True)
class RgbColor:
    """sRGB color value object (0-255)."""
    r: int
    g: int
    b: int

    def to_hex(self) -> str:
        return f"#{self.r:02X}{self.g:02X}{self.b:02X}"

    @classmethod
    def from_hex(cls, hex_str: str) -> RgbColor:
        hex_str = hex_str.lstrip("#")
        return cls(
            r=int(hex_str[0:2], 16),
            g=int(hex_str[2:4], 16),
            b=int(hex_str[4:6], 16),
        )

    def to_lab(self) -> LabColor:
        """Convert sRGB to CIELAB (D65 illuminant)."""
        # Linearize sRGB
        def linearize(c: int) -> float:
            v = c / 255.0
            return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

        rl, gl, bl = linearize(self.r), linearize(self.g), linearize(self.b)

        # sRGB to XYZ (D65)
        x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375
        y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750
        z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041

        # XYZ to Lab
        xn, yn, zn = 0.95047, 1.0, 1.08883

        def f(t: float) -> float:
            return t ** (1/3) if t > 0.008856 else 7.787 * t + 16/116

        fx, fy, fz = f(x / xn), f(y / yn), f(z / zn)

        L = 116 * fy - 16
        a = 500 * (fx - fy)
        b = 200 * (fy - fz)
        return LabColor(L=round(L, 2), a=round(a, 2), b=round(b, 2))


def hex_to_lab(hex_str: str) -> LabColor:
    """Utility: convert hex string to CIELAB."""
    return RgbColor.from_hex(hex_str).to_lab()


def lab_to_hex(lab: LabColor) -> str:
    """Utility: convert CIELAB to hex string (approximate)."""
    # Lab to XYZ
    fy = (lab.L + 16) / 116
    fx = lab.a / 500 + fy
    fz = fy - lab.b / 200

    xn, yn, zn = 0.95047, 1.0, 1.08883

    def f_inv(t: float) -> float:
        return t**3 if t**3 > 0.008856 else (t - 16/116) / 7.787

    x = xn * f_inv(fx)
    y = yn * f_inv(fy)
    z = zn * f_inv(fz)

    # XYZ to linear RGB
    rl = x * 3.2404542 + y * -1.5371385 + z * -0.4985314
    gl = x * -0.9692660 + y * 1.8760108 + z * 0.0415560
    bl = x * 0.0556434 + y * -0.2040259 + z * 1.0572252

    # Gamma correction
    def gamma(c: float) -> int:
        c = max(0.0, min(1.0, c))
        v = 12.92 * c if c <= 0.0031308 else 1.055 * c**(1/2.4) - 0.055
        return max(0, min(255, round(v * 255)))

    return f"#{gamma(rl):02X}{gamma(gl):02X}{gamma(bl):02X}"
