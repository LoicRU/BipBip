import multer from "multer";
import { AppError } from "../../utils/error.js";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];

function hasAllowedExtension(filename) {
  const lower = String(filename || "").toLowerCase();
  return ALLOWED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export const uploadApplicationCv = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!hasAllowedExtension(file.originalname)) {
      callback(new AppError(400, "Le CV doit etre un fichier PDF, DOC, DOCX ou TXT."));
      return;
    }

    callback(null, true);
  },
});
