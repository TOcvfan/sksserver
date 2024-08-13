const path = require('path');
const fs = require('fs');
const multer = require('multer');

const dateZero = (d) => d < 10 ? '0' + d : '' + d;
let count;
let fileName;
count = 0;
let billedeNavn = 'Intet billede';


const tegn = (text) => {
    const charMap = {
        'æ': 'ae',
        'ø': 'oe',
        'å': 'aa',
        'Æ': 'AE',
        'Ø': 'OE',
        'Å': 'AA',
        '&': 'og',
    };
    return text.split('').map(char => charMap[char] || char).join('');
}
let sti = "";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folderName = "";
        const { titel, logo, begivenhed } = req.body;
        if (titel && !begivenhed) {
            folderName = 'bestyrelsen'
        } else if (logo) {
            folderName = 'logoer'
        } else if (begivenhed) {
            folderName = `begivenheder/${begivenhed}/${titel}`
        }

        const mappe = tegn(folderName.replace(/\s/g, '')).toLowerCase();
        sti = `./public/${mappe}`
        if (!fs.existsSync(sti)) {
            fs.mkdirSync(sti, { recursive: true });
        }

        cb(null, sti);
    },
    filename: function (req, file, cb) {
        fileName = dateZero(new Date().getDate()) + dateZero(new Date().getMonth() + 1) + new Date().getFullYear() + dateZero(new Date().getHours()) + dateZero(new Date().getMinutes());
        const { titel, navn } = req.body;
        const ext = path.extname(file.originalname);
        const navnefil = titel ? titel : navn
        const filnavn = tegn(navnefil.replace(/\s/g, '')).toLowerCase();

        let endeligtfilnavn = fileName + '_' + filnavn + ext;
        billedeNavn = endeligtfilnavn.toLowerCase();

        const stiMedFil = sti + '/' + billedeNavn;
        if (fs.existsSync(stiMedFil)) {
            count++
            billedeNavn = fileName + '_' + count + '_' + filnavn + ext;
            const nySti = sti + '/' + billedeNavn;
            if (fs.existsSync(nySti)) {
                count++
                billedeNavn = fileName + '_' + count + '_' + filnavn + ext;
            }
        }

        cb(null, billedeNavn);
    }
});

function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

const uploadBillede = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = uploadBillede;