# CSV Eye-Tracking Processor

<div align="center">
<img width="400" alt="CSV Processor Logo" src="https://github.com/user-attachments/assets/89824d3a-373a-448f-9b5c-256f4c459466" />

<br>

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC--BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Platform](https://img.shields.io/badge/Platform-Web-brightgreen.svg)](https://github.com/)
[![Status](https://img.shields.io/badge/Status-Development-orange.svg)]()

</div>

---

## 📖 Overview

**CSV Eye-Tracking Processor** is a lightweight JavaScript tool that reads raw eye-tracking CSV files and outputs cleaned, trial-averaged data ready for analysis.

This updated version introduces:

* **Baseline calculation** used to calculate change
* **Trial summary metrics** for CS+ and CS- stimuli
* **Flexible handling of VR and non-VR datasets**
* **Automatic generation of summary CSVs** with combined trial averages 2-trial blocks grouped by CS+ or CS-

> ⚠️ Supports VR-based eye-tracking (HTC VIVE Pro Eye) and Tobii eye-tracking datasets created in [Project 1](https://github.com/JohnBacho/VIBES-LAB-Project1).

---

## 🛠️ Features

* **Column filtering** – Only relevant columns are retained (`Date`, `LocalTime`, `Phase`, `TrialNumber`, `Step`, `Stage`, `Context`, `leftEyePupilSize`, `rightEyePupilSize`, `GameObjectInFocus`)
* **Trial-based aggregation** – Computes **average pupil size** and **baseline-corrected pupil size** per trial
* **Proportion of gaze on objects of interest (GOI)** automatically computed per trial
* **Baseline handling** – Uses instruction phase to calculate baseline for all subsequent trials
* **Context classification** – Automatically tags data as `AAA` or `ABA` depending on unique context characters
* **Hardware detection** – Differentiates between VR and non-VR data based on headers
* **Summary CSV generation** – Outputs CS+ and CS- averages for all metrics
* **Automatic CSV download** – Processed file named `Program_[Hardware]_[ContextType]_DONE.csv`

---

## 📥 Usage

1. Open the HTML page in your browser: [Live Demo](https://johnbacho.github.io/VIBES-Lab-CSV-Processor/)
2. Select your raw CSV file using the **file input**.
3. Optionally, enter a **program name** in the text field (spaces will be removed automatically).
4. The script processes the file and downloads a cleaned CSV, including trial averages and summary metrics.

> Runs entirely in-browser using **JavaScript `FileReader`**, no server needed.

---

## ⚙️ How It Works

1. Reads CSV and splits into rows/columns

2. Filters only the required columns

3. Computes:

   * **Average pupil size** per trial
   * **Baseline-corrected pupil size** using instruction-phase baseline
   * **Proportion of gaze on target objects (GOI)**

4. Detects **baseline switches** and updates baseline values dynamically

5. Generates a new CSV including:

   * Trial-level averages
   * Baseline-corrected averages
   * GOI metrics
   * Combined summary for CS+ and CS- trials

---

## 👥 Core Team

| Name            | Major                           |
| --------------- | ------------------------------- |
| John Bacho      | Computer Science                |
| Lauren Dunlap   | Computer Science                |
| Albert Selby    | Computer Science / Data Science |
| Marissa Brigger | Neuroscience                    |
| Alexa Gossett   | Neuroscience / Psychology       |
| Jace Lander     | Software Engineer               |
| Corey Schwarz   | Computer Science / Data Science |
| Cydney Hudson   | Neuroscience                    |
| Olivia Mullins  | Neuroscience                    |

---

## 📄 License

This project is licensed under **CC BY-NC 4.0**.

---

## 📧 Contact

* **Email:** [jbacho22@bw.edu](mailto:jbacho22@bw.edu)
* **Issues:** [GitHub Issues](https://github.com/YourUsername/CSV-EyeTracking-Processor/issues)

---

<div align="center">
Made with ❤️ by the VIBES Lab Team
</div>
