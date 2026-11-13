import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const theme of ["light","dark"]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: theme });
  await p.goto("http://127.0.0.1:3977/");
  await p.evaluate((t)=>document.documentElement.setAttribute("data-sherick-theme",t), theme);
  await p.waitForTimeout(300);
  await p.locator("#display").screenshot({ path: "/tmp/claude-1000/-home-sherick--t3-worktrees-sherick-ui-t3-09a81764-98ff6026a309ab21/c0fe856d-85b0-448a-82c9-5227212d6ddd/scratchpad/real-display-"+theme+".png" });
  await p.goto("http://127.0.0.1:3977/verification/overview");
  await p.evaluate((t)=>{document.documentElement.setAttribute("data-sherick-theme",t); document.querySelector("main").style.backgroundImage="var(--sui-canvas-wash)";}, theme);
  await p.waitForTimeout(300);
  await p.screenshot({ path: "/tmp/claude-1000/-home-sherick--t3-worktrees-sherick-ui-t3-09a81764-98ff6026a309ab21/c0fe856d-85b0-448a-82c9-5227212d6ddd/scratchpad/real-overview-"+theme+".png" });
}
await b.close();
