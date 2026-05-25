/**
 * 文件操作工具
 * 一般用于文本文件 如JSON/XML等储存数据格式的文件
 * Created by 黑暗之神KDS on 2018-06-22 21:37:50.
 */
declare class FileUtils {
    /**
     * 是否拥有文件系统权限：如写入文件、获取目录下全部文件列表等
     */
    static get hasFileOperationJurisdiction(): boolean;
    /**
     * 文件（夹）是否存在
     * -- 需要满足 FileUtils.hasFileOperationJurisdiction
     * @param localURL 相对路径，如asset/json/xxx.json 
     * @param onFin 当检查完毕时 onFin(isExists:boolean)
     */
    static exists(localURL: string, onFin: Callback): void;
    /**
     * 【仅PC端游戏有效】获取指定目录下的所有文件或文件夹（不包含子文件夹内的文件）
     * -- 需要满足 FileUtils.hasFileOperationJurisdiction
     * @param directoryLocalPath 文件目录地址 如 asset/xxx
     * @param onFin 完成时回调 onFin(fos:{localPath:string,fileName:string,isDirectory:boolean}[])  比如fileName=xxx.png localPath=asset/xxx.png，如果fos为空则表示获取失败
     */
    static getDirectoryListing(directoryLocalPath: string, onFin: Callback): void;
    /**
     * 【仅PC端游戏有效】获取指定目录下的所有文件或文件夹（包含子文件夹内的文件）
     * -- 需要满足 FileUtils.hasFileOperationJurisdiction
     * @param directoryLocalPath 文件目录地址 如 asset/xxx
     * @param onFin 完成时回调 onFin(fos:{localPath:string,fileName:string,isDirectory:boolean}[])  比如fileName=xxx.png localPath=asset/xxx.png，如果fos为空则表示获取失败
     */
    static getAllChildFiles(directoryLocalPath: string, onFin: Callback): void;
    /**
     * 加载JSON文件
     * @param localURL 加载文件的地址
     * @param onFin 加载完成或失败时回调（失败:obj=null）onFin(jsonObj:any)
     */
    static loadJsonFile(localURL: string, onFin: Callback): void;
    /**
     * 加载文件（文本格式）
     * @param localURL 加载文件的地址
     * @param onFin 加载完成或失败时回调（失败:text=null）onFin(text:any)
     */
    static loadFile(localURL: string, onFin: Callback): void;
    /**
     * 保存文件
     * -- PC版本保存本地文件
     * -- WEB版本使用LocalStorage储存
     * @param dataObject 对象
     * @param localURL 文件相对地址 ，如asset/xxx.json
     * @param onFin 当保存完毕时回调
     * @param format [可选] 默认值=true 是否格式化（JSON格式化）
     */
    static save(dataObject: any, localURL: string, onFin: Callback, format?: boolean): void;
    /**
     * 删除文件
     * -- PC版本删除本地文件
     * -- WEB版本清理对应的LocalStorage
     * @param localURL 文件相对地址 ，如asset/xxx.json
     * @param onFin [可选] 默认值=null  是否删除成功 onFin(success:boolean, localURL:string)
     */
    static deleteFile(localURL: string, onFin?: Callback): void;
    /**
     * 【仅PC端游戏有效】创建文件夹，会创建不存在的目录
     * -- 需要满足 FileUtils.hasFileOperationJurisdiction
     * @param localURL 文件夹相对地址 格式： 如 asset/dir1/dir2/dir3
     * @param onFin 当完成是回调 onFin(success:boolean,localURL:string)
     */
    static createDirectoryForce(localURL: string, onFin: Callback): void;
    /**
     * 【仅PC端游戏有效】复制粘贴文件
     * -- 需要满足 FileUtils.hasFileOperationJurisdiction
     * @param fromLocalURL 文件来源相对地址 格式： 如 asset/file1.txt
     * @param toLocalURL 需要粘贴到的相对地址  格式： 如 asset/file2.txt
     * @param onFin 完成时回调  onFin(success:boolean,fromLocalURL:string,toLocalURL:string)
     * @param onProgress [可选] 默认值=null 复制过程函数 onProgress(currentNum:number,totalNum:number);
     */
    static cloneFile(fromLocalURL: string, toLocalURL: string, onFin: Callback, onProgress?: Callback): void;
}
