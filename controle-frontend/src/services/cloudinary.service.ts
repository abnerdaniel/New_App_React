import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = 'djvttda9c';
const CLOUDINARY_UPLOAD_PRESET = 'delivery_app';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const cloudinaryService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.secure_url;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem para o Cloudinary:', error);
      throw error;
    }
  },
};
