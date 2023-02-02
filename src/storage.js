'use strict';
import Dexie from './vendor/dexie.js';
import { importFromJsonString, exportToJsonString } from './vendor/IDBExportImport.js';
import * as fflate from './vendor/fflate.js';

const DB_NAME = 'tofu';

const SCHEMA_GLOBAL = [
    null,
    {
        account: 'userId, userSymbol',
        job: '++id, userId, userSymbol',
    },
];

const SCHEMA_LOCAL = [
    null,
    {
        status: 'id',
        following: '++id, version',
        follower: '++id, version',
        blacklist: '++id, version',
        review: 'id, type, [type+version]',
        note: 'id, version',
        interest: 'id, &subject, [type+status], [type+status+version]',
        album: 'id, version',
        photo: 'id, album, [album+version]',
        doulist: 'id, type, [type+version]',
        doulistItem: 'id, doulist, [doulist+version]',
        doumail: 'id, contact',
        doumailContact: 'id, rank',
        version: 'table, version',
    },
    {
        files: '++id, &url',
    },
    {
        annotation: 'id, subject, [subject+version]',
    },
    {
        board: 'id',
    },
];


/**
 * Class Storage
 */
export default class Storage {
    constructor(userId = null) {
        this.userId = userId;
    }

    get global() {
        if (!this._global) {
            let db = this._global = new Dexie(DB_NAME);
            for (let i = 1; i < SCHEMA_GLOBAL.length; i ++) {
                db.version(i).stores(SCHEMA_GLOBAL[i]);
            }
        }
        return this._global;
    }

    get local() {
        if (!this._local) {
            if (!this.userId) {
                throw new Error('No local storage');
            }
            this._local = this.getLocalDb(this.userId);
        }
        return this._local;
    }

    getLocalDb(userId) {
        let db = new Dexie(`${DB_NAME}[${userId}]`);
        for (let i = 1; i < SCHEMA_LOCAL.length; i ++) {
            db.version(i).stores(SCHEMA_LOCAL[i]);
        }
        return db;
    }

    async drop(userId) {
        let localDbName = `${DB_NAME}[${userId}]`;
        if (await Dexie.exists(localDbName)) {
            try {
                await Dexie.delete(localDbName);
            } catch (e) {
                return false;
            }
        }
        return await this.global.account.where({
            userId: parseInt(userId)
        }).delete() > 0;
    }

    async dropAll() {
        const databases = await Dexie.getDatabaseNames();
        for (var dbname of databases)
            await Dexie.delete(dbname)
        return true
    }

    async exists() {
        const databases = await Dexie.getDatabaseNames();
        return databases.length > 0
    }

    async dump(onProgress) {
        if (this.constructor.isRestoring) {
            throw '正在恢复数据库';
        }
        if (this.constructor.isDumping) {
            throw '正在备份数据库';
        }
        this.constructor.isDumping = true;

        try {
            var backupData = {};
            var dbFiles = [];

            const databases = await Dexie.getDatabaseNames();
            const total = databases.length;
            var completed = 1;
            for (let database of databases) {
                if (database != DB_NAME) {
                    dbFiles.push(database);
                }
                let db = new Dexie(database);
                await db.open();
                let dbJson = await new Promise((resolve, reject) => {
                    exportToJsonString(db.backendDB(), (error, jsonString) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(jsonString);
                        }
                    })
                });
                db.close();
                backupData[database + '.json'] = fflate.strToU8(dbJson);
            }
            backupData['database.json'] = fflate.strToU8(JSON.stringify({
                'global': { 'version': SCHEMA_GLOBAL.length },
                'local': {
                    'version': SCHEMA_LOCAL.length,
                    'files': dbFiles
                }
            }));

            return await new Promise((resolve, reject) => {
                fflate.zip(backupData, (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                })
            });
        } finally {
            this.constructor.isDumping = false;
        }
    }

    async restore() {
        if (this.constructor.isRestoring) {
            throw '正在恢复数据库';
        }
        if (this.constructor.isDumping) {
            throw '正在备份数据库';
        }
        this.constructor.isRestoring = true;


        try {
            var successes = [];
            var failures = [];
            
            let dbMeta = window.tofu['database'];
            if (dbMeta.global.version != SCHEMA_GLOBAL.length || dbMeta.local.version != SCHEMA_LOCAL.length) {
                throw '数据库版本不一致';
            };

            var completed = 1;
            const total = dbMeta.local.files.length + 2;
            let globalDb = window.tofu[`${DB_NAME}`];

            await this.global.open();
            try {
                for (let account of globalDb.account) {
                    let dbName = `${DB_NAME}[${account.userId}]`;
                    if (await this.global.account.get({userId: account.userId})) {
                        failures.push({
                            'database': dbName,
                            'error': '数据库已存在'
                        });
                        continue;
                    }
                    
                    let localDb = this.getLocalDb(account.userId);
                    await localDb.open();
                    try {
                        await new Promise((resolve, reject) => {
                            importFromJsonString(localDb.backendDB(), JSON.stringify(window.tofu[dbName]), (error) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve();
                                }
                            });
                        });
                        await this.global.account.put(account);
                        successes.push({
                            'database': dbName,
                        });
                    } catch (error) {
                        failures.push({
                            'database': dbName,
                            'error': error
                        });
                    } finally {
                        localDb.close();
                    }
                }    
            } finally {
                this.global.close();
            }

            return {
                'successes': successes,
                'failures': failures
            };
        } finally {
            this.constructor.isRestoring = false;
        }
    }
}
