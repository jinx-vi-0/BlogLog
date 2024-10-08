import multer from "multer";
import fs from "fs";
import path from "path";

/* 
Action - Making a Directory if the Temporary Directory doesn'e exist
recursive: true ensures that function creates all the directories into the path even if some intermediate directories dosen't exits.
*/
const tempDir="../public/temp";
if(!fs.existsSync(tempDir)){
    fs.mkdirSync(tempDir,{recursive:true}); // Recursive: true ensures that function creates all the directories into the path even if some intermediate directories dosen't exits.
}
/*
multer.diskStorage(): A method provided by Multer that allows you to configure how files stored on disk-> Takes object with destination and filename
cb : A callback function to pass the storage location: Takes two parameter(error,desintation directory)
How the files are stored : eg: "avatar-1632996396471-823917520"
*/
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,tempDir);
    },
    filename:function(req,file,cb){
        const uniqueSuffix=Date.now()+"-"+Math.round(Math.random()*1e9);
        cb(null,file.fieldname+"-"+uniqueSuffix);
    },
});

export const upload=multer({storage:storage});