/**
 * 拖拽
 * Created by 黑暗之神KDS on 2023-10-01 17:30:32.
 */
class DragUtils {
    /**
     * 拖拽阈值（鼠标移动超出一定像素后才出现拖拽效果）
     */
    private static OVER_DRAG_VALUE = 5;
    /**
     * 开始拖拽的坐标点
     */
    private static startDragPos: Point = new Point;
    /**
     * 当前正在拖拽的对象
     */
    private static dragSp: GameSprite;
    /**
     * 当前拖拽对象的记录信息
     */
    private static recordDragSp: { parent: GameSprite, childIndex: number, oldX: number, oldY: number, oldMouseEnabled: boolean };
    /**
     * 注册拖拽
     * @param sp 响应对象
     * @param dragSp 拖拽对象
     * @param onStartDrag 当拖拽开始时回调
     * @param onStopDrag 当拖拽结束时回调
     * @param condition 条件
     */
    static reg(responseSp: GameSprite, dragSp: GameSprite, onStartDrag: Callback, onStopDrag: Callback, condition: Callback = null): void {
        responseSp.on(EventObject.MOUSE_DOWN, this, this.onItemMouseDown, [responseSp, dragSp, onStartDrag, onStopDrag, condition]);
    }
    /**
     * 取消注册拖拽
     * @param sp 
     */
    static cancel(responseSp: GameSprite): void {
        responseSp.off(EventObject.MOUSE_DOWN, this, this.onItemMouseDown);
    }
    /**
     * 当响应对象鼠标按下时
     * @param sp 响应对象
     * @param dragSp 拖拽对象
     * @param onStartDrag 当拖拽开始时回调
     * @param onStopDrag 当拖拽结束时回调
     */
    private static onItemMouseDown(responseSp: GameSprite, dragSp: GameSprite, onStartDrag: Callback, onStopDrag: Callback, condition: Callback): void {
        if (condition) {
            let bool = condition.run();
            if (!bool) return;
        }
        this.dragSp = dragSp;
        this.startDragPos.x = stage.mouseX;
        this.startDragPos.y = stage.mouseY;
        stage.on(EventObject.MOUSE_MOVE, this, this.onItemMouseMove, [onStartDrag]);
        stage.on(EventObject.MOUSE_UP, this, this.onItemMouseUp, [onStopDrag]);
    }
    /**
     * 当鼠标移动时
     * @param onStartDrag 
     */
    private static onItemMouseMove(onStartDrag: Callback): void {
        if (Math.abs(stage.mouseX - this.startDragPos.x) >= this.OVER_DRAG_VALUE || Math.abs(stage.mouseY - this.startDragPos.y) >= this.OVER_DRAG_VALUE) {
            let childIndex = this.dragSp.parent.getChildIndex(this.dragSp);
            this.recordDragSp = { parent: this.dragSp.parent as GameSprite, childIndex: childIndex, oldX: this.dragSp.x, oldY: this.dragSp.y, oldMouseEnabled: this.dragSp.mouseEnabled };
            stage.addChild(this.dragSp);
            this.dragSp.x = stage.mouseX - this.dragSp.width / 2;
            this.dragSp.y = stage.mouseY - this.dragSp.height / 2;
            this.dragSp.startDrag();
            this.dragSp.mouseEnabled = false;
            stage.off(EventObject.MOUSE_MOVE, this, this.onItemMouseMove);
            onStartDrag.run();
        }
    }
    /**
     * 当鼠标弹起时
     * @param onStopDrag 
     */
    private static onItemMouseUp(onStopDrag: Callback): void {
        stage.off(EventObject.MOUSE_MOVE, this, this.onItemMouseMove);
        stage.off(EventObject.MOUSE_UP, this, this.onItemMouseUp);
        if (this.recordDragSp) {
            this.dragSp.stopDrag();
            this.recordDragSp.parent.addChildAt(this.dragSp, this.recordDragSp.childIndex);
            this.dragSp.x = this.recordDragSp.oldX;
            this.dragSp.y = this.recordDragSp.oldY;
            this.dragSp.mouseEnabled = this.recordDragSp.oldMouseEnabled;
            this.recordDragSp = null;
            onStopDrag.run();
        }
    }
}