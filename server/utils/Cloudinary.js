import {v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = async function(localFilePath){
    try{
        if(! localFilePath){
            return null;
        }
        // upload on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        });
        console.log("File Uploaded Succesfully on Cloudinary");
        console.log(response.url);
        // unlinking the file from the local storage:
        fs.unlinkSync(localFilePath);
        return response;
    }
    catch(error){
        // Remove the file from the local storage
        fs.unlinkSync(localFilePath);
        return null;
    }
};
export {uploadOnCloudinary};


/*
Logic : Uploading the file which we have stored into the local storage into Cloudinay :
STEP-1: Configure the cloud 
STEP-2: Writing the function which we will exporting for uploading the file using : cloudinary.uploader.upload(): It takes two parameter 
        One is the localFilePath and other one is object mentioning the resource_type
STEP-3: This method returns the object which is stored in a url if it's sucessfull the response.url is returned which can be stored in DB.
        Else : null is returned. 

*/

/*
How to use this utility ??

Let's suppose via multer you are able to store the files which are coming into req.files into the local storage via multer . 
On  quering the req.files for a particular field name like : avatar say so 
req.files?.avatar[0]?.path :  This gives me the local path where the file is stored by multer.
This is passed into this uploadOnCloudinary function which returns the cloudinary url then


*/
