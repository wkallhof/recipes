import { Component, Inject } from '@nestjs/common';
import { ServiceResult, ServiceDataResult } from '../shared/service-result';
import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs-extra";
import DI from '../../di';
import { AppConfig } from '../../app.config';


export interface IStorageService{
    storeObjectAsync<T>(key: string,data : T): Promise<ServiceResult>;
    readObjectAsync<T>(key: string): Promise<ServiceDataResult<T>>;
}

@Component()
export class JsonDiskStorageService implements IStorageService {

    /*--------------------------------------------*
     *          SERVICE IMPLEMENTATION            *
     *--------------------------------------------*/

    private readonly _config: AppConfig;
    
    constructor(@Inject(DI.AppConfig) config: AppConfig){
        this._config = config;
    }

    public async initializeAsync(): Promise<ServiceResult> {
        return await this.createDirectoriesAsync();
    }

    public async storeObjectAsync<T>(key: string, data: any): Promise<ServiceResult> {
        key = this.titleToSlug(key);
        let filePath = path.join(this._config.dataDirectory, key);

        try {
            await fs.writeFile(filePath, JSON.stringify(data), "utf8");
            return new ServiceResult({ success: true });
        } catch (e) {
            return new ServiceResult({ success: false, message: "Error writing object to file" + key });
        }
    }

    public async readObjectAsync(key: string): Promise<ServiceDataResult<any>> {
        key = this.titleToSlug(key);
        let filePath = path.join(this._config.dataDirectory, key);

        // try to read the file on disk
        try {
            let fileContent = await fs.readFile(filePath, "utf8");
            return new ServiceDataResult({ success: true, data: JSON.parse(fileContent) });
        } catch (e) {
            return new ServiceDataResult({ success: false, message:`Tried to open file: ${key} as object. `});
        }
    }

    /*--------------------------------------------*
     *            PRIVATE HELPERS                 *
     *--------------------------------------------*/

    /**
     * Handles converting a title to a slug
     * for the URL
     */
    private titleToSlug(title) {
        return title.toString().toLowerCase()
            .replace(/\s+/g, "-")           // Replace spaces with -
            .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
            .replace(/\-\-+/g, "-")         // Replace multiple - with single -
            .replace(/^-+/, "")             // Trim - from start of text
            .replace(/-+$/, "");            // Trim - from end of text
    }
    
    /**
     * Create all required directories for this application
     * 
     * @private
     * @returns {Promise<ServiceResult>} 
     * @memberof JsonDiskStorageService
     */
    private async createDirectoriesAsync() : Promise<ServiceResult> {
        try {
            await Promise.all([
                fs.ensureDir(this._config.dataDirectory)
            ]);

            return new ServiceResult({ success: true });
        } catch (e) { 
            return new ServiceResult({success: false, message: "Error creating directories: "+ (<Error>e).message})
         }
    }

    /**
     * Helper method that allows for easy returning a service result
     * 
     * @private
     * @param {Partial<ServiceResult>} result 
     * @returns {Promise<ServiceResult>} 
     * @memberof DocumentService
     */
    private result(result : Partial<ServiceResult>) : ServiceResult  {
        return new ServiceResult(result);
    }

    /**
     * Helper method that allows for easy returning of a service result with data
     * 
     * @private
     * @template T 
     * @param {Partial<ServiceDataResult<T>>} result 
     * @returns {Promise<ServiceDataResult<T>>} 
     * @memberof DocumentService
     */
    private resultWithData<T>(result : Partial<ServiceDataResult<T>>) : ServiceDataResult<T>  {
        return new ServiceDataResult<T>(result);
    }
}