const fileInput = document.getElementById("csvFile");
const keepColumns = [
  "Date",
  "LocalTime",
  "Phase",
  "TrialNumber",
  "Step",
  "Stage",
  "Context",
  "leftEyePupilSize",
  "rightEyePupilSize",
  "GameObjectInFocus",
];
let BaselineAVG = 0;

fileInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  const baselineCheckbox = document.getElementById("BaselineCheckbox");
  const baselineIsChecked = baselineCheckbox.checked;

  reader.onload = function (event) {
    let text = event.target.result;
    let rows = text.split("\n").map((r) => r.split(","));
    const headerRow = rows[0];
    const colIndexesToKeep = headerRow
      .map((col, idx) => (keepColumns.includes(col.trim()) ? idx : -1))
      .filter((idx) => idx !== -1);
    const filteredRows = rows.map((row) =>
      colIndexesToKeep.map((idx) => row[idx] || "")
    );

    filteredRows[0].splice(9, 0, "avgPupilSize");
    filteredRows[0].splice(10, 0, "BaselineCorrectedPupilSize");

    const stageIndex = keepColumns.indexOf("Stage");
    const phaseIndex = keepColumns.indexOf("Phase");
    const trialIndex = keepColumns.indexOf("TrialNumber");
    const goiIndex = keepColumns.indexOf("GameObjectInFocus");
    const leftPupilIndex = keepColumns.indexOf("leftEyePupilSize");
    const rightPupilIndex = keepColumns.indexOf("rightEyePupilSize");
    const Context = keepColumns.indexOf("Context");
    const uniqueChars = new Set();
    let avgTrialPupilSize = [];
    let avgTrialBaseLinePupilSize = [];
    let GOI = [];

    let baselineSamples = [];

    for (let i = 1; i < filteredRows.length; i++) {
      const row = filteredRows[i];
      const stage = (row[stageIndex] || "").trim();

      if (
        stage === "InstructionPhase" ||
        (stage === "Instruction" && baselineIsChecked)
      ) {
        const L = parseFloat(row[leftPupilIndex]);
        const R = parseFloat(row[rightPupilIndex]);
        console.log("Instruction phase pupil sizes:", L, R);

        if (!isNaN(L) && !isNaN(R)) baselineSamples.push((L + R) / 2);
        else if (!isNaN(L)) baselineSamples.push(L);
        else if (!isNaN(R)) baselineSamples.push(R);
      }
    }

    if (baselineSamples.length > 0 && baselineIsChecked) {
      BaselineAVG =
        baselineSamples.reduce((a, b) => a + b, 0) / baselineSamples.length;
      console.log("Initial Baseline AVG set to:", BaselineAVG);
    }

    const finalRows = [filteredRows[0]];
    let lastKept = null;

    for (let i = 1; i < filteredRows.length; i++) {
      const row = filteredRows[i];
      const stage = (row[stageIndex] || "").trim();
      const Phase = (row[phaseIndex] || "").trim();
      const Trial = (row[trialIndex] || "").trim();

      if (stage === "InterTrial" || stage === "InstructionPhase") {
        lastKept = null;
        continue;
      }

      // Skip Baseline stages if checkbox is unchecked
      if (!baselineIsChecked && stage.includes("Baseline")) {
        lastKept = null;
        continue;
      }

      if (lastKept === null && finalRows.length - 1 !== 0) {
        const emptyRow = new Array(row.length).fill("");

        for (let j = finalRows.length - 1; j >= 1; j--) {
          const prevAVGRow = finalRows[j][9];
          const prevBaseLineCorrected = finalRows[j][10];
          const prevGOI = finalRows[j][goiIndex + 2]; // Always +2 because both columns exist
          const prevContext = finalRows[j][Context];

          const prevStage = (finalRows[j][stageIndex] || "").trim();

          if (
            String(prevContext).trim() === "" ||
            prevStage.includes("Baseline")
          )
            break;

          avgTrialPupilSize.push(parseFloat(prevAVGRow));
          if (baselineIsChecked)
            avgTrialBaseLinePupilSize.push(parseFloat(prevBaseLineCorrected));

          GOI.push(prevGOI);
        }

        let trialStage = "";
        for (let j = finalRows.length - 3; j >= 0; j--) {
          const stageCandidate = (finalRows[j][stageIndex] || "").trim();
          if (stageCandidate && stageCandidate !== "US") {
            trialStage = stageCandidate[0];
            break;
          }
        }

        let trialAvg = "";
        let avgTrialBaseLine = "";
        let CountGOI = 0;

        const validSizes = avgTrialPupilSize.filter((size) => !isNaN(size));
        if (validSizes.length > 0) {
          const sum = validSizes.reduce((a, b) => a + b, 0);
          trialAvg = sum / validSizes.length;
        }

        const validBaseLine = avgTrialBaseLinePupilSize.filter(
          (size) => !isNaN(size)
        );
        if (validBaseLine.length > 0 && baselineIsChecked) {
          const sum = validBaseLine.reduce((a, b) => a + b, 0);
          avgTrialBaseLine = sum / validBaseLine.length;
        }

        GOI = GOI.filter(
          (x) =>
            x !== "" &&
            x !== "\r" &&
            x !== null &&
            x !== undefined &&
            !Number.isNaN(x)
        );
        for (let k = 0; k < GOI.length; k++) {
          GOI[k] = GOI[k][0];
          if (GOI[k] === trialStage) {
            CountGOI += 1;
          }
        }

        CountGOI = CountGOI / GOI.length;

        emptyRow.splice(goiIndex, 0, CountGOI);
        emptyRow.splice(9, 0, trialAvg);
        emptyRow.splice(10, 0, avgTrialBaseLine);
        finalRows.push(emptyRow);
        GOI = [];
        avgTrialPupilSize = [];
        avgTrialBaseLinePupilSize = [];
      }

      let currentStage = (row[stageIndex] || "").trim();

      if (i > 1) {
        let prevStage = (filteredRows[i - 1][stageIndex] || "").trim();
        const emptyRow = new Array(row.length).fill("");

        if (
          prevStage.includes("Baseline") &&
          !currentStage.includes("Baseline") &&
          baselineIsChecked
        ) {
          console.log("SWITCH DETECTED at row", i, "→", currentStage);

          for (let j = finalRows.length - 1; j >= 1; j--) {
            const prevAVGRow = finalRows[j][9];
            const prevContext = finalRows[j][Context];
            const prevStageInFinal = (finalRows[j][stageIndex] || "").trim();

            if (
              String(prevContext).trim() === "" ||
              !prevStageInFinal.includes("Baseline")
            )
              break;

            avgTrialPupilSize.push(parseFloat(prevAVGRow));
          }

          const validSizes = avgTrialPupilSize.filter((size) => !isNaN(size));
          if (validSizes.length > 0) {
            const sum = validSizes.reduce((a, b) => a + b, 0);
            BaselineAVG = sum / validSizes.length;
            console.log("Updated Baseline AVG to:", BaselineAVG);
          }

          emptyRow.splice(goiIndex, 0, "");
          emptyRow.splice(9, 0, "");
          emptyRow.splice(10, 0, BaselineAVG);
          finalRows.push(emptyRow);
          avgTrialPupilSize = [];
        }
      }

      if ((row[goiIndex] || "").trim().toLowerCase() === "invalidgaze") {
        row[goiIndex] = "";
      }

      const textToScan = row[Context] || "";
      uniqueChars.add(textToScan);

      const leftPupil = parseFloat(row[leftPupilIndex]);
      const rightPupil = parseFloat(row[rightPupilIndex]);
      let avgPupil = "";
      let BaselineCorrected = "";

      if (!currentStage.includes("Baseline") && baselineIsChecked) {
        if (!isNaN(leftPupil) && !isNaN(rightPupil)) {
          BaselineCorrected = (leftPupil + rightPupil) / 2 - BaselineAVG;
        } else if (!isNaN(leftPupil)) {
          BaselineCorrected = leftPupil - BaselineAVG;
        } else if (!isNaN(rightPupil)) {
          BaselineCorrected = rightPupil - BaselineAVG;
        } else {
          BaselineCorrected = "";
        }
      }

      if (!isNaN(leftPupil) && !isNaN(rightPupil)) {
        avgPupil = (leftPupil + rightPupil) / 2;
      } else if (!isNaN(leftPupil)) {
        avgPupil = leftPupil;
      } else if (!isNaN(rightPupil)) {
        avgPupil = rightPupil;
      } else {
        avgPupil = "";
      }

      row.splice(9, 0, avgPupil);
      row.splice(10, 0, BaselineCorrected);
      finalRows.push(row);
      lastKept = row;
    }

    console.log("Finalizing last trial average calculation");
    const emptyRow = new Array(filteredRows[0].length).fill("");

    for (let j = finalRows.length - 1; j >= 1; j--) {
      const prevAVGRow = finalRows[j][9];
      const prevBaseLineCorrected = finalRows[j][10];
      const prevGOI = finalRows[j][goiIndex + 2];
      const prevContext = finalRows[j][Context];

      const prevStage = (finalRows[j][stageIndex] || "").trim();

      if (String(prevContext).trim() === "" || prevStage.includes("Baseline"))
        break;

      avgTrialPupilSize.push(parseFloat(prevAVGRow));
      if (baselineIsChecked)
        avgTrialBaseLinePupilSize.push(parseFloat(prevBaseLineCorrected));
      GOI.push(prevGOI);
    }

    let trialStage = "";
    for (let j = finalRows.length - 3; j >= 0; j--) {
      const stageCandidate = (finalRows[j][stageIndex] || "").trim();
      if (stageCandidate && stageCandidate !== "US") {
        trialStage = stageCandidate[0];
        break;
      }
    }

    let trialAvg = "";
    let avgTrialBaseLine = "";
    let CountGOI = 0;

    const validSizes = avgTrialPupilSize.filter((size) => !isNaN(size));
    if (validSizes.length > 0) {
      const sum = validSizes.reduce((a, b) => a + b, 0);
      trialAvg = sum / validSizes.length;
    }

    const validBaseLine = avgTrialBaseLinePupilSize.filter(
      (size) => !isNaN(size)
    );
    if (validBaseLine.length > 0 && baselineIsChecked) {
      const sum = validBaseLine.reduce((a, b) => a + b, 0);
      avgTrialBaseLine = sum / validBaseLine.length;
    }

    GOI = GOI.filter(
      (x) =>
        x !== "" &&
        x !== "\r" &&
        x !== null &&
        x !== undefined &&
        !Number.isNaN(x)
    );
    for (let k = 0; k < GOI.length; k++) {
      GOI[k] = GOI[k][0];
      if (GOI[k] === trialStage) {
        CountGOI += 1;
      }
    }

    CountGOI = CountGOI / GOI.length;

    emptyRow.splice(goiIndex, 0, CountGOI);
    emptyRow.splice(9, 0, trialAvg);
    emptyRow.splice(10, 0, avgTrialBaseLine);
    finalRows.push(emptyRow);
    GOI = [];
    avgTrialPupilSize = [];
    avgTrialBaseLinePupilSize = [];

    // Determine context type
    const uniqueArray = Array.from(uniqueChars);
    ContextType = uniqueArray.join("");
    if (ContextType.length <= 1) {
      ContextType = "AAA";
    } else {
      ContextType = "ABA";
    }

    // Determine hardware type
    Hardware = "";
    if (
      headerRow.includes("rightEyeRotationY") ||
      headerRow.includes("localGazeZ")
    ) {
      Hardware = "VR";
    } else {
      Hardware = "SB";
    }

    let metrics = [];
    let trialNumbers =
      "1,2,1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,1,2";
    let summary = {};

    if (baselineIsChecked) {
      metrics = ["AvgPupil", "BaselineCorrectedAvg", "GOI"];
    } else {
      metrics = ["AvgPupil", "GOI"];
    }

    metrics.forEach((metric) => {
      summary[metric] = { "CS+": [], "CS-": [] };
    });

    for (let i = 0; i < finalRows.length; i++) {
      const r = finalRows[i];
      const avgP = r[9];
      const baseP = r[10];
      const goiVal = r[goiIndex + 2];

      let stageVal = "";
      for (let j = i; j >= 0; j--) {
        const candidateStage = (finalRows[j][stageIndex] || "").trim();
        if (candidateStage && candidateStage !== "US") {
          stageVal = candidateStage;
          break;
        }
      }

      const isSummary =
        avgP !== "" &&
        (r[Context] === "" || r[Context] === undefined || r[Context] === null);

      if (isSummary) {
        let category = "";
        if (stageVal.includes("CS+")) category = "CS+";
        else if (stageVal.includes("CS-")) category = "CS-";

        if (category === "CS+" || category === "CS-") {
          summary["AvgPupil"][category].push(avgP);
          if (baselineIsChecked)
            summary["BaselineCorrectedAvg"][category].push(baseP);
          summary["GOI"][category].push(goiVal);
        }
      }
    }

    let combinedSummaryCSV = "";

    metrics.forEach((metric) => {
      combinedSummaryCSV += metric + "\n";
      combinedSummaryCSV += "Trial," + trialNumbers + "\n";

      ["CS+", "CS-"].forEach((category) => {
        // Format values to 3 decimal places and join directly
        const formattedValues = summary[metric][category].map((val) =>
          parseFloat(val).toFixed(3)
        );
        combinedSummaryCSV += category + "," + formattedValues.join(",") + "\n";
      });

      combinedSummaryCSV += "\n";
    });

    const dataCSV = finalRows.map((r) => r.join(",")).join("\n");
    const csvContent = combinedSummaryCSV + "\n" + dataCSV;
    const programName = document
      .getElementById("Text")
      .value.replace(/\s+/g, "");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      programName || "Program"
    }_${Hardware}_${ContextType}_DONE.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  reader.readAsText(file);
});
