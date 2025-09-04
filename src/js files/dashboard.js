// src/js files/dashboard.js
import { loadCSVData } from "./dataLoader.js";
import * as d3 from "d3";

const margins = { top: 20, right: 20, bottom: 20, left: 50 };
let width, height;
let containerSizeObserver;

export function initDashboard() {
  const graphContainer = document.querySelector(".graph");
  const countryButton = document.querySelector(".country");
  const graphTypeButton = document.querySelector(".chart");
  const yearButton = document.querySelector(".year");
  const totalSuicide = document.querySelector(".total-suicide");
  const averageSuicide = document.querySelector(".suicide-rate");
  const maleSuicide = document.querySelector(".male-suicide");
  const femaleSuicide = document.querySelector(".female-suicide");

  if (!graphContainer || !countryButton) {
    console.error("Dashboard elements not found");
    return;
  }

  containerSizeObserver = new ResizeObserver((entries) => {
    if (!entries[0]) return;

    const container = entries[0].target;
    const containerWidth = container.clientWidth || container.offsetWidth;

    // ✅ Use clientWidth/offsetWidth as fallback
    const widthVariation =
      parseFloat(getComputedStyle(container).width) || containerWidth;

    if (!widthVariation || widthVariation <= 10) {
      return; // Skip if container not ready
    }

    width = Math.max(100, widthVariation - margins.left - margins.right);
    height = Math.max(100, widthVariation / 2 - margins.top - margins.bottom);

    // Clear previous SVGs and redraw
    d3.select(".graph").selectAll("svg").remove();

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        redraw();
      }
    }, 50);
  });

  containerSizeObserver.observe(graphContainer);

  // Load data and draw initial chart
  loadCSVData().then((data) => {
    lineChart(data, countryButton.querySelector(".current-item").textContent);
  });

  // Chart functions
  function lineChart(data, country) {
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft(y).tickFormat(d3.format(".2s"));

    if (width < 500) {
      xAxis.ticks(4);
      yAxis.ticks(4);
    }

    const svg = d3
      .select(".graph")
      .append("svg")
      .attr("width", width + margins.left + margins.right)
      .attr("height", height + margins.top + margins.bottom)
      .append("g")
      .attr("transform", `translate(${margins.left}, 0)`);

    const countryYears = new Set();
    data.forEach((d) => {
      if (d.Country === country) {
        countryYears.add(d.Year);
      }
    });

    const years = [...countryYears].sort((a, b) => a - b);
    const suicideNumber = [];
    const maleNumbers = [];
    const femaleNumbers = [];

    years.forEach((year) => {
      let totalSum = 0;
      let maleSum = 0;
      let femaleSum = 0;
      data.forEach((d) => {
        if (d.Country === country && d.Year === year && d.Sex === "male") {
          maleSum += d.Suicides_no;
        }
        if (d.Country === country && d.Year === year && d.Sex === "female") {
          femaleSum += d.Suicides_no;
        }
        if (d.Country === country && d.Year === year) {
          totalSum += d.Suicides_no;
        }
      });
      suicideNumber.push(totalSum);
      maleNumbers.push(maleSum);
      femaleNumbers.push(femaleSum);
    });

    const dataset = years.map((year, i) => ({
      year: year,
      value: suicideNumber[i],
    }));

    const line = d3
      .line()
      .x((d) => x(new Date(d.year, 0, 1)))
      .y((d) => y(d.value));

    x.domain(d3.extent(years, (d) => new Date(d, 0, 1)));
    y.domain([0 * (1 - 0.1), d3.max(suicideNumber) * (1 + 0.1)]);

    // Axes
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    svg.append("g").attr("class", "y axis").call(yAxis);

    // Gradient
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#67e8f9");

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#06b6d4");

    // Line path
    svg
      .append("path")
      .datum(dataset)
      .attr("fill", "none")
      .attr("stroke", "url(#line-gradient)")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Labels
    svg
      .append("text")
      .attr("class", "x label")
      .attr("x", width / 2)
      .attr("y", height + 35)
      .attr("text-anchor", "middle")
      .text("Years");

    svg
      .append("text")
      .attr("class", "y label")
      .attr("x", -height / 2)
      .attr("y", -35)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Suicides No.");

    // Update statistics
    totalSuicide.querySelector(".value").textContent =
      sumOfArray(suicideNumber);
    const averageRate = suicideNumber.map((number) => number / 12);
    averageSuicide.querySelector(".value").textContent = Number(
      (sumOfArray(averageRate) / averageRate.length).toFixed(2)
    );
    const averageMaleSuicide = maleNumbers.map((number) => number / 12);
    maleSuicide.querySelector(".dashboard-heading").textContent =
      "Average Suicide Rate in Males";
    maleSuicide.querySelector(".value").textContent = Number(
      (sumOfArray(averageMaleSuicide) / averageMaleSuicide.length).toFixed(2)
    );
    const averageFemaleSuicide = femaleNumbers.map((number) => number / 12);
    femaleSuicide.querySelector(".dashboard-heading").textContent =
      "Average Suicide Rate in Females";
    femaleSuicide.querySelector(".value").textContent = Number(
      (sumOfArray(averageFemaleSuicide) / averageFemaleSuicide.length).toFixed(
        2
      )
    );
  }

  function barChart(data, country, year) {
    const xscale = d3.scaleBand().range([0, width]).padding(0.1);
    const yscale = d3.scaleLinear().range([height, 0]);

    const xaxis = d3.axisBottom(xscale);
    const yaxis = d3.axisLeft(yscale).tickFormat(d3.format(".2s"));

    if (width < 500) {
      yaxis.ticks(4);
    }

    const svg = d3
      .select(".graph")
      .append("svg")
      .attr("width", width + margins.left + margins.right)
      .attr("height", height + margins.top + margins.bottom)
      .append("g")
      .attr("transform", `translate(${margins.left}, 0)`);

    let ageGroup = new Set();
    data.forEach((d) => {
      if (d.Country === country) {
        ageGroup.add(d.Age);
      }
    });

    ageGroup = [...ageGroup];
    const xTicks = ageGroup.map((age) => age.split(" ")[0]);
    const dataset = Object.fromEntries(xTicks.map((key) => [key, 0]));

    data.forEach((d) => {
      if (d.Country === country && d.Year === year) {
        const age = d.Age.split(" ")[0];
        if (dataset.hasOwnProperty(age)) {
          dataset[age] += d.Suicides_no;
        }
      }
    });

    const lowestSuicideGroup = Object.entries(dataset).reduce(
      (min, [key, value]) => (value < min[1] ? [key, value] : min)
    )[0];

    const highestSuicideGroup = Object.entries(dataset).reduce(
      (max, [key, value]) => (value > max[1] ? [key, value] : max)
    )[0];

    const datasetValues = Object.values(dataset);
    const totalSuicideNumber = sumOfArray(datasetValues);

    totalSuicide.querySelector(".value").textContent = totalSuicideNumber;
    averageSuicide.querySelector(".value").textContent = Number(
      sumOfArray(datasetValues) / datasetValues.length
    ).toFixed(2);

    femaleSuicide.querySelector(".dashboard-heading").textContent =
      "Lowest Suicide Age Group";
    femaleSuicide.querySelector(".value").textContent = lowestSuicideGroup;

    maleSuicide.querySelector(".dashboard-heading").textContent =
      "Highest Suicide Age Group";
    maleSuicide.querySelector(".value").textContent = highestSuicideGroup;

    xscale.domain(xTicks);
    yscale.domain([0 * (1 - 0.1), d3.max(Object.values(dataset)) * (1 + 0.1)]);

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(xaxis);

    svg.append("g").attr("class", "y axis").call(yaxis);

    const updatedData = Object.entries(dataset).map(([age, value]) => ({
      age,
      value,
    }));

    const defs = svg.append("defs");
    const barGradient = defs
      .append("linearGradient")
      .attr("id", "bar-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    barGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#67e8f9");

    barGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#06b6d4");

    // Draw bars
    svg
      .selectAll(".bar")
      .data(updatedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xscale(d.age))
      .attr("y", (d) => yscale(d.value))
      .attr("width", xscale.bandwidth())
      .attr("height", (d) => height - yscale(d.value))
      .attr("fill", "url(#bar-gradient)");

    // Labels
    svg
      .append("text")
      .attr("class", "x label")
      .attr("x", width / 2)
      .attr("y", height + 35)
      .attr("text-anchor", "middle")
      .text("Age Groups");

    svg
      .append("text")
      .attr("class", "y label")
      .attr("x", -height / 2)
      .attr("y", -35)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Suicides No.");
  }

  function sumOfArray(arr) {
    let total = 0;
    for (let i of arr) {
      total += i;
    }
    return total;
  }

  function redraw() {
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      console.log("Cannot redraw - invalid dimensions");
      return;
    }
    const currentYear = +yearButton.querySelector(".current-item").textContent;
    const svg = document.querySelector(".graph svg");
    if (svg) svg.remove();

    const country = countryButton
      .querySelector(".current-item")
      .textContent.trim();
    const graphType = graphTypeButton
      .querySelector(".current-item")
      .textContent.trim()
      .toLowerCase();

    loadCSVData().then((data) => {
      if (graphType === "line chart") {
        lineChart(data, country);
      } else if (graphType === "bar chart") {
        barChart(data, country, currentYear);
      }
    });
  }

  // Observers for dynamic updates
  const countryObserver = new MutationObserver(redraw);
  countryObserver.observe(countryButton.querySelector(".current-item"), {
    childList: true,
    characterData: true,
    subtree: true,
  });

  const graphTypeObserver = new MutationObserver(redraw);
  graphTypeObserver.observe(graphTypeButton.querySelector(".current-item"), {
    childList: true,
    characterData: true,
    subtree: true,
  });
  // Add this year-specific observer in dashboard.js
  const yearElement = yearButton.querySelector(".current-item");
  if (yearElement) {
    const yearChangeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "characterData" ||
          mutation.type === "childList"
        ) {
          const graphType = graphTypeButton
            .querySelector(".current-item")
            .textContent.trim()
            .toLowerCase();
          if (graphType === "bar chart") {
            redraw();
          }
          break;
        }
      }
    });

    yearChangeObserver.observe(yearElement, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  }
}
