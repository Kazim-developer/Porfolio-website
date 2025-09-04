// src/js files/storage.js
import { buttons, nav, main, dropDown, menu, close } from "./index";
import { initDashboard } from "./dashboard.js";
import { initDropdownMenu } from "./dropdown-menu.js";

const height = `translateY(${nav.clientHeight}px)`;

buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const pageText = e.target.textContent.toLowerCase().trim();
    const page = pageText === "dashboard project" ? "dashboard" : pageText;

    pageLoader(page);

    buttons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");

    if (button.classList.contains("dropdown-btn")) {
      dropDown.classList.add("hidden");
      menu.classList.remove("max-[580px]:hidden");
      menu.classList.add("max-[580px]:block");
      close.classList.add("hidden");
      close.classList.remove("max-[580px]:block");
    }
  });
});

function currentPageHeading(page) {
  buttons.forEach((b) => b.classList.remove("active"));
  const navBtn = document.querySelector(`.${page}-nav`);
  if (navBtn) navBtn.classList.add("active");
  const dropdownBtn = document.querySelector(`.${page}-dropdown`);
  if (dropdownBtn) dropdownBtn.classList.add("active");
}

function syncActivePage() {
  const data = sessionStorage.getItem("currentPage");
  if (!data) return;
  const parsedData = JSON.parse(data);
  currentPageHeading(parsedData.page);
}

syncActivePage();
window.addEventListener("resize", syncActivePage);

function pageLoader(pageName) {
  const pageLoad = {};
  const template = document.querySelector("template");
  const pageHTML = template.content.querySelector(`.${pageName}`).outerHTML;
  pageLoad.page = pageName;
  pageLoad.pageContent = pageHTML;

  sessionStorage.clear();
  sessionStorage.setItem("currentPage", JSON.stringify(pageLoad));
  const data = sessionStorage.getItem("currentPage");
  const currentPage = JSON.parse(data);

  if (pageName === "home") {
    main.style.transform = "none";
  } else {
    main.style.transform = height;
  }
  main.innerHTML = "";
  main.innerHTML = currentPage.pageContent;

  // ✅ Initialize dashboard only when dashboard page is loaded
  if (pageName === "dashboard") {
    setTimeout(() => {
      initDropdownMenu();
      initDashboard();
    }, 50);
  }
}

if (sessionStorage.length === 1) {
  const data = sessionStorage.getItem("currentPage");
  const parsedData = JSON.parse(data);
  const currentPage = parsedData.page;
  if (currentPage === "home") {
    main.style.transform = "none";
  } else {
    main.style.transform = height;
  }
  currentPageHeading(currentPage);
  main.innerHTML = parsedData.pageContent;

  // Initialize dashboard if it was the last page
  if (currentPage === "dashboard") {
    setTimeout(() => {
      initDropdownMenu();
      initDashboard();
    }, 50);
  }
} else {
  const currentPage = "home";
  main.style.transform = "none";
  currentPageHeading(currentPage);
  pageLoader("home");
}
