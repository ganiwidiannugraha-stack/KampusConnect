const fs = require('fs');
const { marked } = require('marked');

const mdPath = 'D:\\PROJECT VIBE\\SI\\Draf_Code_Review_Gani.md';
const mdContent = fs.readFileSync(mdPath, 'utf8');

const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Draf Code Review Gani</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1, h2, h3 { color: #2c3e50; }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h2 { margin-top: 30px; }
    pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; border: 1px solid #e9ecef; }
    code { font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; font-size: 14px; }
    p code { background: #f1f3f5; padding: 2px 5px; border-radius: 3px; }
    blockquote { border-left: 4px solid #007bff; margin: 0; padding-left: 15px; color: #555; background: #f8f9fa; padding: 10px 15px; }
    hr { border: 0; border-top: 1px solid #eee; margin: 30px 0; }
  </style>
</head>
<body>
  ${marked(mdContent)}
  
  <script>
    // Automate print dialog when opened
    window.onload = function() {
      // window.print();
    }
  </script>
</body>
</html>
`;

fs.writeFileSync('D:\\PROJECT VIBE\\SI\\Draf_Code_Review_Gani.html', htmlContent);
console.log("HTML generated!");
