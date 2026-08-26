import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE: " + m.text()); });

await page.goto("http://localhost:5176/about", { waitUntil: "domcontentloaded", timeout: 30000 });
await new Promise((r) => setTimeout(r, 3000));

const text = (await page.evaluate(() => document.body.innerText));
console.log("HAS ELITE:", text.includes("ELITE WEB ALLIES"));
console.log("HAS PREMIUM:", text.includes("PREMIUM WEB ALLIES"));
console.log("HAS SPONSOR 06:", text.includes("SPONSOR 06"));
console.log("HAS ABOUT SGC:", text.includes("ABOUT STUDENT GUIDANCE CELL"));
console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
