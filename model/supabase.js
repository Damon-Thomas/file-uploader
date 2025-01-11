const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const uploadFile = async (filePath, buffer, fileContentType) => {
  const { data, error } = await supabase.storage
    .from("files")
    .upload(filePath, buffer, {contentType: fileContentType});

  if (error) {
    console.error("Error uploading file:", error);
    return null
  } else {
    console.log("File uploaded successfully:", data);
    return true
  }
};

const downloadFile = async (path) => {
  const { data, error } = await supabase.storage.from("files").download(path);

  if (error) {
    console.error("Error downloading file:", error);
  } else {
    const url = URL.createObjectURL(data);
    console.log("File downloaded successfully:", url);
    return url
    // You can use the URL to display or download the file
  }
};

const getShareableLink = (filePath) => {
  const { data, error } = supabase.storage
    .from("files")
    .getPublicUrl(filePath);

  if (error) {
    console.error("Error getting public URL:", error);
    return null;
  } else {
    console.log("Link Success! Shareable link:", data, data.publicUrl);
    return data.publicUrl;
    // You can share the public URL with anyone
  }
};
// Example usage



// async function uploadFile(filePath, file) {
//   const { data, error } = await supabase.storage
//     .from("files")
//     .upload(filePath, file);
//   if (error) {
//     console.error("Error uploading file:", error);
//     return null;
//   } else {
//     console.log("File uploaded successfully:", data);
//     return data;
//   }
// }

// async function getFileUrl(filePath) {
//   const { data, error } = supabase.storage.from("files").getPublicUrl(filePath);
//   if (error) {
//     console.error("Error getting file URL:", error);
//     return null;
//   } else {
//     console.log("File public URL:", data.publicUrl);
//     return data.publicUrl;
//   }
// }

module.exports = {
  uploadFile,
  downloadFile,
  getShareableLink,
};
