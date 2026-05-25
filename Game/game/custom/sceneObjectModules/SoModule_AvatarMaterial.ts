/**
 * 场景对象模块-行走图材质
 * Created by 黑暗之神KDS on 2021-11-02 05:06:12.
 */
class SoModule_AvatarMaterial extends SceneObjectModule_2 {
    /**
     * 构造函数
     * @param installCB 
     */
    constructor(installCB: Callback) {
        super(installCB);
        // 此处追加材质，以便不会影响它可能已有的其他材质，如果仅用于覆盖
        // 则：this.so.avatar.installMaterialData(this.materialData);
        for (let i = 0; i < this.materialData.length; i++) {
            let materials = this.materialData[i].materials;
            for (let s = 0; s < materials.length; s++) {
                this.so.avatar.addMaterial(materials[s]);
            }
        }
    }
    /**
     * 模块移除时
     */
    onRemoved(): void {
        for (let i = 0; i < this.materialData.length; i++) {
            let materials = this.materialData[i].materials;
            for (let s = 0; s < materials.length; s++) {
                this.so.avatar.removeMaterial(materials[s]);
            }
        }
    }
    /**
     * 刷新：通常在改变了属性需要调用此函数统一刷新效果
     */
    refresh():void {
        
    }
}