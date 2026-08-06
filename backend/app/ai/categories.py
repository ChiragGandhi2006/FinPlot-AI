# ==========================================
# Merchant -> category keyword mapping
# ==========================================

# Each entry: list of (keyword, category)
# Keywords are matched against lowercased merchant/source/narration text.
MERCHANT_KEYWORDS = [
    # Food & Dining
    ("restaurant", "Food"), ("cafe", "Food"), ("swiggy", "Food"),
    ("zomato", "Food"), ("domino", "Food"), ("mcdonald", "Food"),
    ("kfc", "Food"), ("starbucks", "Food"), ("food", "Food"),
    ("dining", "Food"), ("grocery", "Food"), ("supermarket", "Food"),
    ("dmart", "Food"), ("bigbasket", "Food"), ("baker", "Food"),
    ("pizza", "Food"), ("chinese", "Food"), ("cafeteria", "Food"),
    # Transportation
    ("uber", "Transportation"), ("ola", "Transportation"),
    ("fuel", "Transportation"), ("petrol", "Transportation"),
    ("diesel", "Transportation"), ("indian oil", "Transportation"),
    ("bharat petroleum", "Transportation"), ("hindustan petroleum", "Transportation"),
    ("metro", "Transportation"), ("bus", "Transportation"),
    ("railway", "Transportation"), ("irctc", "Transportation"),
    ("taxi", "Transportation"), ("parking", "Transportation"),
    ("rapido", "Transportation"), ("vehicle", "Transportation"),
    ("cng", "Transportation"), ("toll", "Transportation"),
    ("redbus", "Transportation"), ("transport", "Transportation"),
    # Shopping
    ("amazon", "Shopping"), ("flipkart", "Shopping"), ("myntra", "Shopping"),
    ("ajio", "Shopping"), ("paytm mall", "Shopping"), ("meesho", "Shopping"),
    ("mall", "Shopping"), ("clothing", "Shopping"), ("footwear", "Shopping"),
    ("apparel", "Shopping"), ("electronics", "Shopping"),
    ("shop", "Shopping"), ("store", "Shopping"),
    # Rent
    ("rent", "Rent"), ("lease", "Rent"), ("property", "Rent"),
    # Bills / Utilities
    ("electricity", "Bills"), ("power", "Bills"), ("water", "Bills"),
    ("gas", "Bills"), ("phone", "Bills"), ("mobile", "Bills"),
    ("recharge", "Bills"), ("jio", "Bills"), ("airtel", "Bills"),
    ("vodafone", "Bills"), ("vi ", "Bills"), ("internet", "Bills"),
    ("wifi", "Bills"), ("broadband", "Bills"), ("bill", "Bills"),
    ("utility", "Bills"), ("dth", "Bills"), ("cable", "Bills"),
    ("postpaid", "Bills"), ("prepaid", "Bills"),
    # Entertainment
    ("movie", "Entertainment"), ("theatre", "Entertainment"),
    ("cinema", "Entertainment"), ("netflix", "Entertainment"),
    ("amazon prime", "Entertainment"), ("prime video", "Entertainment"),
    ("hotstar", "Entertainment"), ("disney", "Entertainment"),
    ("spotify", "Entertainment"), ("youtube", "Entertainment"),
    ("game", "Entertainment"), ("concert", "Entertainment"),
    ("entertain", "Entertainment"), ("bookmyshow", "Entertainment"),
    ("music", "Entertainment"),
    # Healthcare
    ("hospital", "Healthcare"), ("clinic", "Healthcare"),
    ("pharmacy", "Healthcare"), ("medicine", "Healthcare"),
    ("medical", "Healthcare"), ("doctor", "Healthcare"),
    ("apollo", "Healthcare"), ("chemist", "Healthcare"),
    ("health", "Healthcare"), ("dental", "Healthcare"), ("lab", "Healthcare"),
    # Education
    ("school", "Education"), ("college", "Education"), ("book", "Education"),
    ("course", "Education"), ("tuition", "Education"), ("academy", "Education"),
    ("university", "Education"), ("education", "Education"),
    ("stationery", "Education"), ("byjus", "Education"), ("coaching", "Education"),
    ("udemy", "Education"), ("coursera", "Education"),
    # Travel
    ("airline", "Travel"), ("air india", "Travel"), ("indigo", "Travel"),
    ("goair", "Travel"), ("spicejet", "Travel"), ("airbnb", "Travel"),
    ("oyo", "Travel"), ("hotel", "Travel"), ("flight", "Travel"),
    ("travel", "Travel"), ("vacation", "Travel"), ("visa", "Travel"),
    ("make my trip", "Travel"), ("mmt", "Travel"), ("goibibo", "Travel"),
    # Insurance
    ("lic", "Insurance"), ("insurance", "Insurance"), ("premium", "Insurance"),
    ("policybazaar", "Insurance"), ("health insurance", "Insurance"),
    ("life insurance", "Insurance"), ("motor insurance", "Insurance"),
]

DEFAULT_EXPENSE_CATEGORY = "Other"


def infer_expense_category(merchant, fallback=DEFAULT_EXPENSE_CATEGORY):
    """Best-effort category inference from merchant/narration text."""
    text = (merchant or "").lower()
    if not text:
        return fallback
    for keyword, category in MERCHANT_KEYWORDS:
        if keyword in text:
            return category
    return fallback