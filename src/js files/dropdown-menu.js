// src/js files/dropdown-menu.js
import { loadCSVData } from "./dataLoader.js";

export function initDropdownMenu() {
  const selectionMenuButtons = document.querySelectorAll("#selection-dropdown");
  const countryButton = document.querySelector(".country");
  const yearButton = document.querySelector(".year");
  const graphTypeButton = document.querySelector(".chart");

  if (!countryButton || !yearButton) {
    console.error("Dropdown elements not found");
    return;
  }

  const countryMenu = countryButton.querySelector(".menu-items");
  const yearMenu = yearButton.querySelector(".menu-items");

  // Dropdown toggle functionality
  selectionMenuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const arrow = button.querySelector("i");
      const menu = button.querySelector(".menu-items");
      const currentItem = button.querySelector(".current-item");
      const menuItems = menu.querySelectorAll("*");

      menuItems.forEach((item) => {
        item.addEventListener("click", () => {
          let temp = currentItem.textContent;
          currentItem.textContent = item.textContent;
          item.textContent = temp;
        });
      });

      menu.classList.toggle("hidden");
      arrow.classList.toggle("rotated");
    });
  });

  // Load data and populate dropdowns
  loadCSVData().then((data) => {
    let countries = new Set();
    let oldyears = new Set();
    const currentCountry = countryButton.querySelector(".current-item");
    const currentYear = yearButton.querySelector(".current-item");

    data.forEach((d) => {
      countries.add(d.Country);
    });

    countries = [...countries].slice(1);
    for (let country of countries) {
      const element = document.createElement("p");
      element.textContent = country;
      element.classList.add(
        "cursor-pointer",
        "pl-[10px]",
        "py-[5px]",
        "hover:font-bold",
        "transition-font"
      );
      countryMenu.appendChild(element);
    }

    data.forEach((d) => {
      if (d.Country === currentCountry.textContent) {
        oldyears.add(d.Year);
      }
    });

    oldyears = [...oldyears].sort((a, b) => a - b);
    currentYear.textContent = oldyears[0];

    for (let year of oldyears) {
      const element = document.createElement("p");
      element.textContent = year;
      element.classList.add(
        "cursor-pointer",
        "pl-[10px]",
        "py-[5px]",
        "hover:font-bold",
        "transition-font"
      );
      yearMenu.appendChild(element);
    }

    // Country change observer
    const countryObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "childList" ||
          mutation.type === "characterData"
        ) {
          let years = new Set();
          const selectedCountry = currentCountry.textContent.trim();

          data.forEach((d) => {
            if (selectedCountry === d.Country) {
              years.add(d.Year);
            }
          });

          years = [...years].sort((a, b) => a - b);
          yearButton.querySelector(".menu-items").innerHTML = "";
          yearButton.querySelector(".current-item").textContent = years[0];

          for (let year of years) {
            const element = document.createElement("p");
            element.textContent = year;
            element.classList.add(
              "cursor-pointer",
              "pl-[10px]",
              "py-[5px]",
              "hover:font-bold",
              "transition-font"
            );
            yearMenu.appendChild(element);
          }
          break;
        }
      }
    });

    countryObserver.observe(currentCountry, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });

  // Graph type change functionality
  const currentItem = graphTypeButton.querySelector(".current-item");

  function updateUI() {
    const text = currentItem.textContent.trim().toLowerCase();
    if (text === "bar chart") {
      yearButton.classList.remove("hidden");
    } else if (text === "line chart") {
      yearButton.classList.add("hidden");
    }
  }

  const TextContentObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList" || mutation.type === "characterData") {
        updateUI();
        break;
      }
    }
  });

  TextContentObserver.observe(currentItem, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  updateUI();
}
