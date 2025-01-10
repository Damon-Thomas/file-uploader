
const {createClient} = require('@supabase/supabase-js')
require('dotenv').config()


// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.PROJECT_URL, process.env.API_KEY)

async function uploadFile(filePath, file) {
    const { data, error } = await supabase.storage.from('files').upload(filePath, file);
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    } else {
      console.log('File uploaded successfully:', data);
      return data;
    }
  }



async function getFileUrl(originalFileName) {
  const { data, error } = supabase.storage.from('bucket').getPublicUrl(originalFileName)
  if(error) {
    console.log(error)
  }
  else{
    console.log(data.publicUrl)
    return data.publicURL
  }
  
}
  
  
// Use the JS library to download a file.
async function downloadFile(file) {
    const { data, error } = await supabase.storage.from('files').download(file)
    if(error) {
        console.log(error)
    }
    else{
        console.log('how do i donlowad a file')
        console.log(data)
    }
    }


module.exports = {
    supabase, 
    uploadFile,
    getFileUrl,
    downloadFile
}

