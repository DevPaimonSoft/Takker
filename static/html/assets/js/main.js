const accordionItems = document.querySelectorAll(".accordion__item");

const toggleAccordion = (item) => {
  const accordionContent = item.querySelector(".accordion__content");

  if (item.classList.contains("_open")) {
    accordionContent.removeAttribute("style");
    item.classList.remove("_open");
  } else {
    accordionContent.style.height = `${accordionContent.scrollHeight}px`;
    item.classList.add("_open");
  }
};

const closeOpenAccordions = (items, currentItem) => {
  items.forEach((item) => {
    if (item !== currentItem && item.classList.contains("_open")) {
      toggleAccordion(item);
    }
  });
};

accordionItems.forEach((item) => {
  const accordionHeader = item.querySelector(".accordion__header");

  accordionHeader.addEventListener("click", () => {
    const openItem = document.querySelector("._open");

    toggleAccordion(item);

    if (openItem && openItem !== item) {
      closeOpenAccordions(accordionItems, item);
    }
  });
});

const icon = document.querySelector(".menu__icon"),
  menuBody = document.querySelector(".menu__body"),
  closeBtn = document.querySelector(".menu__close");

if (icon) {
  icon.addEventListener("click", function () {
    menuBody.classList.toggle("_active");
    icon.classList.toggle("_active");
    document.querySelector("body").classList.toggle("scroll");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  document.addEventListener("click", function (event) {
    const target = event.target;
    const isClickInside = icon.contains(target);
    if (!isClickInside && menuBody.classList.contains("_active") && target.closest(".none") == null) {
      menuBody.classList.remove("_active");
      icon.classList.remove("_active");
      document.querySelector("body").classList.remove("scroll");
    }
  });
}

if (closeBtn) {
  closeBtn.addEventListener("click", function () {
    menuBody.classList.remove("_active");
    icon.classList.remove("_active");
  });
}

function copy(className) {
  var content;

  if (typeof className === "string" && className.trim() !== "") {
    var elements = document.getElementsByClassName(className);

    if (elements.length > 0) {
      if (elements[0].tagName === "INPUT") {
        content = elements[0].value;
      } else {
        content = elements[0].innerText;
      }
    }
  }

  var tempTextarea = document.createElement("textarea");
  tempTextarea.value = content;

  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  navigator.clipboard.writeText(tempTextarea.value);

  document.body.removeChild(tempTextarea);
}

function paste(className) {
  if (typeof className === "string" && className.trim() !== "") {
    var elements = document.getElementsByClassName(className);

    if (elements.length > 0 && elements[0].tagName === "INPUT") {
      navigator.clipboard
        .readText()
        .then(function (text) {
          elements[0].value = text;
        })
        .catch(function (err) {
          console.error("Ошибка при вставке текста из буфера: ", err);
        });
    }
  }
}

function deleteText(className) {
  if (typeof className === "string" && className.trim() !== "") {
    var elements = document.getElementsByClassName(className);

    if (elements.length > 0 && elements[0].tagName === "INPUT") {
      elements[0].value = "";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const listItems = document.querySelectorAll(".select__ul li");
  const input = document.getElementById("selectInput");

  listItems.forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });

  if (input) {
    input.addEventListener("input", () => {
      const filterText = input.value.toLowerCase();

      listItems.forEach((item) => {
        const span = item.querySelector("span");
        const spanText = span ? span.textContent.toLowerCase() : "";

        if (spanText.includes(filterText)) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    });
  }
});

if (document.querySelector(".slider")) {
  const slider = document.querySelector(".slider");
  const before = document.querySelector(".before");
  const beforeImage = before.querySelector("img");
  const change = document.querySelector(".change");
  const body = document.body;

  let isActive = false;

  document.addEventListener("DOMContentLoaded", () => {
    let width = slider.offsetWidth;
    beforeImage.style.width = `${width}px`;
  });

  change.addEventListener("mousedown", () => {
    isActive = true;
  });

  body.addEventListener("mouseup", () => {
    isActive = false;
  });

  body.addEventListener("mouseleave", () => {
    isActive = false;
  });

  const beforeAfterSlider = (x) => {
    let shift = Math.max(0, Math.min(x, slider.offsetWidth));
    before.style.width = `${shift}px`;
    change.style.left = `${shift}px`;
  };

  const pauseEvents = (e) => {
    e.stopPropagation();
    e.preventDefault();
    return false;
  };

  body.addEventListener("mousemove", (e) => {
    if (!isActive) {
      return;
    }

    let x = e.pageX;
    x -= slider.getBoundingClientRect().left;
    beforeAfterSlider(x);
    pauseEvents(e);
  });

  change.addEventListener("touchstart", () => {
    isActive = true;
  });

  body.addEventListener("touchend", () => {
    isActive = false;
  });

  body.addEventListener("touchcancel", () => {
    isActive = false;
  });

  body.addEventListener("touchmove", (e) => {
    if (!isActive) {
      return;
    }

    let x;

    let i;
    for (i = 0; i < e.changedTouches.length; i++) {
      x = e.changedTouches[i].pageX;
    }

    x -= slider.getBoundingClientRect().left;

    beforeAfterSlider(x);
    pauseEvents(e);
  });
}

class ItcTabs {
  constructor(target, config) {
    const defaultConfig = {};
    this._config = Object.assign(defaultConfig, config);
    this._elTabs = typeof target === "string" ? document.querySelector(target) : target;
    this._elButtons = this._elTabs.querySelectorAll(".tabs__btn");
    this._elPanes = this._elTabs.querySelectorAll(".tabs__pane");
    this._eventShow = new Event("tab.itc.change");
    this._init();
    this._events();
  }
  _init() {
    this._elTabs.setAttribute("role", "tablist");
    this._elButtons.forEach((el, index) => {
      el.dataset.index = index;
      el.setAttribute("role", "tab");
      this._elPanes[index].setAttribute("role", "tabpanel");
    });
  }
  show(elLinkTarget) {
    const elPaneTarget = this._elPanes[elLinkTarget.dataset.index];
    const elLinkActive = this._elTabs.querySelector(".tabs__btn_active");
    const elPaneShow = this._elTabs.querySelector(".tabs__pane_show");
    if (elLinkTarget === elLinkActive) {
      return;
    }
    elLinkActive ? elLinkActive.classList.remove("tabs__btn_active") : null;
    elPaneShow ? elPaneShow.classList.remove("tabs__pane_show") : null;
    elLinkTarget.classList.add("tabs__btn_active");
    elPaneTarget.classList.add("tabs__pane_show");
    this._elTabs.dispatchEvent(this._eventShow);
    elLinkTarget.focus();
  }
  showByIndex(index) {
    const elLinkTarget = this._elButtons[index];
    elLinkTarget ? this.show(elLinkTarget) : null;
  }
  _events() {
    this._elTabs.addEventListener("click", (e) => {
      const target = e.target.closest(".tabs__btn");
      if (target) {
        e.preventDefault();
        this.show(target);
      }
    });
  }
}

const themeButtons = document.querySelectorAll(".themeButton");
const darkTheme = "dark";
const switchingClass = "switching";

const selectedTheme = localStorage.getItem("selected-theme");

const getCurrentTheme = () => (document.body.classList.contains(darkTheme) ? "dark" : "light");

if (selectedTheme) {
  document.body.classList[selectedTheme === "dark" ? "add" : "remove"](darkTheme);
}

if (themeButtons.length > 0) {
  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      document.documentElement.classList.add(switchingClass);

      setTimeout(() => {
        document.documentElement.classList.remove(switchingClass);
      }, 200);

      document.body.classList.toggle(darkTheme);
      localStorage.setItem("selected-theme", getCurrentTheme());
    });
  });
}

const selectItems = document.querySelectorAll(".selectItems");

selectItems.forEach((selectItem) => {
  const tabsBtns = selectItem.querySelectorAll(".tabs__btn");

  tabsBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabsBtns.forEach((b) => b.classList.remove("active"));

      btn.classList.add("active");
    });
  });
});

function toggleInputs() {
  const inputs = document.querySelectorAll(".input__vis");

  inputs.forEach((input) => {
    const originalType = input.getAttribute("data-original-type");
    const currentType = input.type;

    if (currentType === "password") {
      input.type = originalType;
    } else {
      input.setAttribute("data-original-type", currentType);
      input.type = "password";
    }
  });

  const areAllHidden = Array.from(inputs).every((input) => input.type === "password");
  localStorage.setItem("inputsHidden", areAllHidden ? "true" : "false");
}

function toggleIcon() {
  const icon = document.querySelector(".block__header-icon");
  if (icon) {
    const isHidden = icon.classList.toggle("icon__hidden");
    localStorage.setItem("iconHidden", isHidden ? "true" : "false");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const icon = document.querySelector(".block__header-icon");
  const inputs = document.querySelectorAll(".input__vis");

  if (localStorage.getItem("inputsHidden") === "true") {
    inputs.forEach((input) => {
      input.setAttribute("data-original-type", input.type);
      input.type = "password";
    });
  } else {
    inputs.forEach((input) => {
      input.setAttribute("data-original-type", input.type);
    });
  }

  if (icon && localStorage.getItem("iconHidden") === "true") {
    icon.classList.add("icon__hidden");
  }

  if (icon) {
    icon.addEventListener("click", () => {
      toggleInputs();
      toggleIcon();
    });
  }
});

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  const overlay = document.querySelector(".overlay");

  modal.classList.add("_open");
  overlay.classList.add("_open");

  overlay.addEventListener("click", closeModal);

  window.addEventListener("keydown", (e) => {
    if (e.keyCode === 27) {
      closeModal();
    }
  });

  function closeModal() {
    modal.classList.remove("_open");
    overlay.classList.remove("_open");
    overlay.removeEventListener("click", closeModal);
  }

  const closeButtons = document.querySelectorAll("._close");

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeModal();
      button.removeEventListener("click", closeModal);
    });
  });
}

function promo() {
  const promoInput = document.querySelector(".promoInput");

  if (promoInput.value.trim() !== "") {
    const promoNextSpan = document.querySelector(".promoNext span");
    promoNextSpan.textContent = "Далее";

    const promoNext = document.querySelector(".promoNext");
    promoNext.classList.remove("white");

    const promoButtonSpan = document.querySelector(".promoButton span");
    promoButtonSpan.textContent = "Применен";

    const promoButton = document.querySelector(".promoButton");
    promoButton.disabled = true;

    const promoSuccess = document.querySelector(".promoSuccess");
    promoSuccess.style = "display: block;";

    promoInput.classList.add("readonly");
    promoInput.readOnly = true;
  }
}
