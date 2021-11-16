const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const zipDirectory = (source, out) => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
};

const source = path.resolve(__dirname, "..", "hungarify");
const outDir = path.resolve(__dirname, "..", "dist");

!fs.existsSync(outDir) && fs.mkdirSync(outDir);

zipDirectory(source, path.resolve(outDir, "hungarify.zip"));
