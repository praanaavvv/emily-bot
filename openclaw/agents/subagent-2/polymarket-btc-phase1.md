# Polymarket BTC 5m/15m Bot — Phase 1 Research Plan

## Goal
Build a research pipeline for a Polymarket bot that trades short-horizon Bitcoin binary markets (5-minute and 15-minute horizons) using probability estimates rather than raw indicator guesses.

## Core principle
Do **not** trade because an indicator says "buy".
Trade only when:

- we can estimate the probability of BTC finishing up/down over the target horizon,
- Polymarket's implied probability is mispriced versus our estimate,
- the edge remains positive after fees, spread, slippage, and execution friction.

## Phase 1 deliverables

1. Define exact prediction targets for 5m and 15m markets
2. Identify required data sources
3. Build a dataset schema
4. Define feature set v1
5. Define labeling logic
6. Define evaluation metrics
7. Define no-trade filters and risk assumptions for research
8. Produce a first baseline model specification

---

## 1) Prediction targets

### Target A: 5-minute direction
Binary label:
- 1 if BTC reference price at `t + 5m` > price at `t`
- 0 otherwise

### Target B: 15-minute direction
Binary label:
- 1 if BTC reference price at `t + 15m` > price at `t`
- 0 otherwise

### Important note
Labeling must match the **actual Polymarket market resolution rule** as closely as possible:
- reference venue
- reference timestamp
- settlement convention
- handling of equal/flat closes

If we mismatch the labeling rule, the entire research pipeline becomes fake-smart nonsense.

---

## 2) Required data sources

### A. BTC market data
Minimum:
- 1-minute OHLCV candles
- preferably from Binance spot and/or Coinbase spot

Nice to have:
- perp funding / basis
- order-book imbalance
- trade volume bursts
- realized volatility

### B. Polymarket market data
Need:
- market question / slug / id
- start and end times
- YES / NO prices over time
- order book snapshots if available
- spreads and depth
- settlement logic

### C. Time alignment
All timestamps must be normalized to UTC.
We need exact alignment between:
- BTC market state at decision time
- Polymarket quoted probability at decision time
- realized outcome at expiry

---

## 3) Dataset schema (v1)

Each row should represent one decision timestamp for one market horizon.

Suggested columns:

- `timestamp_utc`
- `horizon_minutes` (5 or 15)
- `btc_spot_price`
- `btc_return_1m`
- `btc_return_3m`
- `btc_return_5m`
- `btc_return_15m`
- `range_5m`
- `range_15m`
- `realized_vol_5m`
- `realized_vol_15m`
- `distance_from_vwap_5m`
- `distance_from_ema_fast`
- `distance_from_ema_slow`
- `trend_strength_proxy`
- `volume_zscore`
- `market_regime`
- `polymarket_yes_price`
- `polymarket_no_price`
- `polymarket_implied_prob_yes`
- `spread_bps`
- `depth_near_mid`
- `label_up`
- `edge_raw`
- `edge_after_costs`

---

## 4) Feature set (v1)

Start simple. Short-horizon systems overfit very easily.

### Price action features
- last 1m return
- last 3m return
- last 5m return
- last 15m return
- rolling high-low range
- distance to VWAP
- distance to short EMA / medium EMA

### Volatility features
- realized vol over 5m
- realized vol over 15m
- intrabar range expansion
- volatility percentile versus recent window

### Volume features
- 1m volume z-score
- 5m rolling volume ratio
- burst / exhaustion proxy

### Regime features
- trend / chop classifier
- breakout state
- mean-reversion state
- event-spike / no-trade state

### Market pricing features
- Polymarket implied probability
- probability deviation from naive baseline (50/50)
- spread / depth / execution quality

---

## 5) Labeling logic

For timestamp `t`:

### 5m label
- `label_up_5m = 1` if `price[t+5m] > price[t]`, else `0`

### 15m label
- `label_up_15m = 1` if `price[t+15m] > price[t]`, else `0`

### Guardrails
- no future leakage in features
- if using close-based features at minute `t`, assume trade can only happen after that bar is complete
- if market is already too close to expiry to execute realistically, exclude the sample

---

## 6) Evaluation metrics

We do **not** care only about hit rate.
We care about whether our model beats market pricing.

### Model metrics
- accuracy
- precision / recall (secondary)
- log loss
- Brier score
- calibration curve
- ROC-AUC (low priority)

### Trading metrics
- average edge versus market implied probability
- expected value per trade
- realized value after costs
- hit rate conditional on edge bucket
- performance by regime
- performance by time of day

### Sanity thresholds
- if the model is not calibrated, do not trade it
- if edge disappears after spread/slippage, do not trade it
- if performance only exists in one tiny slice of history, assume overfitting

---

## 7) Research no-trade filters

Before any execution simulation, define filters such as:

- no trade when spread exceeds threshold
- no trade in extreme volatility spikes
- no trade when time-to-expiry is too short for reliable fill
- no trade when model edge < minimum threshold
- no trade during data gaps / stale market quotes

---

## 8) Baseline model specification

### Baseline 0
Naive benchmark:
- always predict market-implied probability

### Baseline 1
Simple logistic regression using:
- short returns
- realized volatility
- distance from VWAP
- volume z-score
- trend/chop regime

### Baseline 2
Gradient boosted trees (only after baseline 1)

Reason:
If logistic regression cannot find stable signal, a fancier model is more likely to overfit than to discover a hidden kingdom of edge.

---

## 9) Biggest Phase 1 research risks

1. **Look-ahead bias**
   - using information not available at trade time
2. **Label mismatch**
   - our target differs from Polymarket resolution
3. **Overfitting**
   - especially for 5m horizon
4. **Ignoring costs**
   - tiny predictive edge can be wiped out by spread/slippage
5. **Regime blindness**
   - BTC behavior changes materially by volatility state

---

## 10) Recommendation

Start with **15-minute markets first**.
Reason:
- less microstructure noise
- easier feature stability
- better chance of surviving costs

Only pursue 5-minute live trading if 15-minute research shows a real, stable, positive edge.

---

## 11) Next build steps after plan approval

1. Confirm Polymarket market resolution mechanics for BTC 5m/15m binaries
2. Choose data sources for BTC + Polymarket
3. Create project structure:
   - `data/`
   - `notebooks/`
   - `src/features/`
   - `src/labels/`
   - `src/models/`
   - `src/eval/`
4. Build first dataset puller
5. Build first labeled dataset
6. Fit baseline logistic model
7. Evaluate calibration + raw edge
