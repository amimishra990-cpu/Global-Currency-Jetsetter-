const currenciesUrl = "https://api.frankfurter.dev/v1/currencies";
const latestUrl = "https://api.frankfurter.dev/v1/latest";

const amountInput = document.getElementById("amount");
const baseCurrencySelect = document.getElementById("baseCurrency");
const searchCurrencyInput = document.getElementById("searchCurrency");
const sortBySelect = document.getElementById("sortBy");
const currencyList = document.getElementById("currencyList");
const convertBtn = document.getElementById("convertBtn");
const clearBtn = document.getElementById("clearBtn");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const resultsEl = document.getElementById("results");
const lastUpdatedEl = document.getElementById("lastUpdated");

let allCurrencies = {};
let filteredCurrencies = [];
let selectedTargets = ["INR", "EUR", "JPY"];

function showLoading() {
  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
}

function hideLoading() {
  loadingEl.classList.add("hidden");
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function clearError() {
  errorEl.classList.add("hidden");
  errorEl.textContent = "";
}

async function fetchCurrencies() {
  showLoading();
  clearError();

  try {
    const response = await fetch(currenciesUrl);
    if (!response.ok) {
      throw new Error("Could not load currencies.");
    }

    const data = await response.json();
    allCurrencies = data;

    populateBaseCurrencies(data);
    filteredCurrencies = Object.entries(data);
    renderCurrencyCheckboxes(filteredCurrencies);
  } catch (error) {
    showError(error.message || "Something went wrong while fetching currencies.");
  } finally {
    hideLoading();
  }
}

function populateBaseCurrencies(currencies) {
  baseCurrencySelect.innerHTML = "";

  Object.entries(currencies).forEach(([code, name]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} - ${name}`;
    if (code === "USD") option.selected = true;
    baseCurrencySelect.appendChild(option);
  });
}

function renderCurrencyCheckboxes(currencyEntries) {
  const base = baseCurrencySelect.value;

  currencyList.innerHTML = "";

  const visibleCurrencies = currencyEntries.filter(([code]) => code !== base);

  visibleCurrencies.forEach(([code, name]) => {
    const wrapper = document.createElement("label");
    wrapper.className = "currency-item";

    const checked = selectedTargets.includes(code) ? "checked" : "";

    wrapper.innerHTML = `
      <input type="checkbox" value="${code}" ${checked} />
      <span><strong>${code}</strong> - ${name}</span>
    `;

    const checkbox = wrapper.querySelector("input");
    checkbox.addEventListener("change", handleTargetSelection);

    currencyList.appendChild(wrapper);
  });
}

function handleTargetSelection(e) {
  const code = e.target.value;

  if (e.target.checked) {
    if (!selectedTargets.includes(code)) {
      selectedTargets.push(code);
    }
  } else {
    selectedTargets = selectedTargets.filter(item => item !== code);
  }
}

function handleSearch() {
  const query = searchCurrencyInput.value.trim().toLowerCase();

  filteredCurrencies = Object.entries(allCurrencies).filter(([code, name]) => {
    return (
      code.toLowerCase().includes(query) ||
      name.toLowerCase().includes(query)
    );
  });

  renderCurrencyCheckboxes(filteredCurrencies);
}

function getLast7BusinessDates() {
  const dates = [];
  const today = new Date();
  let count = 0;
  let i = 1;

  while (count < 7) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(d);
      count++;
    }
    i++;
  }

  dates.reverse();
  return dates;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

async function fetchHistoricalRates(base, symbol) {
  const dates = getLast7BusinessDates();
  const from = formatDate(dates[0]);
  const to = formatDate(dates[dates.length - 1]);

  const url = `https://api.frankfurter.dev/v1/${from}..${to}?base=${base}&symbols=${symbol}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch history for ${symbol}`);
  }

  const data = await response.json();

  const values = Object.values(data.rates || {}).map(dayRate => dayRate[symbol]).filter(Boolean);
  return values;
}

function createSparkline(values) {
  if (!values.length) {
    return `<p class="note">No 7-day history available</p>`;
  }

  const max = Math.max(...values);
  const min = Math.min(...values);

  const bars = values
    .map(value => {
      let height = 20;

      if (max !== min) {
        height = 20 + ((value - min) / (max - min)) * 40;
      }

      return `<div class="spark-bar" style="height:${height}px" title="${value.toFixed(4)}"></div>`;
    })
    .join("");

  return `<div class="sparkline">${bars}</div>`;
}

function sortResults(data) {
  const sortType = sortBySelect.value;

  if (sortType === "code") {
    return data.sort((a, b) => a.code.localeCompare(b.code));
  }

  if (sortType === "alpha") {
    return data.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortType === "value-asc") {
    return data.sort((a, b) => a.value - b.value);
  }

  if (sortType === "value-desc") {
    return data.sort((a, b) => b.value - a.value);
  }

  return data;
}

async function convertCurrencies() {
  const amount = parseFloat(amountInput.value);
  const base = baseCurrencySelect.value;

  resultsEl.innerHTML = "";
  lastUpdatedEl.textContent = "";

  if (!amount || amount <= 0) {
    showError("Please enter a valid amount.");
    return;
  }

  if (selectedTargets.length === 0) {
    showError("Please select at least one target currency.");
    return;
  }

  showLoading();
  clearError();

  try {
    const symbols = selectedTargets.join(",");
    const url = `${latestUrl}?base=${base}&symbols=${symbols}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Could not fetch latest exchange rates.");
    }

    const data = await response.json();
    const rates = data.rates || {};

    let resultsData = await Promise.all(
      Object.entries(rates).map(async ([code, rate]) => {
        let history = [];
        try {
          history = await fetchHistoricalRates(base, code);
        } catch (error) {
          history = [];
        }

        return {
          code,
          name: allCurrencies[code] || code,
          value: amount * rate,
          rate,
          history
        };
      })
    );

    resultsData = sortResults(resultsData);
    renderResults(resultsData, amount, base, data.date);
  } catch (error) {
    showError(error.message || "Conversion failed.");
  } finally {
    hideLoading();
  }
}

function renderResults(results, amount, base, date) {
  if (!results.length) {
    resultsEl.innerHTML = `<div class="empty-state">No results found.</div>`;
    return;
  }

  lastUpdatedEl.textContent = `Last Updated: ${date}`;

  resultsEl.innerHTML = results
    .map(item => {
      return `
        <div class="result-card">
          <h3>${item.name}</h3>
          <p class="code">${item.code}</p>
          <p class="value">${item.value.toFixed(2)} ${item.code}</p>
          <p>${amount} ${base} × ${item.rate.toFixed(4)}</p>
          ${createSparkline(item.history)}
          <p class="note">Last 7-day trend</p>
        </div>
      `;
    })
    .join("");
}

function clearSelections() {
  selectedTargets = [];
  searchCurrencyInput.value = "";
  filteredCurrencies = Object.entries(allCurrencies);
  renderCurrencyCheckboxes(filteredCurrencies);
  resultsEl.innerHTML = `<div class="empty-state">Select currencies and click convert.</div>`;
  lastUpdatedEl.textContent = "";
  clearError();
}

baseCurrencySelect.addEventListener("change", () => {
  selectedTargets = selectedTargets.filter(code => code !== baseCurrencySelect.value);
  renderCurrencyCheckboxes(filteredCurrencies.length ? filteredCurrencies : Object.entries(allCurrencies));
});

searchCurrencyInput.addEventListener("input", handleSearch);
sortBySelect.addEventListener("change", () => {
  const cardsExist = resultsEl.children.length > 0;
  if (cardsExist && !resultsEl.querySelector(".empty-state")) {
    convertCurrencies();
  }
});
convertBtn.addEventListener("click", convertCurrencies);
clearBtn.addEventListener("click", clearSelections);

fetchCurrencies().then(() => {
  resultsEl.innerHTML = `<div class="empty-state">Select currencies and click convert.</div>`;
});