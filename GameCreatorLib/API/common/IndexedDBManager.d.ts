/**
 * 浏览器IndexedDB大容量存储方式(异步储存)
 * Created by JayLen on 2021-06-18 13:26:54.
 */
declare class IndexedDBManager {
    /**
     * 数据库
     */
    static indexedDB: IDBFactory;
    /**
     * 表示是否支持
     */
    static support: boolean;
    /**
      * 是否使用IndexedDB大容量存储方式
      */
    static used: boolean;
    /**
     * 数据库名称
     */
    static databaseName: string;
    /**
     * 数据库版本号
     */
    static version: number;
    /**
     * 表格名称
     */
    static tableName: string;
    /**
     * 存储指定键名及其对应的值。
     * @param key 键名
     * @param value 键值(string类型)
     * @param onFin [可选] 默认值=null 回调函数 onFin(success:boolean)
     */
    static setIndexDB(key: string, value: string, onFin?: Function): void;
    /**
     * 获取指定键名对应的值
     * @param key 键名
     * @param onFin 回调 onFin(value:string)
     */
    static getIndexDB(key: string, onFin: Function): void;
    /**
     * 存储指定键名及其对应的值。
     * @param key 键名
     * @param value 键值(Object类型，会被转化为 JSON 字符串存储)
     * @param onFin [可选] 默认值=null 回调函数 onFin(success:boolean)
     */
    static setIndexDBJson(key: string, value: any, onFin?: Function): void;
    /**
      * 获取指定键名对应的值
      * @param key 键名
      * @param onFin 回调函数 onFin(value:any)
      */
    static getIndexDBJson(key: string, onFin: Function): void;
    /**
     * 删除指定键名的数据
     * @param key 键名
     * @param onFin [可选] 默认值=null 回调 onFin(success:boolean)
     */
    static removeIndexDBItem(key: string, onFin?: Function): void;
    /**
     * 获取所有数据
     * @param onFin 回调 onFin(items:{})
     */
    static items(onFin: Function): void;
    /**
     * 清除本地存储信息。
     * @param onFin [可选] 默认值=null 回调 onFin(success:boolean)
     */
    static clear(onFin?: Function): void;
}
