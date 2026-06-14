import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const diskStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, "uploads/"),
    filename: (_req, file, cb) => {
        const unique = `${uuidv4()}-${file.originalname}`;
        cb(null, unique);
    },
});

const memoryStorage = multer.memoryStorage();

const pdfOnlyFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".pdf") {
        return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
};

const evidenceFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const allowed = [".pdf", ".xlsx", ".csv"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
        return cb(new Error("Only PDF, XLSX, and CSV files are allowed"));
    }
    cb(null, true);
};

const upload = multer({
    storage: diskStorage,
    fileFilter: pdfOnlyFilter,
    limits: { fileSize: 20 * 1024 * 1024 },
});

const uploadEvidence = multer({
    storage: memoryStorage,
    fileFilter: evidenceFilter,
    limits: { fileSize: 20 * 1024 * 1024 },
});

export { upload, uploadEvidence };
