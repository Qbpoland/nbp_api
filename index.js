// Importujemy wymagane moduły
const express = require('express');
const axios = require('axios');

// Tworzymy aplikację Express
const app = express();
const port = 3000;

// Zmienne do przechowywania czasu ostatniego odświeżenia danych i kursów walut
let lastRefreshTime = null;
let currencyRates = {};

// Funkcja do pobierania kursów walut z NBP API
async function fetchCurrencyRates() {
  try {
    // Pobieramy dane z API NBP
    const response = await axios.get('http://api.nbp.pl/api/exchangerates/tables/A');
    const data = response.data[0];
    const rates = {};

    // Przetwarzamy dane i tworzymy obiekt z kursami
    data.rates.forEach(rate => {
      rates[rate.code] = rate.mid;
    });

    // Aktualizujemy zmienne z kursami i czasem odświeżenia
    currencyRates = rates;
    lastRefreshTime = new Date();
    console.log('Dane kursów odświeżone.');
  } catch (error) {
    console.error('Wystąpił błąd podczas odświeżania danych kursów.');
  }
}

// Pobieramy kursy walut przy starcie serwera
fetchCurrencyRates();

// Middleware do sprawdzania czasu odświeżenia danych
function checkDataFreshness(req, res, next) {
  // Sprawdzamy, czy są dane lub czy dane są starsze niż 5 minut
  if (!lastRefreshTime || (new Date() - lastRefreshTime) > 5 * 60 * 1000) {
    // Jeśli dane są starsze lub nie ma danych, odświeżamy
    fetchCurrencyRates();
  }
  next();
}

// Dodajemy middleware do każdego żądania
app.use(checkDataFreshness);

// Endpointy dla kursów walut
app.get('/dolar', (req, res) => {
  // Zwracamy kurs dolara w formacie JSON
  res.json(currencyRates['USD']);
});

app.get('/euro', (req, res) => {
  // Zwracamy kurs euro w formacie JSON
  res.json(currencyRates['EUR']);
});

app.get('/funt', (req, res) => {
  // Zwracamy kurs funta szterlinga w formacie JSON
  res.json(currencyRates['GBP']);
});

// Startujemy serwer na określonym porcie
app.listen(port, () => {
  console.log(`Serwer nasłuchuje na porcie ${port}`);
});
