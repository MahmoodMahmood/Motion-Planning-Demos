class occupancyGridWrapper {
    // We need the wasm "Module" instance to construct our object
    constructor(Module) {
        let initializer = Module.cwrap('initGridFloat', 'number', ['number', 'number', 'number', 'number', 'number'])
        this.x_min = -16
        this.x_max = 16
        this.z_min = -16
        this.z_max = 16
        this.cell_size = 0.1
        this.occupancyGrid = initializer(this.x_min, this.x_max, this.z_min, this.z_max, this.cell_size)

        this.updateGrid = Module.cwrap('updateOccupancyGridFloat', null, ['number', 'number', 'number', 'number', 'number', 'number'])
        this.updateYRanges = Module.cwrap('updateYRanges', null, ['number', 'number', 'number'])
        this.get1DGrid = Module.cwrap('get1DGrid', null, ['number', 'number'])
    }

    /**
     * Calls the C++ gridmap update function
     * 
     * @param {Float32Array} points 
     * @param {Vector3} cur_pose 
     */
    updatePoints(points, cur_pose, bot_height) {
        // source: https://bl.ocks.org/jonathanlurie/e4aaa37e2d9c317ce44eae5f6011495d
        // Get data byte size, allocate memory on Emscripten heap, and get pointer
        const nDataBytes = points.length * points.BYTES_PER_ELEMENT;
        const dataPtr = Module._malloc(nDataBytes);

        // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)  
        let dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
        dataHeap.set(new Uint8Array(points.buffer));

        this.updateGrid(this.occupancyGrid, dataHeap.byteOffset, points.length, 
            cur_pose.x, cur_pose.y, cur_pose.z)

        Module._free(dataHeap.byteOffset);

        // update y_min and y_max according 
        this.updateYRanges(this.occupancyGrid, (cur_pose.y - bot_height/2), (cur_pose.y + bot_height/2)) 
    }

    get2DGrid() {
        // source: https://bl.ocks.org/jonathanlurie/e4aaa37e2d9c317ce44eae5f6011495d
        // Get data byte size, allocate memory on Emscripten heap, and get pointer
        const n_rows = this.getNRows()
        const n_cols = this.getNCols()
        const nDataBytes = n_rows * n_cols;
        const dataPtr = Module._malloc(nDataBytes);

        // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)  
        let dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
        this.get1DGrid(this.occupancyGrid, dataHeap.byteOffset);
        let debug_str = ""
        let result = []
        for (let i = 0; i < n_rows; i++) {
            let new_row = []
            for (let j = 0; j < n_cols; j++) {
                new_row.push(dataHeap[dataHeap.byteOffset+i*n_cols+j])
                debug_str += parseFloat(dataHeap[dataHeap.byteOffset+i*n_cols+j]).toString() + " "
            }
            result.push(new_row)
            debug_str += "\n"
        }
        console.log(debug_str + "\n\n\n\n")

        Module._free(dataHeap.byteOffset);

        return result;
    }

    getNRows() {
        // C++ implementation: nrows = std::ceil((x_max - x_min) / cell_size);
        return Math.ceil((this.x_max - this.x_min) / this.cell_size)
    }

    getNCols() {
        //C++ implementation: ncols = std::ceil((z_max - z_min) / cell_size);
        return Math.ceil((this.z_max - this.z_min) / this.cell_size)
    }
}