# 🧠 Ksense Technology Assessment
**Mid-Level Full Stack TypeScript Developer Challenge**  
by **Sachi Jagannath Gawai**  

This project implements a patient risk-scoring API built with **TypeScript**, **Express**, and **Axios**.  
It connects to Ksense’s simulated healthcare dataset, processes patient vitals, and computes a **risk score** using medical logic for blood pressure, temperature, and age.  

The API also identifies high-risk and fever patients, flags missing or invalid data, and handles rate-limited paginated requests gracefully.

---

## 🚀 Features
- Fetches paginated patient data from Ksense API  
- Retry and exponential back-off logic for rate limiting  
- Calculates total risk score for each patient  
- Returns alert lists for:  
  - **High-Risk Patients:** risk ≥ 4  
  - **Fever Patients:** temperature ≥ 99.6 °F  
  - **Data Quality Issues:** missing or malformed data  
- Written fully in **TypeScript** with clean modular functions  

---

## 🧩 Tech Stack
| Layer | Technology |
|--------|-------------|
| Backend | Node.js, Express |
| Language | TypeScript |
| HTTP Client | Axios |
| Tooling | Nodemon, ts-node |
| Package Manager | npm |

---

## ⚙️ Setup Instructions

### 1. Clone this repository
```bash
git clone https://github.com/<your-username>/ksense-assessment.git
cd ksense-assessment
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the server
```bash
npm run dev
```

### 4. Expected console output
```
🚀 Server running on http://localhost:4000
✅ Page 1 fetched successfully
✅ Page 2 fetched successfully
...
```

---

## 📡 API Endpoints

### 1️⃣ GET `/patients`
Generates the alert lists required for the assessment.

**Example Response**
```json
{
  "high_risk_patients": ["DEMO012", "DEMO002", "DEMO008"],
  "fever_patients": ["DEMO012", "DEMO008"],
  "data_quality_issues": ["DEMO009"]
}
```

### 2️⃣ GET `/patients/all`
Returns the full dataset with calculated `risk_score`.

**Example Response**
```json
[
  {
    "patient_id": "DEMO012",
    "age": 89,
    "blood_pressure": "180/110",
    "temperature": 103.2,
    "risk_score": 7
  },
  {
    "patient_id": "DEMO008",
    "age": 59,
    "blood_pressure": "125/82",
    "temperature": 102.3,
    "risk_score": 5
  }
]
```

---

## 🧮 Risk Scoring Rules

| Category | Condition | Points |
|-----------|------------|--------|
| **Blood Pressure** | ≥ 140 / ≥ 90 | 3 |
|                   | 130–139 / 80–89 | 2 |
|                   | 120–129 / < 80 | 1 |
|                   | < 120 / < 80 | 0 |
| **Temperature**   | ≥ 101.0 °F | 2 |
|                   | 99.6–100.9 °F | 1 |
|                   | ≤ 99.5 °F | 0 |
| **Age**           | > 65 | 2 |
|                   | 40–65 | 1 |
|                   | < 40 | 0 |

**Total Risk Score = BP + Temperature + Age**

---

## 🧠 Example Calculation

| Patient | BP | Temp | Age | Risk |
|----------|----|------|-----|------|
| Mary | 180/110 | 103.2 | 89 | 7 |
| Jane | 140/90 | 99.2 | 67 | 5 |
| Grace | 125/82 | 102.3 | 59 | 5 |

---

## 🧰 Troubleshooting

| Issue | Solution |
|--------|-----------|
| **Rate limit hit** | Wait 10–15 seconds between runs. The API intentionally throttles frequent calls. |
| **500 Server Error** | Confirm your `x-api-key` is valid. |
| **TypeScript error TS18046** | This project already fixes it by declaring `err` as `any`. |

---

## 🧾 Project Structure
```
ksense-assessment/
│
├── src/
│   └── index.ts            # main application logic
├── package.json            # dependencies & scripts
├── tsconfig.json           # TypeScript compiler settings
└── README.md               # documentation
```

## Output 



---

> “This project was a great opportunity to demonstrate both backend engineering and system reliability skills under real-world API constraints.”

---

![Final Output](img/Final_Output.png)


```
