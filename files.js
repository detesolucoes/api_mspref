const express = require('express');
const app = express();

app.use('/report', express.static(__dirname + '/reports'));

app.listen(3334, () => {
    console.log("Servidor iniciado.");
});