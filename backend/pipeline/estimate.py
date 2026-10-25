# Modelled estimate of extra preterm births. An approximation, not a prediction.
CRUDE_BIRTH_RATE = 29.9 / 1000   # births per person per year, Zimbabwe 2024 (World Bank via FRED)
BASELINE_PRETERM = 0.17          # share of births that are preterm (Blencowe et al. 2012, via UNICEF)
UPPER_ADDED_RISK = 0.61          # sensitivity: low-income countries in high heat, OR 1.61 (Lakhoo et al. 2024)

def daily_births(population):
    return population * CRUDE_BIRTH_RATE / 365

def extra_preterm(population, added_risk):
    """Extra preterm births per day = daily births x baseline preterm rate x added risk."""
    return daily_births(population) * BASELINE_PRETERM * added_risk