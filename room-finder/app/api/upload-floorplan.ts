import { NextResponse } from "next/server";
import { GoogleGenAI, Type, createPartFromUri } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

// --- Clean Gemini Response Helper ---
function cleanGeminiResponse(text: string): string {
  let cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last !== -1) {
    cleaned = cleaned.slice(first, last + 1);
  }
  return cleaned;
}

// --- Upload File to Gemini and Wait ---
async function uploadAndWait(fileBlob: Blob, displayName: string) {
  const file = await client.files.upload({
    file: fileBlob,
    config: { displayName },
  });

  // Wait for Gemini to process the file
  let getFile = await client.files.get({ name: file.name ?? "" });
  while (getFile.state === "PROCESSING") {
    console.log(`Processing ${displayName}...`);
    await new Promise((r) => setTimeout(r, 4000));
    getFile = await client.files.get({ name: file.name ?? "" });
  }

  if (getFile.state === "FAILED") {
    throw new Error(`File processing failed for ${displayName}`);
  }

  return getFile;
}

// --- Generate Floor Plan JSON ---
async function generateFloorPlan({ files }: { files: { uri: string; mimeType: string }[] }) {
  const basePrompt = `
You are an expert in building information modeling (BIM) and indoor mapping.
Analyze the uploaded floor plan PDFs and generate a structured JSON representation
of the building. Extract all rooms, room names, coordinates (approximate bounding boxes),
floor number, and any visible text labels.

Respond **only** with valid JSON in this format:
{
  "building_name": "string",
  "floors": [
    {
      "floor_number": "string or number",
      "rooms": [
        {
          "room_id": "string",
          "room_name": "string",
          "bounding_box": { "x": number, "y": number, "width": number, "height": number },
          "labels": ["string"]
        }
      ]
    }
  ]
}
`.trim();

  const parts: any[] = [{ text: basePrompt }];
  for (const file of files) {
    parts.push(createPartFromUri(file.uri, file.mimeType));
  }

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          building_name: { type: Type.STRING },
          floors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                floor_number: { type: Type.STRING },
                rooms: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      room_id: { type: Type.STRING },
                      room_name: { type: Type.STRING },
                      bounding_box: {
                        type: Type.OBJECT,
                        properties: {
                          x: { type: Type.NUMBER },
                          y: { type: Type.NUMBER },
                          width: { type: Type.NUMBER },
                          height: { type: Type.NUMBER },
                        },
                      },
                      labels: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ["room_id", "room_name"],
                  },
                },
              },
              required: ["floor_number", "rooms"],
            },
          },
        },
        required: ["building_name", "floors"],
      },
    },
  });

  const cleaned = cleanGeminiResponse(response.text || "");
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse Gemini response:", cleaned, err);
    return { building_name: null, floors: [] };
  }
}

// --- POST Handler ---
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadedFiles: { uri: string; mimeType: string }[] = [];

    // ✅ Avoid reading body twice — only convert once
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const blob = new Blob([buffer], { type: file.type || "application/pdf" });
      const uploaded = await uploadAndWait(blob, file.name);
      if (uploaded.uri && uploaded.mimeType) {
        uploadedFiles.push({
          uri: uploaded.uri,
          mimeType: uploaded.mimeType,
        });
      }
    }

    // Generate structured JSON
    const floorplan = await generateFloorPlan({ files: uploadedFiles });

    return NextResponse.json({ floorplan });
  } catch (err: any) {
    console.error("Error generating floor plan:", err);
    return NextResponse.json(
      { error: "Failed to process floor plan", details: err.message },
      { status: 500 }
    );
  }
}
