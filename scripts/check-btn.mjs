import { spawn } from 'child_process';

const http = new import('http');

const server = spawn('node', ['--import=tsx', '--eval', `
const http = require("http");
http.createServer((req, res) => {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    const url = req.url || "";
    if (url === "/") {
      const fs = require("fs");
      let html = fs.readFileSync("dist/index.html", "utf8");
      // Check for our buttons
      const hasBtnShop = html.includes('id="btn-shop"');
      const hasCommandButtons = html.includes('class="command-buttons"');
      console.log(`has btn-shop: ${hasBtnShop}`);
      console.log(`has command-buttons: ${hasCommandButtons}`);
      res.writeHead(200, {"Content-Type": "text/plain"});
      res.end(`${hasBtnShop}:${hasCommandButtons}`);
    } else {
      res.writeHead(404);
      res.end("not found");
    }
  });
}).listen(4173, () => console.log("Server running on 4173"));
`)];
setTimeout(() => {
  http.get("http://localhost:4173/", (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => console.log("Result:", data));
    server.kill();
  });
}, 500);
