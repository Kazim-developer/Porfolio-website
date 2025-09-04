// src/js files/data-loader.js
import * as d3 from "d3";

let cachedData = null;

export async function loadCSVData() {
  if (cachedData) {
    return cachedData; // Return cached data if already loaded
  }

  try {
    cachedData = await d3.csv("downloads/data.csv");

    // Preprocess data
    cachedData.forEach((d) => {
      d.Year = +d.Year;
      d.Suicides_no = +d.Suicides_no;
      if (d.Suicide_no) d.Suicide_no = +d.Suicide_no;
    });

    console.log("CSV data loaded and processed");
    return cachedData;
  } catch (error) {
    console.error("Error loading CSV data:", error);
    throw error;
  }
}

export function getCachedData() {
  return cachedData;
}
