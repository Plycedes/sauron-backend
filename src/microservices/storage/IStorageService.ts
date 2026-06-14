export interface StorageUploadResult {
    url: string;
    fileId: string;
    filename: string;
    mimetype: string;
    size: number;
}

export interface IStorageService {
    upload(
        buffer: Buffer,
        filename: string,
        mimetype: string,
        folder?: string,
    ): Promise<StorageUploadResult>;

    delete(fileId: string): Promise<void>;
}
