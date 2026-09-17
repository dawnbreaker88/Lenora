import { Router } from "express";
import multer from "multer";
import { authenticatedUser } from "../middleware/auth.js";
import { deleteDocument, getDocuments, processDocument } from "../services/document.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

export const documentRouter = Router();

documentRouter.get("/", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const documents = await getDocuments(userId);
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

documentRouter.post("/", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file || !["application/pdf", "text/plain", "text/markdown"].includes(req.file.mimetype)) {
      throw new Error("Upload a valid PDF, TXT, or Markdown file");
    }
    const userId = await authenticatedUser(req);
    const result = await processDocument(userId, req.file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

documentRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = await authenticatedUser(req);
    const deleted = await deleteDocument(userId, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    res.json({ message: "Document deleted successfully", id: req.params.id });
  } catch (error) {
    next(error);
  }
});
