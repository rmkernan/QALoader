# Topic: Discounted Cash Flow (DCF)

## Subtopic 1: DCF Fundamentals

### Difficulty: Basic

#### Type: GenConcept
**Question:** Walk me through a DCF analysis.
**Brief Answer:** A DCF values a company based on the present value of its projected Free Cash Flows (FCF) and the present value of its Terminal Value. You project FCF for 5-10 years, discount them using WACC, then calculate Terminal Value (Multiples or Gordon Growth), discount it, and sum both to get Enterprise Value.

#### Type: GenConcept
**Question:** What is the core principle behind a DCF valuation?
**Brief Answer:** The value of a business is the present value of its future cash flows.

#### Type: GenConcept
**Question:** Why do you use 5 or 10 years for DCF projections?
**Brief Answer:** This period is generally considered the furthest one can reasonably predict a company's financial performance with a decent level of accuracy; less than 5 years is too short, more than 10 years is too speculative.

#### Type: GenConcept
**Question:** What do you usually use for the discount rate in a DCF?
**Brief Answer:** Weighted Average Cost of Capital (WACC) for an Unlevered DCF (yielding Enterprise Value), or Cost of Equity for a Levered DCF (yielding Equity Value).

#### Type: GenConcept
**Question:** What is Unlevered Free Cash Flow (UFCF)?
**Brief Answer:** Cash flow available to all capital providers (both debt and equity holders) before any debt payments.

#### Type: GenConcept
**Question:** What is Levered Free Cash Flow (LFCF)?
**Brief Answer:** Cash flow available only to equity holders, after all debt obligations (interest and principal repayments) have been met.

#### Type: GenConcept
**Question:** Why do you add back Depreciation and Amortization when calculating Free Cash Flow?
**Brief Answer:** They are non-cash expenses that reduce Net Income but do not represent an actual cash outflow.

#### Type: GenConcept
**Question:** Why do you subtract Capital Expenditures when calculating Free Cash Flow?
**Brief Answer:** CapEx represents cash spent on long-term assets, which is a real cash outflow necessary for the business.

#### Type: Problem
**Question:** How do you get from Revenue to Free Cash Flow in the projections?
**Brief Answer:**
The formula for Unlevered Free Cash Flow (UFCF) starting from Revenue is:
1.  `EBIT = Revenue - Cost of Goods Sold (COGS) - Operating Expenses`
2.  `NOPAT (Net Operating Profit After Tax) = EBIT * (1 - Tax Rate)`
3.  `UFCF = NOPAT + Depreciation & Amortization (D&A) - Capital Expenditures (CapEx) - Change in Net Working Capital`
Alternatively, directly:
`UFCF = (Revenue - COGS - Operating Expenses) * (1 - Tax Rate) + D&A - CapEx - Change in Net Working Capital`

#### Type: Problem
**Question:** What's an alternate way to calculate Free Cash Flow aside from taking Net Income, adding back Depreciation, and subtracting Changes in Operating Assets / Liabilities and CapEx?
**Brief Answer:**
Alternate methods include:
1.  **Unlevered Free Cash Flow (UFCF) from Cash Flow from Operations (CFO):**
    `UFCF = CFO - CapEx + Tax-Adjusted Net Interest Expense`
    Where `Tax-Adjusted Net Interest Expense = (Interest Expense - Interest Income) * (1 - Tax Rate)`. (Note: CFO must be calculated before interest payments for this specific UFCF derivation, or interest paid must be added back and tax shield on interest removed if starting from a CFO that is after interest.)
    A more common derivation from standard CFO (which is after interest expense but before interest income):
    `UFCF = CFO - CapEx + (Interest Expense * (1 - Tax Rate)) - (Interest Income * (1 - Tax Rate))` (if CFO is after tax-effected interest expense and income)
    Or, if CFO is after interest expense but before tax:
    `UFCF = (Cash Flow from Operations before interest and taxes) - Cash Taxes on EBIT - CapEx - Change in NWC`
2.  **Levered Free Cash Flow (LFCF) from Cash Flow from Operations (CFO):**
    `LFCF = CFO - CapEx - Mandatory Debt Repayments`
    (Note: This CFO is typically after interest expense. If CFO is from Net Income, it's `Net Income + D&A - ΔNWC - CapEx - Mandatory Debt Repayments`)
    **Levered Free Cash Flow (LFCF) from Net Income:**
    `LFCF = Net Income + D&A - Change in Net Working Capital - CapEx - Mandatory Debt Repayments + Net Debt Issuance`

### Difficulty: Advanced

#### Type: GenConcept
**Question:** When is a DCF analysis most appropriate?
**Brief Answer:** For mature, stable companies with predictable cash flows, or when valuing a company for which there are no good public comparables or precedent transactions.

#### Type: GenConcept
**Question:** What are the limitations of a DCF analysis?
**Brief Answer:** Highly sensitive to assumptions, relies on accurate long-term projections, and the Terminal Value often accounts for a large portion of the total value.

#### Type: GenConcept
**Question:** What are the advantages of a DCF analysis?
**Brief Answer:** It's an intrinsic valuation method, less influenced by market fluctuations, and allows for detailed scenario analysis.

#### Type: GenConcept
**Question:** What is the "implied perpetual growth rate" in a DCF, and how can you use it as a sanity check?
**Brief Answer:** The growth rate implied by the Terminal Value if it were calculated using the Gordon Growth Model, given the exit multiple. It's a sanity check to ensure the implied growth rate is reasonable (e.g., below GDP growth).
Formula: `Implied Growth Rate (g) = (WACC * TV_ExitMultiple - FCF_n) / (TV_ExitMultiple + FCF_n)` where `TV_ExitMultiple` is Terminal Value from exit multiple method and `FCF_n` is the final year's FCF. Or, more simply, if `TV_ExitMultiple = FCF_n * (1+g) / (WACC-g)`, then rearrange for `g`.

#### Type: GenConcept
**Question:** How does a company's risk profile affect its DCF valuation?
**Brief Answer:** A higher risk profile leads to a higher discount rate (WACC/Cost of Equity), which results in a lower DCF valuation.
`PV = FCF / (1 + WACC)^n`. A higher WACC increases the denominator, lowering PV.

#### Type: Problem
**Question:** How would you handle a company with significant R&D expenses in a DCF?
**Brief Answer:**
R&D is typically expensed as incurred, so it's already factored into EBIT (Earnings Before Interest and Taxes), reducing it.
`EBIT = Revenue - COGS - Operating Expenses (including R&D)`
`FCF = EBIT(1-T) + D&A - CapEx - ΔNWC`
If R&D were to be capitalized (less common under US GAAP, more possible under IFRS if criteria are met):
1.  Remove R&D expense from Operating Expenses (increases EBIT).
2.  Subtract the capitalized R&D amount as an investment (similar to CapEx) in the FCF calculation.
3.  The capitalized R&D asset would then be amortized; this amortization is a non-cash charge added back in FCF calculation (similar to D&A).
The key is consistent treatment and ensuring all cash outflows for R&D are captured, either as an expense reducing EBIT or as a capitalized investment reducing FCF directly.

#### Type: Problem
**Question:** When would a DCF produce a lower valuation than comparable companies?
**Brief Answer:** This is more conceptual but relates to the inputs of the DCF formula. A DCF might produce a lower valuation if:
1.  **Lower Cash Flow Projections:** Your FCF projections (Revenue Growth, Margins, D&A, CapEx, ΔNWC) are more conservative than what's implied by the market for comparables.
    `FCF = EBIT(1-T) + D&A - CapEx - ΔNWC`
2.  **Higher Discount Rate (WACC):** Your WACC is higher due to assumptions about higher risk (Beta, ERP, Cost of Debt) or a different capital structure.
    `WACC = (E/V * Ke) + (D/V * Kd * (1-T))`
3.  **Lower Terminal Value:** Your assumptions for the Terminal Value (either via Gordon Growth Model or Exit Multiple Method) are more conservative.
    `TV_GGM = FCF_n * (1+g) / (WACC-g)`
    `TV_ExitMultiple = Metric_n * Exit Multiple`
    Essentially, if your intrinsic valuation assumptions (cash flows, risk, long-term growth) are more pessimistic than the market's current pricing of comparable companies.

#### Type: Problem
**Question:** What is the implication of a negative WACC?
**Brief Answer:** A negative WACC is theoretically impossible and indicates a significant error in calculation.
The WACC formula is:
`WACC = (E/V * Ke) + (D/V * Kd * (1 - Tax Rate))`
Where `E`=Market Value of Equity, `D`=Market Value of Debt, `V`=E+D, `Ke`=Cost of Equity, `Kd`=Cost of Debt, `T`=Tax Rate.
All components (`Ke`, `Kd`, `(1-T)`, weights `E/V`, `D/V`) are generally expected to be positive. `Ke` (often `Rf + Beta * ERP`) and `Kd` represent expected returns/costs, which investors require to be positive for bearing risk. A negative WACC would imply that investors are willing to pay the company to hold their capital, or that the company generates value from having more risk, which contradicts fundamental financial principles.

#### Type: Problem
**Question:** How do you project non-cash working capital in a DCF?
**Brief Answer:**
Common methods to project Net Working Capital (NWC) components and the Change in NWC (ΔNWC):
1.  **As a Percentage of Revenue:** Project NWC or its individual components (Operating Current Assets - Operating Current Liabilities) as a percentage of Revenue.
    `NWC_t = (% of Revenue) * Revenue_t`
    Then, the cash flow impact is: `ΔNWC_t = NWC_t - NWC_{t-1}` (subtracted in FCF calculation if positive)
2.  **Using Days Ratios (Turnover Ratios):**
    * `Accounts Receivable = (Days Sales Outstanding / 365) * Revenue`
    * `Inventory = (Inventory Days / 365) * COGS`
    * `Accounts Payable = (Days Payable Outstanding / 365) * COGS`
    Then, `NWC = (Accounts Receivable + Inventory) - Accounts Payable`
    And `ΔNWC` is the year-over-year change.

#### Type: Problem
**Question:** How does the level of competition in an industry affect a company's DCF valuation?
**Brief Answer:** Higher competition typically negatively impacts a DCF valuation by:
1.  **Lowering Projected FCFs:**
    `FCF = EBIT(1-T) + D&A - CapEx - ΔNWC`
    Competition can lead to lower revenue growth, reduced pricing power (lower margins, thus lower EBIT), and potentially higher CapEx or R&D to stay competitive, all reducing FCF.
2.  **Increasing WACC:**
    `WACC = (E/V * Ke) + (D/V * Kd * (1-T))`
    Higher competition might be perceived as higher business risk, potentially increasing the Cost of Equity (e.g., via a higher Beta if systematic risk increases) or Cost of Debt.
3.  **Lowering Terminal Value:**
    `TV_GGM = FCF_n * (1+g) / (WACC-g)` or `TV_ExitMultiple = Metric_n * Exit Multiple`
    Sustained high competition might lead to lower long-term growth rate (g) assumptions or lower sustainable exit multiples.

## Subtopic 2: Discount Rate - WACC and Cost of Equity

### Difficulty: Basic

#### Type: GenConcept
**Question:** How do you calculate WACC?
**Brief Answer:** WACC = (Cost of Equity * % Equity) + (Cost of Debt * % Debt * (1 - Tax Rate)) + (Cost of Preferred Stock * % Preferred Stock).
Formula: `WACC = (E/V * Ke) + (D/V * Kd * (1-T)) + (P/V * Kp)`
Where: `E`=Market Value of Equity, `D`=Market Value of Debt, `P`=Market Value of Preferred Stock, `V`=E+D+P (Total Market Value of Capital), `Ke`=Cost of Equity, `Kd`=Cost of Debt, `Kp`=Cost of Preferred Stock, `T`=Corporate Tax Rate.

#### Type: GenConcept
**Question:** How do you calculate the Cost of Equity?
**Brief Answer:** Using the Capital Asset Pricing Model (CAPM): Cost of Equity = Risk-Free Rate + Beta * Equity Risk Premium.
Formula: `Ke = Rf + β * (Rm - Rf)`
Where: `Ke`=Cost of Equity, `Rf`=Risk-Free Rate, `β`=Levered Beta of the stock, `(Rm - Rf)`=Equity Risk Premium (ERP).

#### Type: GenConcept
**Question:** What is the Risk-Free Rate, and what do you typically use for it?
**Brief Answer:** The return on a "risk-less" investment. Typically, the yield on a 10-year or 20-year U.S. Treasury bond.

#### Type: GenConcept
**Question:** What is Beta in the Cost of Equity calculation?
**Brief Answer:** A measure of a company's systematic risk relative to the overall market. A Beta of 1 means the stock moves with the market.

#### Type: GenConcept
**Question:** Why do you have to un-lever and re-lever Beta?
**Brief Answer:** To remove the impact of each comparable company's unique capital structure (un-lever) and then re-introduce the target company's specific capital structure (re-lever), making it an "apples-to-apples" comparison of operating risk.
Unlevered Beta: `βu = βl / (1 + (1-T) * (D/E))`
Relevered Beta: `βl = βu * (1 + (1-T) * (D/E))`

#### Type: GenConcept
**Question:** What is the Equity Risk Premium (ERP)?
**Brief Answer:** The excess return that investors expect for investing in the stock market over a risk-free asset. `ERP = Rm - Rf`.

#### Type: GenConcept
**Question:** What is the Cost of Debt, and how do you estimate it?
**Brief Answer:** The effective interest rate a company pays on its borrowings. You estimate it by looking at current interest rates on similar debt issuances (yield to maturity on existing bonds) or the company's existing debt.

#### Type: GenConcept
**Question:** What is the Cost of Preferred Stock, and how do you estimate it?
**Brief Answer:** The dividend paid on preferred stock divided by its market price (or par value if no market price).
Formula: `Kp = Dp / Pp`
Where: `Kp`=Cost of Preferred Stock, `Dp`=Annual Preferred Dividend, `Pp`=Current Market Price of Preferred Stock.

#### Type: GenConcept
**Question:** What is the "Cost of Capital" and how does it relate to WACC?
**Brief Answer:** Cost of Capital is a broad term for the cost of financing a business. WACC is the most common calculation of a company's overall (weighted average) cost of capital, considering all sources like equity, debt, and preferred stock.

#### Type: Problem
**Question:** How do you get to Beta in the Cost of Equity calculation for your target company?
**Brief Answer:**
1.  **Find Comparable Public Companies.**
2.  **Obtain Levered Betas (βl) for these comparables.** (From financial data providers like Bloomberg, Refinitiv).
3.  **Un-lever each comparable's Beta** to remove the effect of its capital structure:
    `Unlevered Beta (βu) = Levered Beta (βl) / (1 + (1 - Tax Rate_comparable) * (Debt/Equity Ratio_comparable))`
4.  **Take the Median (or Average) of the Unlevered Betas.** This represents the "pure" business risk.
5.  **Re-lever this Median Unlevered Beta** using the target company's specific capital structure and tax rate:
    `Target Levered Beta (βl_target) = Median βu * (1 + (1 - Target Tax Rate) * (Target Debt/Equity Ratio))`

#### Type: Problem
**Question:** Would you expect a manufacturing company or a technology company to have a higher Beta? Why?
**Brief Answer:** Generally, a technology company would be expected to have a higher Beta.
Beta (β) in the CAPM formula (`Ke = Rf + β * ERP`) measures systematic risk, which is non-diversifiable market risk.
Technology companies often exhibit:
* Higher growth volatility and more uncertainty in future cash flows.
* Greater sensitivity to economic cycles and changes in investor sentiment regarding growth prospects.
* Faster product obsolescence and more intense, disruptive competition.
These factors contribute to higher systematic risk compared to more stable, mature manufacturing companies, thus leading to a higher Beta.

#### Type: Problem
**Question:** Two companies are exactly the same, but one has debt and one does not – which one will have the higher WACC? Why?
**Brief Answer:** The company **without debt** will generally have the higher WACC, assuming the company with debt is not over-levered to the point of financial distress.
The WACC formula is:
`WACC = (Equity / Total Value * Cost of Equity) + (Debt / Total Value * Cost of Debt * (1 - Tax Rate))`
Key reasons:
1.  **Cost of Debt is typically lower than Cost of Equity (`Kd < Ke`).** Debt holders have a priority claim on assets and earnings.
2.  **Interest on debt is tax-deductible:** This creates a "tax shield," reducing the effective cost of debt to `Kd * (1 - Tax Rate)`.
For the all-equity firm: `WACC_NoDebt = Cost of Equity (Ke)`
For the firm with debt: `WACC_WithDebt` includes the cheaper, tax-shielded debt component, which usually pulls the average cost down.
However, if debt levels become excessively high, the risk of financial distress increases, causing both `Kd` and `Ke` to rise, which can eventually make WACC increase.

#### Type: Problem
**Question:** What's the relationship between debt and Cost of Equity?
**Brief Answer:** As a company takes on more debt (increases its leverage), its Cost of Equity (`Ke`) tends to increase, all else being equal.
This is because higher leverage increases the financial risk for equity holders:
* Debt holders have a prior claim on earnings and assets.
* Higher debt means higher fixed interest payments, making earnings available to equity holders more volatile.
* Increased risk of financial distress or bankruptcy.
The CAPM formula for Cost of Equity (`Ke = Rf + β * ERP`) reflects this, as the company's Levered Beta (βl) increases with higher D/E ratios:
`βl = βu * (1 + (1-T) * (D/E))`
A higher `βl` leads to a higher `Ke`.

#### Type: Problem
**Question:** Cost of Equity tells us what kind of return an equity investor can expect – but what about dividends? Shouldn’t we factor dividend yield into the formula?
**Brief Answer:** No, dividend yields are already implicitly factored into the Cost of Equity (`Ke`) calculation when using the CAPM.
The CAPM formula is: `Ke = Rf + β * (Rm - Rf)`
* **Beta (β)** is typically calculated using historical stock price movements, which reflect total returns to shareholders (capital appreciation + dividends). Market returns (`Rm`) also reflect total returns.
* Therefore, the expected return (`Ke`) derived from CAPM already incorporates the component of return that comes from dividends.
An alternative model, the Dividend Discount Model (DDM) or Gordon Growth Model for Cost of Equity, directly uses dividends:
`Ke = (D1 / P0) + g`
Where `D1/P0` is the dividend yield and `g` is the dividend growth rate. This model is more appropriate for mature, stable, dividend-paying companies. CAPM is more broadly applicable.

### Difficulty: Advanced

#### Type: GenConcept
**Question:** How can we calculate Cost of Equity WITHOUT using CAPM?
**Brief Answer:** Cost of Equity = (Dividends per Share / Current Share Price) + Growth Rate of Dividends. (Less common, used for dividend-paying companies).
Formula (Dividend Discount Model / Gordon Growth Model approach):
`Ke = (D1 / P0) + g`
Where: `Ke`=Cost of Equity, `D1`=Expected Dividend per Share next year, `P0`=Current Share Price, `g`=Constant Growth Rate of Dividends.
Other less common methods include bond yield plus risk premium (`Ke = Company's Bond Yield + Risk Premium`).

#### Type: GenConcept
**Question:** How do you calculate WACC for a private company?
**Brief Answer:** This is problematic as private companies lack market caps and Betas. You would typically estimate WACC based on comparable public companies' WACC or rely on auditor/valuation specialist estimates. The approach involves using proxy data:
1.  **Cost of Equity (Ke):**
    * Find comparable public companies.
    * Unlever their Betas: `βu = βl / (1 + (1-T) * (D/E))`
    * Take the median `βu`.
    * Relever `βu` using the private company's target D/E ratio and estimated tax rate: `βl_private = βu * (1 + (1-T_private) * (D/E_private))`
    * Calculate `Ke_private = Rf + βl_private * ERP`. May add a size premium or specific company risk premium.
2.  **Cost of Debt (Kd):** Estimate based on its credit profile, recent borrowings, or yields on debt of comparable private/public companies.
3.  **Capital Structure Weights (E/V, D/V):** Use target D/E ratio or average D/E of comparables. Market values are preferred but often book values are used for private firms due to lack of market data.
4.  **Tax Rate:** Use effective tax rate or marginal tax rate.

#### Type: GenConcept
**Question:** What is the "equity risk premium" and where do you get it from?
**Brief Answer:** The expected return on the market portfolio minus the risk-free rate. Often sourced from academic studies or financial publications like Ibbotson's (now Duff & Phelps).
`ERP = Rm - Rf`

#### Type: GenConcept
**Question:** What is the impact of including a "size premium" in the Cost of Equity calculation?
**Brief Answer:** A size premium increases the Cost of Equity (and thus WACC), leading to a higher discount rate and a lower DCF valuation, reflecting the higher risk associated with smaller companies.
Modified CAPM: `Ke = Rf + β * ERP + Size Premium`

#### Type: GenConcept
**Question:** Discuss the trade-off between using more debt vs. equity in a company's capital structure in the context of WACC.
**Brief Answer:** Debt is generally cheaper than equity (tax-deductible interest). Increasing debt initially lowers WACC. However, too much debt increases financial risk (higher `Kd` and higher `Ke` due to increased `βl`), eventually increasing WACC. There's an optimal capital structure that minimizes WACC.
`WACC = (E/V * Ke) + (D/V * Kd * (1-T))`

#### Type: GenConcept
**Question:** Explain how the "market value" vs. "book value" of debt and equity are used in the WACC calculation.
**Brief Answer:** Market values should theoretically be used for both debt and equity weights in WACC to reflect current capital structure.
`WACC = (E_market/V_market * Ke) + (D_market/V_market * Kd * (1-T))`
Equity: Market value (Market Cap) is readily available for public companies.
Debt: Market value is preferred but often harder to obtain if debt is not publicly traded. Book value of debt is often used as an approximation, especially if interest rates haven't changed significantly since issuance or if debt is short-term/floating rate.

#### Type: Problem
**Question:** If a company's Cost of Equity is 12%, Cost of Debt is 5%, Tax Rate is 30%, and its capital structure is 70% Equity, 30% Debt, what is its WACC?
**Brief Answer:**
The formula for WACC is:
`WACC = (E/V * Ke) + (D/V * Kd * (1 - Tax Rate))`
Given:
* Cost of Equity (Ke) = 12% = 0.12
* Cost of Debt (Kd) = 5% = 0.05
* Tax Rate (T) = 30% = 0.30
* Equity Weight (E/V) = 70% = 0.70
* Debt Weight (D/V) = 30% = 0.30
Calculation:
`WACC = (0.70 * 0.12) + (0.30 * 0.05 * (1 - 0.30))`
`WACC = 0.084 + (0.30 * 0.05 * 0.70)`
`WACC = 0.084 + (0.015 * 0.70)`
`WACC = 0.084 + 0.0105`
`WACC = 0.0945` or **9.45%**

#### Type: Problem
**Question:** A company has a Levered Beta of 1.2, a tax rate of 25%, and a Debt/Equity ratio of 0.5. What is its Unlevered Beta?
**Brief Answer:**
The formula to unlever Beta is:
`Unlevered Beta (βu) = Levered Beta (βl) / (1 + ((1 - Tax Rate) * (Debt/Equity Ratio)))`
Given:
* Levered Beta (βl) = 1.2
* Tax Rate (T) = 25% = 0.25
* Debt/Equity Ratio (D/E) = 0.5
Calculation:
`βu = 1.2 / (1 + ((1 - 0.25) * 0.5))`
`βu = 1.2 / (1 + (0.75 * 0.5))`
`βu = 1.2 / (1 + 0.375)`
`βu = 1.2 / 1.375`
`βu ≈ 0.8727` or **~0.87**

#### Type: Problem
**Question:** If the risk-free rate increases, how does this impact a company's WACC, all else being equal?
**Brief Answer:** An increase in the risk-free rate (`Rf`) will directly increase the Cost of Equity (`Ke`) and potentially the Cost of Debt (`Kd`), leading to a higher WACC.
1.  **Impact on Cost of Equity (Ke):**
    `Ke = Rf + β * (Rm - Rf)`
    If `Rf` increases, `Ke` increases directly.
2.  **Impact on Cost of Debt (Kd):**
    The Cost of Debt is often benchmarked against risk-free rates (e.g., `Kd = Rf + Credit Spread`). If `Rf` increases, `Kd` is likely to increase.
3.  **Impact on WACC:**
    `WACC = (E/V * Ke) + (D/V * Kd * (1-T))`
    Since both `Ke` and `Kd` increase, and all other components are positive, WACC will increase.

#### Type: Problem
**Question:** A company has a Beta of 1.5. If the market is expected to return 10% and the risk-free rate is 3%, what is its Cost of Equity?
**Brief Answer:**
The formula for Cost of Equity (Ke) using CAPM is:
`Ke = Risk-Free Rate (Rf) + Beta (β) * (Expected Market Return (Rm) - Risk-Free Rate (Rf))`
This is also written as: `Ke = Rf + β * Equity Risk Premium (ERP)`
Given:
* Beta (β) = 1.5
* Expected Market Return (Rm) = 10% = 0.10
* Risk-Free Rate (Rf) = 3% = 0.03
Calculation:
`Ke = 0.03 + 1.5 * (0.10 - 0.03)`
`Ke = 0.03 + 1.5 * (0.07)`
`Ke = 0.03 + 0.105`
`Ke = 0.135` or **13.5%**

#### Type: Problem
**Question:** How would a significant increase in a company's credit spread impact its WACC?
**Brief Answer:** A significant increase in a company's credit spread would increase its Cost of Debt (`Kd`), which in turn would lead to a higher WACC, all else being equal.
1.  **Cost of Debt (Kd):**
    `Kd = Risk-Free Rate (Rf) + Credit Spread`
    If the credit spread increases, `Kd` increases.
2.  **WACC:**
    `WACC = (E/V * Ke) + (D/V * Kd * (1-T))`
    An increase in `Kd` (Cost of Debt) directly increases the debt component of WACC, thus increasing the overall WACC. This reflects the higher risk perceived by debt investors for that company.

## Subtopic 3: Terminal Value

### Difficulty: Basic

#### Type: GenConcept
**Question:** How do you calculate the Terminal Value (TV) in a DCF?
**Brief Answer:** Using either the Multiples Method (applying an exit multiple to a final year metric like EBITDA) or the Gordon Growth Method (assuming a perpetual growth rate).
Multiples Method: `TV = Final Year Metric (e.g., EBITDA_n, EBIT_n) * Exit Multiple`
Gordon Growth Method: `TV = FCF_n * (1 + g) / (WACC - g)`

#### Type: GenConcept
**Question:** What is the formula for Terminal Value using the Gordon Growth Method?
**Brief Answer:** TV = (Final Year FCF * (1 + Growth Rate)) / (Discount Rate - Growth Rate).
Formula: `TV = FCF_{n+1} / (WACC - g)` or `TV = FCF_n * (1 + g) / (WACC - g)`
Where: `FCF_n`=Free Cash Flow in the final year of the explicit projection period, `FCF_{n+1}`=Free Cash Flow in the first year after the explicit projection period, `g`=Perpetual Growth Rate of FCF, `WACC`=Weighted Average Cost of Capital.

#### Type: GenConcept
**Question:** What's an appropriate growth rate to use when calculating the Terminal Value with the Gordon Growth Method?
**Brief Answer:** A conservative rate, typically the country's long-term GDP growth rate, the rate of inflation, or something less than 5% for developed economies. It must be less than the discount rate (WACC).

#### Type: GenConcept
**Question:** How do you select the appropriate exit multiple when calculating Terminal Value?
**Brief Answer:** Look at comparable public companies and select the median multiple, or a range around it, for the relevant metric (e.g., EV/EBITDA, EV/EBIT). Also consider precedent transaction multiples.

#### Type: GenConcept
**Question:** What's the flaw with basing terminal multiples on what public company comparables are trading at?
**Brief Answer:** Median multiples may change significantly in 5-10 years, making the assumption inaccurate. This is especially problematic in cyclical industries or if the current market is over/undervalued.

#### Type: GenConcept
**Question:** How do you know if your DCF is too dependent on future assumptions?
**Brief Answer:** If a significantly high percentage (e.g., 70-80%+) of the company's Enterprise Value comes from its Terminal Value, it's overly reliant on future assumptions.
`% TV = Present Value of Terminal Value / Total Enterprise Value`

#### Type: GenConcept
**Question:** What is the impact of a higher terminal growth rate assumption on a DCF valuation?
**Brief Answer:** A higher terminal growth rate significantly increases the Terminal Value and thus the overall DCF valuation.
`TV = FCF_n * (1 + g) / (WACC - g)`. As `g` increases, TV increases.

#### Type: GenConcept
**Question:** What is the impact of a higher exit multiple assumption on a DCF valuation?
**Brief Answer:** A higher exit multiple directly increases the Terminal Value and thus the overall DCF valuation.
`TV = Metric_n * Exit Multiple`. As Exit Multiple increases, TV increases.

#### Type: Problem
**Question:** Calculate the Terminal Value using the Gordon Growth Model if the Year 5 FCF is $50M, growth rate is 2%, and discount rate is 10%.
**Brief Answer:**
The formula for Terminal Value (TV) using the Gordon Growth Model is:
`TV = FCF_n * (1 + g) / (WACC - g)`
Where:
* `FCF_n` (Year 5 FCF) = $50M
* `g` (growth rate) = 2% = 0.02
* `WACC` (discount rate) = 10% = 0.10
Calculation:
`TV = $50M * (1 + 0.02) / (0.10 - 0.02)`
`TV = $50M * (1.02) / (0.08)`
`TV = $51M / 0.08`
`TV = $637.5M`

#### Type: Problem
**Question:** If the median EV/EBITDA for comparable companies is 8x and your company's Year 5 projected EBITDA is $120M, what is its Terminal Value using the Multiples Method?
**Brief Answer:**
The formula for Terminal Value (TV) using the Multiples Method is:
`TV = Projected Metric_n * Exit Multiple`
Given:
* Projected Year 5 EBITDA (`Metric_n`) = $120M
* Median EV/EBITDA Exit Multiple = 8x
Calculation:
`TV = $120M * 8`
`TV = $960M`

### Difficulty: Advanced

#### Type: GenConcept
**Question:** Why would you use Gordon Growth rather than the Multiples Method to calculate Terminal Value?
**Brief Answer:** If there are no good comparable companies, or if you believe industry multiples will change significantly in the future (e.g., highly cyclical industries), or if you want an intrinsic check on exit multiples.

#### Type: GenConcept
**Question:** Which method of calculating Terminal Value (Multiples vs. Gordon Growth) will generally give you a higher valuation?
**Brief Answer:** It's hard to generalize as both are highly assumption-dependent. The Multiples Method tends to be more variable due to wider ranges in market multiples and can be influenced by current market sentiment. Gordon Growth is very sensitive to the `(WACC - g)` spread.

#### Type: GenConcept
**Question:** What is the relationship between the terminal growth rate and the country's GDP growth rate?
**Brief Answer:** The terminal growth rate (`g`) in the Gordon Growth Model should generally not exceed the country's long-term nominal GDP growth rate, as a company cannot sustainably grow faster than the overall economy indefinitely.

#### Type: GenConcept
**Question:** When would you use a "zero-growth" terminal value in a DCF?
**Brief Answer:** For companies expected to have no long-term growth (e.g., a company in a declining industry or one that will only reinvest enough to maintain existing FCF), or as a very conservative valuation assumption. In this case, `g = 0` in the Gordon Growth Model: `TV = FCF_n / WACC`.

#### Type: GenConcept
**Question:** What is the "implied exit multiple" in a DCF, and how can it be used as a sanity check?
**Brief Answer:** The multiple implied by the Terminal Value calculated using the Gordon Growth Model. It's a sanity check to see if the implied multiple is reasonable compared to current market multiples.
Formula: If `TV_GGM = FCF_n * (1+g) / (WACC-g)`, then `Implied Exit Multiple = TV_GGM / Metric_n` (e.g., `Metric_n` could be EBITDA_n or EBIT_n).

#### Type: Problem
**Question:** If your DCF's Terminal Value accounts for 90% of the total Enterprise Value, what does this suggest about your model?
**Brief Answer:** This suggests the model is overly reliant on future assumptions, particularly the inputs for the Terminal Value (i.e., the perpetual growth rate `g` or the exit multiple).
The calculation is: `% TV Contribution = (Present Value of Terminal Value) / (Total Enterprise Value)`
A high percentage (e.g., >75-80%) means that the bulk of the company's value is derived from cash flows far into the future, making the valuation very sensitive to small changes in terminal assumptions and less dependent on the explicit forecast period's detailed projections. This can reduce the robustness and credibility of the valuation.

#### Type: Problem
**Question:** How does the terminal value calculation change when we use the mid-year convention?
**Brief Answer:**
The mid-year convention primarily affects how Present Values are calculated, not the Terminal Value calculation itself, but how the TV is discounted.
* **Terminal Value (Exit Multiple Method):** `TV = Metric_n * Exit Multiple`. This calculation is unchanged.
* **Terminal Value (Gordon Growth Method):** `TV_n = FCF_n * (1 + g) / (WACC - g)`. This TV is as of the end of year `n`.
When discounting this `TV_n` back to the present under mid-year convention for the explicit FCFs:
If FCFs are discounted using periods like 0.5, 1.5, ..., n-0.5, then the TV (which occurs at the end of year `n`) is typically discounted using `n` as the period, not `n-0.5`.
Alternatively, if TV is calculated as `FCF_{n+1} / (WACC-g)`, this `TV` is as of the *beginning* of year `n+1` (i.e., end of year `n`). It's then discounted back `n` full periods.
The key is consistency: if explicit FCFs are at mid-points, the TV (which is an end-of-period concept for year `n`) is discounted using the full period `n`.
Some practitioners might calculate TV based on `FCF_{n+0.5}` if using a strict mid-year application to the TV itself, but it's less common. The standard is to calculate TV at year `n` and discount it `n` periods.

#### Type: Problem
**Question:** If your explicit forecast period is 7 years, and you use the Gordon Growth Model for Terminal Value, what discount period would you use to discount the TV back to the present?
**Brief Answer:**
The Terminal Value (TV) calculated using the Gordon Growth Model (`TV = FCF_7 * (1+g) / (WACC-g)`) represents the value of all cash flows beyond Year 7, as of the *end of Year 7*.
Therefore, to discount this TV back to the present (Year 0), you would use **7 periods**.
The Present Value of TV formula would be:
`PV(TV) = TV_Year7 / (1 + WACC)^7`
This is assuming end-of-period discounting for the TV. If mid-year convention is applied to the explicit FCFs (discounted at 0.5, 1.5, ... 6.5), the TV calculated at the end of year 7 is still discounted 7 full years.
