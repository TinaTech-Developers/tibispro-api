import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const fileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } }).onUploadComplete(
    async ({ file }) => {
      return { url: file.url };
    },
  ),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
