import { test } from "@playwright/test";

test("debug btn-shop click", async ({ page }) => {
  // Wait for canvas
  await page.locator("#game-container canvas").waitFor({ state: "visible" });
  
  // Check if button exists in body
  const allButtons = page.locator("button");
  const buttonCount = await allButtons.count();
  console.log("All button count:", buttonCount);
  
  // Check for btn-shop specifically
  const shopButton = page.locator("#btn-shop");
  console.log("btn-shop count:", await shopButton.count());
  console.log("btn-shop visible:", await shopButton.isVisible());
  
  // Print outerHTML of body
  const bodyHTML = await page.locator("body").innerHTML();
  console.log("Body contains btn-shop:", bodyHTML.includes("btn-shop"));
  console.log("Body contains command-buttons:", bodyHTML.includes("command-buttons"));
  
  // List all buttons with their IDs
  for (let i = 0; i < buttonCount; i++) {
    const btn = allButtons.nth(i);
    const id = await btn.getAttribute("id");
    const text = await btn.innerText();
    console.log(`Button ${i}: id=${id}, text=${text.trim()}`);
  }
});
