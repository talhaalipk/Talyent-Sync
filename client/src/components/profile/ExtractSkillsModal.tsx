import { useState } from "react";
import api from "../../utils/axiosInstance";
import { X } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import * as docx from "docx-preview";

// PDF worker set (Vite ke liye zaroori)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface Props {
  onClose: () => void;
}

export default function ExtractSkillsModal({ onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // extract text
  const readFileText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // ✅ Handle PDF
      if (file.type === "application/pdf") {
        reader.onload = async () => {
          try {
            const typedArray = new Uint8Array(reader.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              text += content.items.map((item: any) => item.str).join(" ") + "\n";
            }
            resolve(text);
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsArrayBuffer(file);
      }

      // ✅ Handle DOCX
      else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        reader.onload = async () => {
          try {
            const arrayBuffer = reader.result as ArrayBuffer;
            const text = await extractDocxText(arrayBuffer);
            resolve(text);
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsArrayBuffer(file);
      }

      // ✅ Handle Plain Text
      else {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      }
    });
  };

  // DOCX text extraction helper
  const extractDocxText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const zip = await docx.renderAsync(arrayBuffer); // renderAsync returns text/html
    return zip.textContent || "Unable to extract text from docx";
  };

  // handle upload
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const text = await readFileText(file);

      const res = await api.post("/profile/extract-skills", {
        cvText: text,
      });

      if (res.data.success) {
        setSkills(res.data.data.extractedSkills.skills || []);
        setMessage(res.data.message || "Skills extracted successfully");
      } else {
        setMessage(res.data.message || "Extraction failed");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || err.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Extract Skills from CV</h2>

        <input
          type="file"
          accept=".txt,.doc,.docx,.pdf"
          onChange={handleFileChange}
          className="mb-4 block w-full text-gray-700 border border-gray-300 rounded-lg cursor-pointer"
        />

        {file && <p className="text-sm text-gray-500 mb-2">Selected: {file.name}</p>}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Extracting..." : "Upload & Extract"}
        </button>

        {/* toaster/message */}
        {message && <div className="mt-4 text-sm text-center text-green-600">{message}</div>}

        {/* extracted skills */}
        {skills.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Extracted Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {s} ,
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
