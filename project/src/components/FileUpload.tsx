import React, { useCallback, useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface FileUploadProps {
  onAnalysisComplete: (backendData: any, file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onAnalysisComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState("");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF, DOCX, or TXT file.");
      return false;
    }

    if (file.size > maxSize) {
      setError("File size must be less than 10MB.");
      return false;
    }

    setError(null);
    return true;
  };

  const uploadToBackend = async (file: File) => {
    if (!jobRole) {
      setError("Please select a job role first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_role", jobRole);

    try {
      const response = await fetch(
        "https://ai-resume-analyzer-1-7tca.onrender.com/analyze-resume-role",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Backend returned an error");
      }

      const result = await response.json();

      // IMPORTANT DEBUG LOGS
      console.log("========== BACKEND RESPONSE ==========");
      console.log(result);
      console.log("Education from backend:", result.education);
      console.log("=====================================");

      // Send exact backend JSON to dashboard
      onAnalysisComplete(result, file);

    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to connect to backend server.");
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;

      if (files && files.length > 0) {
        const file = files[0];

        if (validateFile(file)) {
          uploadToBackend(file);
        }
      }
    },
    [jobRole]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];

      if (validateFile(file)) {
        uploadToBackend(file);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Upload Your Resume
        </h2>

        <p className="text-slate-600 max-w-2xl mx-auto">
          Get instant AI-powered insights about your resume including skill
          analysis, experience evaluation, and optimization recommendations.
        </p>
      </div>

      {/* Job Role Selector */}
      <div className="mb-6 text-center">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Job Role
        </label>

        <select
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          className="border border-slate-300 rounded-lg px-4 py-2"
        >
          <option value="">Choose Job Role</option>
          <option value="data scientist">Data Scientist</option>
          <option value="python developer">Python Developer</option>
          <option value="frontend developer">Frontend Developer</option>
          <option value="machine learning engineer">
            Machine Learning Engineer
          </option>
        </select>
      </div>

      {/* Drag & Drop Box */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
      >
        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDragging ? "bg-blue-100" : "bg-slate-100"
            }`}
          >
            <Upload
              className={`w-8 h-8 ${
                isDragging ? "text-blue-600" : "text-slate-500"
              }`}
            />
          </div>

          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {isDragging ? "Drop your resume here" : "Drag & drop your resume"}
          </h3>

          <p className="text-slate-600 mb-6">or click to browse your files</p>

          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Choose File
          </button>

          <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-slate-500">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              PDF
            </div>

            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              DOCX
            </div>

            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              TXT
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
