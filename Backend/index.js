const express = require('express');
const cors = require('cors');
const pdfcrowd = require('pdfcrowd');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

const port = 5555;

// Multer storage configuration
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.post('/upload', upload.single('htmlFile'), (req, res) => {
    const htmlFilePath = req.file.path;
    const client = new pdfcrowd.HtmlToPdfClient('Dhruv_Suhagiya', '6696a9cc13d86fea6b1e4284312610ab');

    // Configure the conversion options here
    // (uncomment and set the options if needed)

    try {
        client.convertFileToFile(htmlFilePath, "result.pdf", (err, fileName) => {
            if (err) {
                console.error("Pdfcrowd Error: " + err);
                return res.status(500).json({ error: "Pdfcrowd Error: " + err });
            }

            console.log("Success: the file was created " + fileName);

            const pdfFile = fs.createReadStream(fileName);
            pdfFile.pipe(res);

            pdfFile.on('end', () => {
                fs.unlinkSync(fileName);
                fs.unlinkSync(htmlFilePath);
            });
        });
    } catch (why) {
        console.error("Pdfcrowd Error: " + why);
        return res.status(500).json({ error: "Pdfcrowd Error: " + why });
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
