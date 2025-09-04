import { menu, close, dropDown } from "./index";

menu.addEventListener("click", function () {
  dropDown.classList.remove("hidden");
  menu.classList.add("max-[580px]:hidden");
  close.classList.remove("hidden");
  close.classList.add("max-[580px]:block");
});

close.addEventListener("click", function () {
  dropDown.classList.add("hidden");
  menu.classList.remove("max-[580px]:hidden");
  menu.classList.add("max-[580px]:block");
  close.classList.add("hidden");
  close.classList.remove("max-[580px]:block");
});
