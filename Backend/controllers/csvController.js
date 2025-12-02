import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";

export const uploadCSV = async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname.split(".")[0];

    const rows = [];
    let headers = [];

    // STEP 1 → Read CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("headers", (h) => (headers = h))
        .on("data", (data) => rows.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    // STEP 2 → Detect Types
    const detectType = (value) => {
      if (!value) return String;

      // Number?
      if (!isNaN(value)) return Number;

      // Boolean?
      if (value.toLowerCase() === "true" || value.toLowerCase() === "false")
        return Boolean;

      // Date?
      if (!isNaN(Date.parse(value))) return Date;

      return String;
    };

    const schemaObj = {};
    headers.forEach((h) => {
      const sampleValue = rows[0][h];
      schemaObj[h] = { type: detectType(sampleValue) };
    });

    // STEP 3 → Create dynamic schema
    const dynamicSchema = new mongoose.Schema(schemaObj);

    let Model;
    if (mongoose.models[fileName]) {
      Model = mongoose.models[fileName];
    } else {
      Model = mongoose.model(fileName, dynamicSchema);
    }

    // STEP 4 → Insert data
    await Model.insertMany(rows);

    // STEP 5 → AUTO-GENERATE MODEL FILE
    const schemaLines = Object.entries(schemaObj)
      .map(([key, val]) => `  ${key}: ${val.type.name}`)
      .join(",\n");

    const modelContent = `
import mongoose from "mongoose";

const ${fileName}Schema = new mongoose.Schema({
${schemaLines}
});

export default mongoose.model("${fileName}", ${fileName}Schema);
`;

    fs.writeFileSync(`models/${fileName}.model.js`, modelContent);

    // Cleanup
    fs.unlinkSync(filePath);

    res.json({
      status: "Success",
      message: "CSV Uploaded → Model Created → File Saved → Data Inserted",
      modelFile: `${fileName}.model.js`,
      inserted: rows.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
