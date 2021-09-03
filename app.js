const express = require('express');
const app = express();

const http = require("http");
const puppeteer = require('puppeteer'); 
const delay = require('delay');
const path = require('path');
const mkdirp = require('mkdirp');
var fs = require('fs');
var os = require('os');

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Dete Soluções - www.detesolucoes.com.br");
});

/**
 * @param {page from where you want to download file } page
 * @param {downloadLocation , directory where you want to save a file } downloadLocation
 */
async function downloadFile(page, downloadLocation){
    const downloadPath = path.resolve(downloadLocation)
    mkdirp(downloadPath)
    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath,
    })
}

app.post("/get-report", (req, res) => {
    (async () => {    
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
            headless: true,
        });

        const page = await browser.newPage();

        await page.goto(req.body.urlLogin);
        await delay(1000);
        await page.goto(req.body.urlReport);

        await downloadFile(page, req.body.directoryFiles);

        await page.type('[name="User"]', req.body.access_user);
        await page.type('[name="Password"]', req.body.access_pass);
        await page.click('[value="View Report"]');

        await delay(3000);

        // renomeando o arquivo
        fs.rename(__dirname+'/'+req.body.directoryFiles+'/reportviewer.pdf', __dirname+'/'+req.body.directoryFiles+'/'+req.body.file, function(err) {
            if ( err ){ 
                console.log('ERROR: ' + err);
                return;
            }
        });

        await browser.close();

        const pathFile = __dirname+'/'+req.body.directoryFiles+'/'+req.body.file;

        try {
            if (fs.existsSync(pathFile)) {
                return res.json({status: "success", message: "Relatório gerado com sucesso", file: pathFile, error: null});
            }
        } catch(err) {
            console.error("Ops! "+err)
            return res.json({status: "error", message: "Erro ao gerar relatório", file: null, error: err});
        }
    })();
});

app.listen(3333, () => {
    console.log("Servidor iniciado.");
});

// acesso ao arquivo via url estatica
const app2 = express();

app2.use('/report', express.static(__dirname + '/reports'));

app2.listen(3334, () => {
    console.log("Servidor iniciado.");
});