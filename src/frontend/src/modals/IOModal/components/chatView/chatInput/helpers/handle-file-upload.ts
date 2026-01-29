import { api } from "@/controllers/API/api";
import { getURL } from "@/controllers/API/helpers/constants";

/**
 * Handles file upload for chat input
 * @param blob - The file blob to upload
 * @param currentFlowId - The current flow ID
 * @param setFiles - State setter for files
 * @param id - Unique identifier for the file
 */
export default async function handleFileUpload(
  blob: File,
  currentFlowId: string,
  setFiles: React.Dispatch<React.SetStateAction<any[]>>,
  id: string,
): Promise<void> {
  try {
    const formData = new FormData();
    formData.append("file", blob);

    const response = await api.post<any>(
      `${getURL("FILES")}/upload/${currentFlowId}`,
      formData,
    );
    
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id
          ? { ...file, loading: false, path: response.data.file_path }
          : file,
      ),
    );
  } catch (error) {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, loading: false, error: true } : file,
      ),
    );
  }
}
