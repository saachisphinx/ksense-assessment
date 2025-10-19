import express from "express";
import axios from "axios";

const app = express();
const PORT = 4000;

// ====================
// CONFIGURATION
// ====================
const API_KEY = "ak_2f4c204da64032421b0cbae8266b8cd901e061252ca60076";
const BASE_URL = "https://assessment.ksensetech.com/api/patients";

// ====================
// RISK SCORING HELPERS
// ====================

function calculateBloodPressureRisk(bp: string | null): number {
  if (!bp || typeof bp !== "string" || !bp.includes("/")) return 0;

  const [systolicStr, diastolicStr] = bp.split("/");
  const systolic = parseInt(systolicStr);
  const diastolic = parseInt(diastolicStr);

  if (isNaN(systolic) || isNaN(diastolic)) return 0;

  if (systolic >= 140 || diastolic >= 90) return 3; // Stage 2
  if (systolic >= 130 || diastolic >= 80) return 2; // Stage 1
  if (systolic >= 120 && diastolic < 80) return 1;  // Elevated
  return 0; // Normal
}

function calculateTemperatureRisk(temp: number | string | null): number {
  const value = typeof temp === "string" ? parseFloat(temp) : temp;
  if (value == null || isNaN(value)) return 0;

  if (value >= 101.0) return 2; // High fever
  if (value >= 99.6 && value <= 100.9) return 1; // Low fever
  return 0; // Normal
}

function calculateAgeRisk(age: number | string | null): number {
  const value = typeof age === "string" ? parseInt(age) : age;
  if (value == null || isNaN(value)) return 0;

  if (value > 65) return 2; // Over 65
  if (value >= 40 && value <= 65) return 1; // 40–65
  return 0; // Under 40
}

function calculateTotalRisk(patient: any): number {
  return (
    calculateBloodPressureRisk(patient.blood_pressure) +
    calculateTemperatureRisk(patient.temperature) +
    calculateAgeRisk(patient.age)
  );
}

// ====================
// FETCH HELPERS
// ====================

async function fetchWithRetry(
  url: string,
  retries = 5,
  delay = 2000
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url, {
        headers: { "x-api-key": API_KEY },
        timeout: 8000,
      });
      if (res.status === 200) return res.data;
    } catch (err: any) {
      const code = err.response?.status;
      if (code === 429) {
        console.warn(`⚠️ Rate limit hit (attempt ${i + 1}), waiting ${delay}ms...`);
      } else {
        console.warn(`Attempt ${i + 1} failed: ${code || err.message}`);
      }

      // wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 1.5; // exponential backoff
    }
  }
  throw new Error("Failed to fetch data after retries");
}

async function fetchAllPatients(): Promise<any[]> {
  let allPatients: any[] = [];
  let page = 1;
  const MAX_PAGES = 10; // ~50 patients total

  while (page <= MAX_PAGES) {
    try {
      const url = `${BASE_URL}?page=${page}&limit=5`;
      const data = await fetchWithRetry(url);
      if (!data || !data.data || data.data.length === 0) break;
      allPatients = allPatients.concat(data.data);
      console.log(`✅ Page ${page} fetched successfully`);
      page++;
      await new Promise((r) => setTimeout(r, 1500)); // wait between pages
    } catch (err: any) {
      console.error(`❌ Skipping page ${page}: ${err?.message || "Unknown error"}`);
      page++;
    }
  }

  return allPatients;
}

// ====================
// ROUTES
// ====================

//  REQUIRED OUTPUTS: ALERT LISTS
app.get("/patients", async (req, res) => {
  try {
    const patients = await fetchAllPatients();

    const enrichedPatients = patients.map((p: any) => ({
      ...p,
      risk_score: calculateTotalRisk(p),
    }));

    // High-Risk Patients
    const highRiskPatients = enrichedPatients
      .filter((p) => p.risk_score >= 4)
      .map((p) => p.patient_id);

    // Fever Patients
    const feverPatients = enrichedPatients
      .filter((p) => {
        const temp =
          typeof p.temperature === "string"
            ? parseFloat(p.temperature)
            : p.temperature;
        return temp && !isNaN(temp) && temp >= 99.6;
      })
      .map((p) => p.patient_id);

    // Data Quality Issues
    const dataQualityIssues = enrichedPatients
      .filter((p) => {
        const ageInvalid =
          p.age == null || isNaN(parseInt(p.age)) || p.age === "";
        const tempInvalid =
          p.temperature == null ||
          isNaN(parseFloat(p.temperature)) ||
          p.temperature === "";
        const bpInvalid =
          !p.blood_pressure ||
          !p.blood_pressure.includes("/") ||
          isNaN(parseInt(p.blood_pressure.split("/")[0])) ||
          isNaN(parseInt(p.blood_pressure.split("/")[1]));
        return ageInvalid || tempInvalid || bpInvalid;
      })
      .map((p) => p.patient_id);

    const alerts = {
      high_risk_patients: highRiskPatients,
      fever_patients: feverPatients,
      data_quality_issues: dataQualityIssues,
    };

    res.json(alerts);
  } catch (err) {
    console.error("❌ Error generating alert lists:", err);
    res.status(500).json({ error: "Failed to generate alerts" });
  }
});

app.get("/patients/all", async (req, res) => {
  try {
    const patients = await fetchAllPatients();
    const enriched = patients.map((p: any) => ({
      ...p,
      risk_score: calculateTotalRisk(p),
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all patients" });
  }
});

// ====================
// START SERVER
// ====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
