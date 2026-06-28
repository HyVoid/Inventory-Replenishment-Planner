# Optimize Inventory Decisions Before Stockouts or Overstock Happen

![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Platform: Browser + Excel](https://img.shields.io/badge/Platform-Browser%20%2B%20Excel-green.svg)
![Tool Type: Inventory Decision Support](https://img.shields.io/badge/Tool-Inventory%20Planning%20%26%20Replenishment-orange.svg)

**A free, no-install inventory planning and replenishment decision framework that transforms historical demand, inventory snapshots, and supplier constraints into actionable replenishment recommendations through Excel or browser-based access.**

> ## **No signup. No installation. Free.**
>
> 🌐 **Open in Browser** → *HTML Live Demo (Coming Soon)*
>
> 📥 **Download Excel** → *Excel Workbook Release / Gumroad Link*
>
> Available in both browser and Excel formats.

---

## Screenshots

### Browser Version

<!-- screenshot: browser version -->

*Interactive inventory planning workspace showing replenishment triggers, inventory risk exposure, and purchasing recommendations.*

### Excel Version

<!-- screenshot: excel version -->

*Multi-sheet analytical workbook implementing demand classification, forecasting, replenishment optimization, and inventory risk monitoring.*

---

## What It Helps You Track

* Which SKUs are likely to stock out before the next replenishment cycle.
* Which inventory positions are consuming working capital without supporting demand.
* Whether current inventory coverage matches actual demand variability.
* How supplier lead times and order constraints affect replenishment decisions.
* Which products require different service levels based on business importance and demand predictability.
* Planned replenishment spend versus inventory risk exposure in one decision workflow.

---

# Why I Built This

Most inventory decisions are not made with bad intentions. They are made with incomplete models.

In many small and mid-sized organizations, replenishment decisions still rely on experience, static min-max rules, ERP default settings, or individual planner judgment. The problem is that inventory risk is rarely caused by a single bad number. It emerges when demand variability, supplier constraints, service targets, and inventory exposure interact in ways that humans cannot reliably evaluate mentally.

I built this workbook after repeatedly seeing the same analytical failure:

> Companies believed they had "enough inventory" because total stock value looked healthy, while individual high-risk SKUs were already entering stockout conditions.

For example:

| Situation | Traditional View                      | This Framework Reveals                                                     |
| --------- | ------------------------------------- | -------------------------------------------------------------------------- |
| SKU A     | 75 days inventory coverage            | Demand volatility requires 95 days coverage due to supplier lead time risk |
| SKU B     | 120 days inventory coverage           | Actual excess inventory equals 68 days of avoidable capital lockup         |
| SKU C     | Current inventory above reorder point | ABC-XYZ classification indicates reorder should already have occurred      |

The decision changes from:

```text
"We still have inventory."
```

to:

```text
"We have inventory, but not enough inventory in the right place,
and too much inventory where demand no longer justifies it."
```

This workbook is not a dashboard.

It is a productized inventory reasoning framework that converts supply chain planning logic, forecasting methods, inventory theory, and replenishment policies into a reusable decision-support tool that can be operated without implementing an enterprise planning system.

---

## Common Inventory Planning Problems This Solves

| Problem                                  | Without This Tool                     | With This Tool                          |
| ---------------------------------------- | ------------------------------------- | --------------------------------------- |
| Replenishment based on planner intuition | Inconsistent purchasing decisions     | Standardized replenishment rules        |
| High inventory but frequent stockouts    | Working capital trapped in wrong SKUs | Inventory risk becomes visible by SKU   |
| One service level for all products       | Overinvestment or poor service        | ABC-XYZ differentiated policies         |
| Static reorder points                    | Failure during demand shifts          | Dynamic forecast-driven reorder points  |
| Supplier MOQ ignored during planning     | Unrealistic purchase recommendations  | Procurement constraints embedded        |
| Overstock recognized too late            | Capital locked for months             | Excess inventory identified proactively |

---

## Who This Is For

This tool is designed for:

* Supply chain planners managing hundreds to thousands of SKUs.
* Purchasing managers responsible for replenishment decisions.
* Inventory analysts supporting working capital optimization.
* Small and mid-sized companies without dedicated APS systems.
* ERP users needing planning capabilities beyond standard MRP outputs.

This tool is **not designed for**:

* Real-time warehouse execution.
* Enterprise ERP replacement.
* Advanced AI demand sensing platforms.
* Multi-echelon optimization requiring specialized APS software.

No spreadsheet expertise is required. Open the browser version and start analyzing inventory decisions immediately.

---

## About

I build lightweight operational decision-support tools for situations where there are too many moving parts to reliably manage in your head.

The question I usually start with is:

> **"What information must exist in one place for the next operational decision to be made confidently?"**

This inventory planning framework is one example of that approach: packaging inventory theory, forecasting logic, replenishment policy design, and operational experience into a reusable analytical system rather than another reporting dashboard.

---

## Technical Details

<details>
<summary>For technical reviewers, Excel practitioners, and collaborators</summary>

---

### Workbook Architecture

| Layer         | Worksheet            | Function                        |
| ------------- | -------------------- | ------------------------------- |
| Configuration | README               | User guide and version control  |
| Configuration | Parameter_Setup      | Global planning parameters      |
| Master Data   | SKU_Master           | SKU and supplier master records |
| Input         | Demand_History       | Historical demand repository    |
| Input         | Inventory_Data       | Current inventory snapshot      |
| Analytics     | Demand_Analysis      | ABC-XYZ classification engine   |
| Analytics     | Forecast_Engine      | Demand forecasting engine       |
| Analytics     | Replenishment_Engine | SS/ROP/SOQ calculation          |
| Monitoring    | Risk_Monitor         | Inventory risk detection        |
| Execution     | Planning_View        | Purchase execution list         |
| Reporting     | Dashboard            | Management dashboard            |

```text
Parameter Setup
        ↓
SKU Master
        ↓
Demand History + Inventory Snapshot
        ↓
Demand Analysis (ABC-XYZ)
        ↓
Forecast Engine
        ↓
Replenishment Engine
        ↓
Risk Monitor + Planning View
        ↓
Dashboard
```

---

### Three Traps That Catch Even Experienced Inventory Planners

#### Trap 1 — "High Inventory Means Low Risk"

| Assumption              | Reality                           |
| ----------------------- | --------------------------------- |
| Inventory value is high | Critical SKUs may still stock out |

Example:

```text
Inventory Value: $2.5M
Management Conclusion:
"We have plenty of inventory."
```

Actual result:

| SKU  | DOS | Lead Time | Status    |
| ---- | --- | --------- | --------- |
| A102 | 12  | 28        | High risk |
| B215 | 145 | 30        | Overstock |
| C887 | 0   | 14        | Stockout  |

The mistake is treating aggregate inventory value as a risk indicator.

Correct approach:

```text
Evaluate inventory by:
- demand variability
- lead time exposure
- service level targets
- inventory coverage
```

<details>
<summary>Formula logic</summary>

```excel
Days_of_Supply =
IF(Daily_Demand=0,
999,
ROUND(On_Hand_Qty/Daily_Demand,0))
```

</details>

---

#### Trap 2 — "All Products Need The Same Service Level"

| Wrong                | Correct                         |
| -------------------- | ------------------------------- |
| One target fill rate | Differentiated service policies |

Example:

```text
95% service level for all SKUs
```

Consequences:

* Excess capital allocation to low-value products.
* Insufficient protection for critical products.

Correct approach:

| Class | Service Target |
| ----- | -------------- |
| AX    | 99%            |
| AY    | 97%            |
| BX    | 95%            |
| CZ    | 80%            |

<details>
<summary>Formula logic</summary>

```excel
Service_Level_Z=
NORMSINV(Target_Service_Level)
```

</details>

---

#### Trap 3 — "Average Demand Represents Future Demand"

Example:

```text
Monthly sales:
20, 21, 19, 22, 150
```

Average:

```text
46.4 units
```

Planner decision:

```text
Increase inventory.
```

Reality:

```text
150 units was a promotion event.
```

Correct approach:

* classify demand variability,
* remove abnormal demand,
* select forecast model dynamically.

<details>
<summary>Formula logic</summary>

```excel
CV=
StDev_Demand/
Average_Demand

IF(CV<=0.2,
Moving Average,
IF(CV<=0.5,
Weighted Average,
Median Smoothing))
```

</details>

---

### Example Scenario

**SKU: VALVE-304-SS**

Input:

| Variable            | Value   |
| ------------------- | ------- |
| Monthly Forecast    | 480     |
| Monthly Std Dev     | 160     |
| Lead Time           | 45 days |
| Service Level       | 95%     |
| Available Inventory | 420     |

Intermediate calculations:

```text
Daily Demand = 16
Daily Std Dev = 29.2
Z = 1.645
```

Safety stock:

```text
SS =
1.645 × 29.2 × √45

SS = 322
```

Reorder point:

```text
ROP =
(16 × 45) + 322

ROP = 1042
```

Result:

| Metric              | Value |
| ------------------- | ----- |
| Available Inventory | 420   |
| Reorder Point       | 1042  |
| Trigger Order       | YES   |
| Suggested Order     | 810   |

Decision implication:

```text
The inventory position appears healthy
in absolute terms,
but is critically underprotected
relative to demand uncertainty
and supplier lead time exposure.
```

---

### Formula Reference

<details>
<summary>Demand Classification</summary>

```excel
CV=
StDev_Monthly/
Avg_Monthly_Demand

XYZ=
IF(CV<=0.2,"X",
IF(CV<=0.5,"Y","Z"))
```

</details>

<details>
<summary>Safety Stock</summary>

```excel
Safety_Stock=
ROUNDUP(
NORMSINV(Service_Level)
*
(Demand_StDev/SQRT(30))
*
SQRT(Lead_Time),
0)
```

</details>

<details>
<summary>Reorder Point</summary>

```excel
ROP=
ROUNDUP(
Daily_Demand*
Lead_Time+
Safety_Stock,
0)
```

</details>

<details>
<summary>Suggested Order Quantity</summary>

```excel
SOQ=
MAX(
MOQ,
CEILING(
Net_Order,
Order_Multiple))
```

</details>

---

### Validation Rules

| Field               | Rule                 | Error Behavior   |
| ------------------- | -------------------- | ---------------- |
| SKU_Code            | Unique mandatory key | Reject duplicate |
| Lead_Time           | ≥0 integer           | Validation error |
| MOQ                 | ≥0 integer           | Validation error |
| Unit_Cost           | ≥0                   | Validation error |
| Service_Level       | 0%-100%              | Reject           |
| Inventory           | ≥0                   | Flag exception   |
| Demand History      | Duplicate detection  | Warning          |
| Forecast            | Outlier check        | Manual review    |
| Supplier Constraint | Multiple check       | Warning          |

</details>

---

## Other Tools in This Series

* **Logistics Operations Control Tower** — Multi-entity customs and transportation operations planning.
* **Field Service Operations Console** — Small team dispatching and operational tracking.
* **Personal + Business Dual Budget System** — Integrated financial planning and cash allocation.
* **Industrial Shaft Calculation Toolkit (DIN 743)** — Engineering calculation and validation framework.

More tools:

* GitHub Profile
* Gumroad Store

---

## License

This project is licensed under the **Apache License 2.0**.

See the LICENSE file for details.
