# Carbon Footprint Accuracy Improvements

## ✅ Implementation Complete

Your GreenLens backend now uses a **3-tier fallback system** for accurate carbon footprint calculations:

1. **Open Food Facts** (Primary) - Uses their `carbon_footprint_from_ingredients` when available
2. **OpenCO2 API** (Secondary) - External API with validated emission factors
3. **Enhanced Calculator** (Fallback) - Improved rule-based calculator with 80+ emission factors

## What Was Improved

### 1. Enhanced Carbon Calculator (`backend/src/lib/carbon-calculator.ts`)

**Expanded Emission Factors:**
- Added 80+ categories (was ~30)
- Includes: seafood, plant-based proteins, beverages, processed foods, oils, etc.
- Based on scientific sources (Poore & Nemecek 2018, Our World in Data)

**Better Category Matching:**
- Hierarchical matching (e.g., "en:beverages,en:soft-drinks,en:cola")
- Ingredient-based matching for better accuracy
- Fuzzy matching with priority system

**NOVA Score Adjustment:**
- Ultra-processed foods (NOVA 4) have +45% emissions
- Accounts for manufacturing energy

**Improved Weight Extraction:**
- Handles "2x250ml", "500g net / 550g gross" formats
- Better unit conversion

### 2. OpenCO2 API Integration (`backend/src/lib/openco2-api.ts`)

**Features:**
- Searches OpenCO2 emission factor database
- Maps product categories to OpenCO2 categories
- Handles unit conversions automatically
- Graceful fallback if API unavailable

**Categories Supported:**
- Food and drink (Meat, Dairy, Vegetables, Grains, Beverages)
- Products
- More can be added as needed

### 3. Fallback Chain (`backend/src/lib/open-food-facts.ts`)

**Priority Order:**
1. Open Food Facts carbon data (if available)
2. OpenCO2 API (if configured and available)
3. Enhanced calculator (always works)

## Setup Instructions

### Step 1: Enhanced Calculator (Already Active)

The enhanced calculator is **already working** - no setup needed! It will be used automatically when:
- Open Food Facts doesn't have carbon data
- OpenCO2 API is not configured or unavailable

### Step 2: OpenCO2 API (Optional but Recommended)

To enable OpenCO2 API for even better accuracy:

1. **Get API Key:**
   - Visit https://www.openco2.net/
   - Sign up for an account
   - Get your API key from the dashboard

2. **Add to Environment:**
   ```bash
   cd backend
   # Edit .env file
   OPENCO2_API_KEY="your-api-key-here"
   ```

3. **Restart Backend:**
   ```bash
   npm run dev
   ```

The system will automatically use OpenCO2 when available, falling back to the enhanced calculator if needed.

## How It Works

### Example Flow:

1. **User scans product** → Barcode lookup
2. **Open Food Facts** → Check for `carbon_footprint_from_ingredients`
   - ✅ **Found**: Use it (most accurate)
   - ❌ **Not found**: Continue to step 3
3. **OpenCO2 API** → Search emission factors by category
   - ✅ **Found**: Use API result
   - ❌ **Not found/Not configured**: Continue to step 4
4. **Enhanced Calculator** → Use rule-based calculation
   - ✅ **Always works**: Uses expanded emission factors

## Accuracy Improvements

### Before:
- ~30 emission factors
- Simple keyword matching
- No processing level consideration
- Basic weight extraction

### After:
- **80+ emission factors** (2.7x more)
- **Hierarchical category matching**
- **NOVA score adjustment** (+0% to +45%)
- **Ingredient-based matching**
- **Better weight extraction**
- **External API integration** (OpenCO2)

## Testing

### Test Enhanced Calculator:
```bash
# Scan any product - enhanced calculator will be used if:
# - Open Food Facts has no carbon data
# - OpenCO2 API not configured
```

### Test OpenCO2 Integration:
```bash
# 1. Add OPENCO2_API_KEY to backend/.env
# 2. Restart backend
# 3. Scan a product without Open Food Facts carbon data
# 4. Check backend logs - should see "Used OpenCO2 API" message
```

## Monitoring

The system logs which calculation method was used:
- `calculationSource = 'open-food-facts'` - Used OFF data
- `calculationSource = 'openco2-api'` - Used OpenCO2 API
- `calculationSource = 'enhanced-calculator'` - Used fallback calculator

Check backend logs to see which method is being used for your products.

## Next Steps (Optional)

1. **Fine-tune OpenCO2 mapping** - Adjust category mappings in `openco2-api.ts` based on your product data
2. **Add more emission factors** - Expand `EMISSION_FACTORS` in `carbon-calculator.ts` as needed
3. **Add caching** - Cache OpenCO2 API results to reduce API calls
4. **User feedback** - Allow users to report inaccurate scores for continuous improvement

## Files Modified

- ✅ `backend/src/lib/carbon-calculator.ts` - Enhanced calculator
- ✅ `backend/src/lib/openco2-api.ts` - New OpenCO2 API client
- ✅ `backend/src/lib/open-food-facts.ts` - Updated fallback chain
- ✅ `backend/.env.example` - Added OPENCO2_API_KEY

## Questions?

- **OpenCO2 API not working?** Check API key is correct and backend logs for errors
- **Still getting inaccurate scores?** The enhanced calculator should be much better, but you can add more emission factors or improve category mappings
- **Want to add another API?** Follow the same pattern as OpenCO2 integration

Your carbon footprint calculations are now significantly more accurate! 🎉
