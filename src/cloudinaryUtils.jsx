import axios from "axios";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dmd34njls/upload"; 
const CLOUDINARY_PRESET = "ml_default";

export const uploadFileToCloudinary = async (file, folder) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("folder", folder);

  try {
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.secure_url; 
  } catch (error) {
    console.error("Lỗi khi tải tệp lên Cloudinary:", error);
    throw error;
  }
};

export const deleteFileFromCloudinary = async (publicId) => {
  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/dmd34njls/delete_by_token`,
      { token: publicId }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa tệp trên Cloudinary:", error);
    throw error;
  }
};