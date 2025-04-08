const express = require('express');
const nodeHtmlToImage = require('node-html-to-image');

const badgeHandler = async (req, res) => {
    const icon = req.query.icon || req.params.icon || req.url.split('/badge/')[1]?.split('?')[0];
    const { style = 'fa-brands', color = 'ffffff', bg = '31A8FF', text = '', textColor = '000000' } = req.query;

    const html = `
    <html>
    <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
        <style>            body { 
                margin: 0; 
                padding: 0; 
                width: fit-content;
                height: fit-content;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                text-rendering: optimizeLegibility;
            }
            .badge {
                display: inline-flex;
                align-items: center;
                background: #${bg};
                padding: 8px 12px;
                border-radius: 6px;
                font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
                height: 24px;
                white-space: nowrap;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .badge i {
                color: #${color};
                margin-right: 8px;
                font-size: 16px;
                display: flex;
                align-items: center;
            }
            .badge span {
                color: #${textColor};
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.01em;
            }
        </style>
    </head>
    <body>
        <div class="badge">
            <i class="${style} ${icon}"></i>
            <span>${text}</span>
        </div>
    </body>
    </html>`; const image = await nodeHtmlToImage({
        html,
        transparent: true,
        puppeteerArgs: {
            executablePath: process.env.CHROME_BIN || null,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: {
                width: 1200,
                height: 1200,
                deviceScaleFactor: 4
            }
        },
        selector: '.badge',
        waitUntil: 'networkidle0',
        quality: 100,
        type: 'png'
    });

    res.writeHead(200, { 'Content-Type': 'image/png' }); res.end(image, 'binary');
};

// Check if running in Vercel
if (process.env.VERCEL) {
    module.exports = badgeHandler;
} else {
    const app = express();
    const port = process.env.PORT || 3000;

    app.get('/badge/:icon', badgeHandler);
    app.get('/api/badge/:icon', badgeHandler);

    app.listen(port, () => {
        console.log(`Badge API server running at http://localhost:${port}`);
    });
}
