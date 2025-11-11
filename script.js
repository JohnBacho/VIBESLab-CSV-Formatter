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
    console.log("Header Row:", headerRow);
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
        emptyRow.splice(9, 0, "");
        finalRows.push(emptyRow);
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
    const uniqueArray = Array.from(uniqueChars);
    ContextType = uniqueArray.join("");
    if (ContextType.length <= 1) {
        ContextType = "AAA";
    }
    else{
        ContextType = "ABA"
    }
    Hardware = "";
    if(headerRow.includes("rightEyeRotationY") || headerRow.includes("localGazeZ") ){
        Hardware = "VR";
    }
    else{
        Hardware = "SB";
    }

    const csvContent = finalRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Program_${Hardware}_${ContextType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  reader.readAsText(file);
});
