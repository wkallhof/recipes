import { ServiceDataResult, ServiceResult } from "../shared/service-result";
import { Component, Inject } from "@nestjs/common";
import { AppConfig } from "../../app.config";
import DI from "../../di";
import * as cache from "memory-cache";

/**
 * Caching Service for application
 * 
 * @export
 * @interface ICacheService
 */
export interface ICacheService{
    putAsync(key: string, object: any, duration: number) : Promise<ServiceResult>,
    getAsync<T>(key: string) : Promise<ServiceDataResult<T>>,
    deleteAsync(key: string) : Promise<ServiceResult>,
    clearAsync() : Promise<ServiceResult>,
    getKeysAsync() : Promise<ServiceDataResult<Array<string>>>,
}

/**
 * Implementation of CacheService that uses in memory caching only
 * 
 * @export
 * @class MemoryCacheService
 * @implements {ICacheService}
 */
@Component()
export class MemoryCacheService implements ICacheService {

    /*--------------------------------------------*
     *          SERVICE IMPLEMENTATION            *
     *--------------------------------------------*/

    private readonly _config: AppConfig;
    
    constructor(@Inject(DI.AppConfig) config: AppConfig){
        this._config = config;
    }

    /**
     * Handles puting something in the memory cache
     * 
     * @param {string} key Cache key for lookup
     * @param {*} object Data to cache
     * @param {number} duration Duration in milliseconds to cache
     * @returns {Promise<ServiceResult>} 
     * @memberof MemoryCacheService
     */
    public async putAsync(key: string, object: any, duration: number): Promise<ServiceResult> {
        cache.put(key, object, duration);
        return Promise.resolve(new ServiceResult({ success: true }));
    }

    /**
     * Gets data of the given type from cache
     * 
     * @template T Type to cast data to
     * @param {string} key Cache key for lookup
     * @returns {Promise<ServiceDataResult<T>>} 
     * @memberof MemoryCacheService
     */
    public async getAsync<T>(key: string): Promise<ServiceDataResult<T>> {
        const data = cache.get(key) as T;
        return Promise.resolve(new ServiceDataResult({ success: true, data: data }));
    }

    /**
     * Deletes an item from the memory cache
     * 
     * @param {string} key Cache key for lookup
     * @returns {Promise<ServiceResult>} 
     * @memberof MemoryCacheService
     */
    public async deleteAsync(key: string): Promise<ServiceResult> {
        cache.del(key);
        //TODO: Consider capturing result of del (which is bool) and using that to determine success
        return Promise.resolve(new ServiceResult({ success: true }));
    }

    /**
     * Clears the memory cache
     * 
     * @returns {Promise<ServiceResult>} 
     * @memberof MemoryCacheService
     */
    public async clearAsync(): Promise<ServiceResult> {
        cache.clear();
        return Promise.resolve(new ServiceResult({ success: true }));
    }

    /**
     * Gets all cache keys from the memory cache
     * 
     * @returns {Promise<ServiceDataResult<Array<string>>>} 
     * @memberof MemoryCacheService
     */
    public async getKeysAsync(): Promise<ServiceDataResult<Array<string>>> {
        let keys = <Array<string>>cache.keys();
        return Promise.resolve(new ServiceDataResult({ success: true, data: keys }));
    }
}