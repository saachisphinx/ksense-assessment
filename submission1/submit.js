const results = {
    "high_risk_patients": [
        "DEMO002",
        "DEMO006",
        "DEMO007",
        "DEMO008",
        "DEMO010",
        "DEMO012",
        "DEMO016",
        "DEMO019",
        "DEMO020",
        "DEMO021",
        "DEMO022",
        "DEMO027",
        "DEMO028",
        "DEMO031",
        "DEMO032",
        "DEMO033",
        "DEMO040",
        "DEMO041",
        "DEMO045",
        "DEMO048"
    ],
    "fever_patients": [
        "DEMO005",
        "DEMO008",
        "DEMO009",
        "DEMO012",
        "DEMO021",
        "DEMO023",
        "DEMO037",
        "DEMO038",
        "DEMO047"
    ],
    "data_quality_issues": [
        "DEMO004",
        "DEMO005",
        "DEMO007",
        "DEMO023",
        "DEMO024",
        "DEMO035",
        "DEMO036",
        "DEMO043"
    ]
    };

fetch("https://assessment.ksensetech.com/api/submit-assessment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "ak_2f4c204da64032421b0cbae8266b8cd901e061252ca60076"
  },
  body: JSON.stringify(results)
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Assessment Results:", data);
  })
  .catch((error) => {
    console.error("Submission failed:", error);
  });
