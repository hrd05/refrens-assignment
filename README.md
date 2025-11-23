
# Invoice Upload Service

This service allows uploading invoice files in **CSV/XLS/XLSX** formats, validates the data, and converts each row into a standardized JSON structure.


-------------------------------------
#   Setup Instructions
-------------------------------------

1. Clone the project
git clone https://github.com/hrd05/refrens-assignment.git

2. Install dependencies
npm install

3. Run the development server
npm run dev

Server will start at:
http://localhost:3000

4. API Endpoint
http://localhost:3000/v1/invoice/create

Request:
- Form-data
- Key: file
- Value: CSV/XLS/XLSX file

----------------------------------------------
#    Validation Rules & JSON structure
----------------------------------------------

1. Below are the required fields expected in the CSV/Exvel file

```json
[
    "Invoice Number",
    "Date",
    "Customer Name",
    "Total Amount",
    "Item Description",
    "Item Quantity",
    "Item Price",
    "Item Total",
]

```

if any required fields are missing -> error is returned

2. Numeric Fields

Fields such as:
Item Quantity
Item Price
Item Total
Total Amount

Must contain valid numeric values, if not -> error is added (Item Price must be a number)

3. Date Validation

Allowed format:

["YYYY-MM-DD", 'DD-MM-YYYY']

The system:
Converts Excel numeric serial dates (e.g., 45321) → valid date
rejects other date formats

4. JSON structure

Each row is transformed into following fomrat
```json
{
    "Invoice Number": "INV-1001",
    "Date": "10-01-2025",
    "Customer Name": "Acme Corp",
    "Total Amount": "150",
    "Item Description": "Product B",
    "Item Quantity": "2",
    "Item Price": "50",
    "Item Total": "100",
    "Errors": ""
}
```

If the row has issues:
```json
{
    "Invoice Number": "INV-1001",
    "Date": "10-01-2025-210",
    "Customer Name": "Acme Corp",
    "Total Amount": "150",
    "Item Description": "Product A",
    "Item Quantity": "1",
    "Item Price": "harsn",
    "Item Total": "1fa",
    "Errors": "Item Price must be numeric; Item Total must be numeric; Invalid date format: 10-01-2025-210"
}

```

-------------------------------------
#   Published Postman API Collection
-------------------------------------
https://documenter.getpostman.com/view/29678206/2sB3dHVYeN