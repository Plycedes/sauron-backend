import { v2 as cloudinary, ConfigOptions } from "cloudinary";
import { IStorageService, StorageUploadResult } from "./IStorageService";
import env from "../../config/env";
import { ApiError } from "../../utils/ApiError";

export class CloudinaryService implements IStorageService {
    private config: ConfigOptions;

    constructor() {
        this.config = {
            cloud_name: env.cloudinaryCloudName,
            api_key: env.cloudinaryAPIKey,
            api_secret: env.cloudinaryAPISecret,
        };
        cloudinary.config(this.config);
    }

    async upload(
        buffer: Buffer,
        filename: string,
        mimetype: string,
        folder?: string,
    ): Promise<StorageUploadResult> {
        try {
            return await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "raw",
                        folder: folder ?? "template",
                        public_id: filename.replace(/\.[^.]+$/, ""),
                        format: filename.split(".").pop(),
                    },
                    (error, result) => {
                        if (error) {
                            reject(new ApiError(500, `Cloudinary upload failed: ${error.message}`));
                        } else if (result) {
                            resolve({
                                url: result.secure_url,
                                fileId: result.public_id,
                                filename,
                                mimetype,
                                size: result.bytes,
                            });
                        } else {
                            reject(new ApiError(500, "Cloudinary upload returned no result"));
                        }
                    },
                );

                uploadStream.end(buffer);
            });
        } catch (err) {
            if (err instanceof ApiError) throw err;
            throw new ApiError(500, `Cloudinary upload failed: ${(err as Error).message}`);
        }
    }

    async delete(fileId: string): Promise<void> {
        try {
            await new Promise<void>((resolve, reject) => {
                cloudinary.uploader.destroy(
                    fileId,
                    { resource_type: "raw" },
                    (error) => {
                        if (error) {
                            reject(new ApiError(500, `Cloudinary delete failed: ${error.message}`));
                        } else {
                            resolve();
                        }
                    },
                );
            });
        } catch (err) {
            if (err instanceof ApiError) throw err;
            throw new ApiError(500, `Cloudinary delete failed: ${(err as Error).message}`);
        }
    }
}
