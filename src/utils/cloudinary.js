import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
}); 

const uploadonCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
       
       // upload the file on the cloudinary 
       const responce = await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto",
        })


        // successfull upload the file on the cloudinary 
        console.log("File in  upload on cloudinary",responce.url);

        return responce;
        

    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}



export { uploadonCloudinary };
