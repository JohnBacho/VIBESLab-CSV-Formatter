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

fileInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
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
    const stageIndex = keepColumns.indexOf("Stage");
    const goiIndex = keepColumns.indexOf("GameObjectInFocus");
    const leftPupilIndex = keepColumns.indexOf("leftEyePupilSize");
    const rightPupilIndex = keepColumns.indexOf("rightEyePupilSize");
    const Context = keepColumns.indexOf("Context");
    const uniqueChars = new Set();
    let avgTrialPupilSize = [];

    const finalRows = [filteredRows[0]];
    let lastKept = null;

    for (let i = 1; i < filteredRows.length; i++) {
      const row = filteredRows[i];
      const stage = (row[stageIndex] || "").trim();

      if (
        stage === "InterTrial" ||
        stage.toLowerCase().includes("baseline") ||
        stage === "InstructionPhase"
      ) {
        lastKept = null;
        continue;
      }

      if (lastKept === null) {
        const emptyRow = new Array(row.length).fill("");

        for (let j = finalRows.length - 1; j >= 1; j--) {
          const prevAVGRow = finalRows[j][9];
          const prevGOI = finalRows[j][goiIndex + 1];
          const prevContext = finalRows[j][Context];
          if (String(prevContext).trim() === "") break;
          avgTrialPupilSize.push(parseFloat(prevAVGRow));
        }

        let trialAvg = "";
        const validSizes = avgTrialPupilSize.filter((size) => !isNaN(size));
        if (validSizes.length > 0) {
          const sum = validSizes.reduce((a, b) => a + b, 0);
          trialAvg = sum / validSizes.length;
        }

        emptyRow.splice(9, 0, trialAvg);
        finalRows.push(emptyRow);
        avgTrialPupilSize = [];
      }

      if ((row[goiIndex] || "").trim().toLowerCase() === "invalidgaze") {
        row[goiIndex] = "";
      }

      const textToScan = row[Context] || "";
      uniqueChars.add(textToScan);

      const leftPupil = parseFloat(row[leftPupilIndex]);
      const rightPupil = parseFloat(row[rightPupilIndex]);
      let avgPupil = "";

      if (!isNaN(leftPupil) && !isNaN(rightPupil)) {
        avgPupil = (leftPupil + rightPupil) / 2;
      } else if (!isNaN(leftPupil)) {
        avgPupil = leftPupil;
      } else if (!isNaN(rightPupil)) {
        avgPupil = rightPupil;
      }

      row.splice(9, 0, avgPupil);
      finalRows.push(row);
      lastKept = row;
    }

      console.log("Finalizing last trial average calculation");
      const emptyRow = new Array(filteredRows[0].length).fill("");

      for (let j = finalRows.length - 1; j >= 1; j--) {
        const prevAVGRow = finalRows[j][9];
        const prevContext = finalRows[j][Context];
        if (String(prevContext).trim() === "") break;
        avgTrialPupilSize.push(parseFloat(prevAVGRow));
      }

      let trialAvg = "";
      const validSizes = avgTrialPupilSize.filter((size) => !isNaN(size));
      if (validSizes.length > 0) {
        const sum = validSizes.reduce((a, b) => a + b, 0);
        trialAvg = sum / validSizes.length;
      }
      emptyRow.splice(9, 0, trialAvg);
      finalRows.push(emptyRow);


    const uniqueArray = Array.from(uniqueChars);
    ContextType = uniqueArray.join("");
    if (ContextType.length <= 1) {
      ContextType = "AAA";
    } else {
      ContextType = "ABA";
    }
    Hardware = "";
    if (
      headerRow.includes("rightEyeRotationY") ||
      headerRow.includes("localGazeZ")
    ) {
      Hardware = "VR";
    } else {
      Hardware = "SB";
    }

    const csvContent = finalRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Program_${Hardware}_${ContextType}_DONE.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  reader.readAsText(file);
});
