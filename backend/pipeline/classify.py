LEVELS = ["Normal", "Caution", "High", "Extreme"]
CUTS = [30.05, 33.34, 38.64]          # Heil et al. 2026, preterm birth, Tmax in °C
ADDED_RISK = [0.0, 0.05, 0.10, 0.20]
COLOURS = ["#9CA3AF", "#FACC15", "#F97316", "#DC2626"]

def classify(tmax: float, p95: float) -> dict:
    base = sum(tmax >= c for c in CUTS)          # 0 to 3
    boosted = tmax >= p95 and base < 3
    level = base + 1 if boosted else base
    return {
        "tmax": round(tmax, 1),
        "base_level": LEVELS[base],
        "level": LEVELS[level],
        "boosted": boosted,                       # show "Unusually hot for this district"
        "added_risk": ADDED_RISK[level],
        "colour": COLOURS[level],
    }

if __name__ == "__main__":
    # quick self-test
    print(classify(31.0, p95=35.0))   # Caution, no boost
    print(classify(31.0, p95=30.5))   # Caution boosted to High
    print(classify(28.0, p95=27.5))   # cool highland district: Normal boosted to Caution
    print(classify(40.0, p95=36.0))   # already Extreme, stays Extreme