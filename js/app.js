this.state = {
    selectedYear: 0,
    selectedMonth: 0,
    getYear: function () {
        return this.selectedYear;
    },

    getMonth: function () {
        return this.selectedMonth;
    },

    setYear: function (year) {
        this.selectedYear = year;
        console.log("Changed year property of state object to " + this.selectedYear);
    },

    setMonth: function (month) {
        this.selectedMonth = month;
        console.log("Changed month property of state object to " + this.selectedMonth);
    },
}

this.state.selectedCurrency = {
    get: function (value) {
        if (!this[value]) {
            return "property not found";
        }

        return this[value];
    },
    set: function (id, name) {
        this.id = id;
        this.name = name;

        console.log("Changed selectedCurrency object child of state object. New id is: " + this.id + " and new name is: " + this.name);
    }
}

function init() {
    console.log("initialising app");

    this.getElements();
    this.addEventListeners();
    this.populateForms();
}

function reset() {
    this.cryptoInputvalue.value = "";
}

function getElements() {
    this.app = document.getElementById("app");
    this.cryptoInputvalue = document.getElementById("cryptoInputvalue");
    this.cryptoSelectCrypto = document.getElementById("cryptoSelectCrypto");
    this.cryptoSelectMonth = document.getElementById("cryptoSelectMonth");
    this.cryptoSelectYear = document.getElementById("cryptoSelectYear");
    this.cryptoResult = document.getElementById("cryptoResult");
    this.cryptoCalculateButton = document.getElementById("calculateCrypto");
}

function addEventListeners() {
    this.cryptoSelectCrypto.addEventListener("change", changeCurrency);
    this.cryptoSelectYear.addEventListener("change", changeYear);
    this.cryptoSelectMonth.addEventListener("change", changeMonth);
    this.cryptoCalculateButton.addEventListener("click", displayResult);
}

function populateForms() {
    let selectedCurrency = "";

    populateSelectCurrencies();

    let selectedCurrencyName = this.cryptoSelectCrypto.options[this.cryptoSelectCrypto.selectedIndex].label;
    let selectedCurrencyId = findId(selectedCurrencyName);

    this.state.selectedCurrency.set(selectedCurrencyId, selectedCurrencyName);

    populateDates(selectedCurrencyId);
}

function populateDates(coinId) {
    let coinHistoryData = getHistoricalData(coinId);

    this.cryptoSelectYear.options.length = 0;

    populateSelectYears(coinHistoryData);

    let selectedYear = this.cryptoSelectYear.options[this.cryptoSelectYear.selectedIndex].label;

    this.state.setYear(selectedYear);

    populateSelectMonths(coinHistoryData, selectedYear);

    let selectedMonth = this.cryptoSelectMonth.options[this.cryptoSelectMonth.selectedIndex].label;

    this.state.setMonth(convertMonthToNumber(selectedMonth));
}

function populateSelectCurrencies() {
    for (let i = 0; i < coinsHistoricalData.length; i++) {
        if (coinsHistoricalData[i].name) {
            let option = document.createElement("option");
                option.text = coinsHistoricalData[i].name;
            this.cryptoSelectCrypto.options.add(option);
        }
    }
}

function populateSelectYears(data) {
    this.cryptoSelectMonth.options.years = 0;

    for (let i = 0; i < data.length; i++) {
        let yearData = data[i];
        let year = Object.keys(yearData)[0];
        let yearOption = document.createElement("option");
            yearOption.text = year;
        this.cryptoSelectYear.options.add(yearOption);
    }
}

function populateSelectMonths(data, year) {
    this.cryptoSelectMonth.options.length = 0;

    for (let i = 0; i < data.length; i++) {
        let yearData = data[i];
        if (Object.keys(yearData)[0] === year) {
            for (var month in yearData[year]) {
                if(yearData[year].hasOwnProperty(month)) {
                    let monthOption = document.createElement("option");
                    monthOption.text = monthNames[month];
                    this.cryptoSelectMonth.options.add(monthOption);
                }
            }
        }
    }
}

function findId (name) {
    if (!name) {
        return;
    }

    for (let i = 0; i < coinsHistoricalData.length; i++) {
        if (coinsHistoricalData[i].name === name) {
            return coinsHistoricalData[i].id;
        }
    }
}

const changeCurrency = (event) => {
    event.preventDefault();
    if (!event.currentTarget || !event.currentTarget.options) {
        console.log("nothing selected");
        return;
    }
    let selectedCurrencyName = event.currentTarget[event.currentTarget.selectedIndex].label;
    let selectedCurrencyId = findId(selectedCurrencyName);

    let coinHistoryData = getHistoricalData(selectedCurrencyId);
    this.state.selectedCurrency.set(selectedCurrencyId, selectedCurrencyName);

    populateDates(selectedCurrencyId);
}

const changeYear = (event) => {
    let selectedYear =  event.currentTarget[event.currentTarget.selectedIndex].label;
    let coinHistoryData = getHistoricalData(this.state.selectedCurrency.get("id"));

    this.state.setYear(selectedYear);

    populateSelectMonths(coinHistoryData, selectedYear);
}

const changeMonth = (event) => {
    let monthName = event.currentTarget[event.currentTarget.selectedIndex].label;

    this.state.setMonth(convertMonthToNumber(monthName));
}

function convertMonthToNumber(monthName) {
    for (var month in monthNames) {
        if (monthNames[month] === monthName) {
            return month;
        }
    }
}

const getHistoricalData = (coinId) => {
    for (let i = 0; i < coinsHistoricalData.length; i++) {
        if (coinsHistoricalData[i].id === coinId) {
            return coinsHistoricalData[i].historicData;
        }
    }
}

const displayResult = (event) => {
    event.preventDefault();
    let currentPrice = getCurrentCoinValue(state.selectedCurrency.get("id"));
    let currencyName = this.state.selectedCurrency.get("name");
    let inputValue = cryptoInputvalue.value;
    let month = this.state.getMonth();
    let year = this.state.getYear();
    let historicalValue = getHistoricalValue(this.state.selectedCurrency.get("id"), year, month);

    let result = calculateCoinsValue(parseInt(cryptoInputvalue.value), currentPrice, historicalValue);
    console.log("display result: " + result);
    this.cryptoResult.innerHTML = `If you invested ${inputValue} in ${currencyName} on highest point in ${monthNames[month]}, ${year} today you would have ${result} $.`;
    reset();
}

const calculateCoinsValue = (investedValue, currentPrice, historicalPrice) => {
    if (!investedValue) {
        return "you havent entered any value for your investment";
    }

    if (!currentPrice) {
        return "current price of chosen asset is not available";
    }

    if (!historicalPrice) {
        return "there is no data for historical price of the asset";
    }

    return (investedValue / historicalPrice) * currentPrice;
}

const getHistoricalValue = (coinId, year, month) => {
    for (let i = 0; i < coinsHistoricalData.length; i++) {
        if (coinsHistoricalData[i].id === coinId) {
            let coinHistoricData = coinsHistoricalData[i].historicData;
            for (let j = 0; j < coinHistoricData.length; j++) {
                if (Object.keys(coinHistoricData[j])[0] === year) {
                    return coinHistoricData[j][year][month];
                }
            }
        }
    }
};

const getCurrentCoinValue = (coinId) => {
    if(!coinId || !coinsCurrentPrices.length) {
        return;
    }

    for (let i = 0; i < coinsCurrentPrices.length; i++) {
        if (coinsCurrentPrices[i].id === coinId) {
            return coinsCurrentPrices[i].price;
        }
    }
};

init();