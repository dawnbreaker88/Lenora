import { Document } from "../models/Document.js";
import { DocumentChunk } from "../models/DocumentChunk.js";
import { chunkText } from "../rag/chunker.js";
import { generateEmbeddings } from "../rag/embeddings.js";
import { parseDocument } from "../rag/parser.js";

export async function processDocument(userId: string, file: Express.Multer.File) {
  const ext = file.originalname.split(".").pop()?.toLowerCase();
  const isPdf = file.mimetype === "application/pdf" || ext === "pdf";
  const isMarkdown = file.mimetype === "text/markdown" || ext === "md";
  const sourceType = isPdf ? "pdf" : isMarkdown ? "markdown" : "text";

  console.log(`[DOCUMENT UPLOAD] Processing "${file.originalname}" (${file.size} bytes) for user ${userId}...`);

  const document = await Document.create({
    userId,
    title: file.originalname.replace(/\.[^.]+$/, ""),
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    sourceType,
    processingStatus: "processing",
  });

  try {
    const effectiveMime = isPdf ? "application/pdf" : isMarkdown ? "text/markdown" : "text/plain";
    const parsed = await parseDocument(file.buffer, effectiveMime);
    
    if (!parsed.text) {
      throw new Error("Document has no extractable text");
    }

    const chunks = chunkText(parsed.text);
    if (!chunks.length) {
      throw new Error("Could not create chunks from the document content");
    }

    console.log(`[DOCUMENT CHUNKER] Created ${chunks.length} text chunks. Generating embeddings...`);

    const embeddings = await generateEmbeddings(
      chunks.map((chunk) => chunk.content),
      document.title
    );

    console.log(`[DOCUMENT EMBEDDINGS] Generated ${embeddings.length} embeddings. Sample vector length: ${embeddings[0]?.length}`);

    await DocumentChunk.insertMany(
      chunks.map((chunk, index) => ({
        userId,
        documentId: document._id,
        content: chunk.content,
        embedding: embeddings[index],
        chunkIndex: chunk.chunkIndex,
        metadata: chunk.metadata,
      }))
    );

    document.processingStatus = "completed";
    await document.save();

    console.log(
      `[DOCUMENT SAVED] Inserted ${chunks.length} chunks into "${DocumentChunk.db.name}.${DocumentChunk.collection.name}" for document "${document.title}".`
    );

    return {
      id: document.id,
      title: document.title,
      chunks: chunks.length,
      status: document.processingStatus,
    };
  } catch (error) {
    document.processingStatus = "failed";
    await document.save();
    console.error("[DOCUMENT PROCESSING ERROR]", error);
    throw error;
  }
}

export async function getDocuments(userId: string) {
  return Document.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function deleteDocument(userId: string, documentId: string) {
  const document = await Document.findOneAndDelete({ _id: documentId, userId });
  if (!document) return null;
  await DocumentChunk.deleteMany({ documentId, userId });
  return document;
}
