class occupancyGridWrapper {
    // We need the wasm "Module" instance to construct our object
    constructor(Module) {
        let initializer = Module.cwrap('initGridFloat', 'number', ['number', 'number', 'number', 'number', 'number'])
        const x_min = -16
        const x_max = 16
        const z_min = -16
        const z_max = 16
        const grid_size = 0.1
        this.occupancyGrid = initializer(x_min, x_max, z_min, z_max, grid_size)

        this.updateGrid = Module.cwrap('updateOccupancyGridFloat', null, ['number', 'number', 'number', 'number', 'number', 'number'])
    }

    /**
     * Calls the C++ gridmap update function
     * 
     * @param {Float32Array} points 
     * @param {Vector3} cur_pose 
     */
    updatePoints(points, cur_pose) {
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
    }
}