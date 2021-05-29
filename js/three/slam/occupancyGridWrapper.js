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

        this.updateGrid = Module.cwrap('updateOccupancyGridFloat', null, ['number', 'number', 'number'])
    }

    // source: https://bl.ocks.org/jonathanlurie/e4aaa37e2d9c317ce44eae5f6011495d
    updatePoints(points) {
        const arr = points.geometry.attributes.position.array

        // Get data byte size, allocate memory on Emscripten heap, and get pointer
        const nDataBytes = arr.length * arr.BYTES_PER_ELEMENT;
        const dataPtr = Module._malloc(nDataBytes);

        // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
        let dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
        dataHeap.set(new Uint8Array(arr.buffer));

        this.updateGrid(this.occupancyGrid, dataHeap.byteOffset, arr.length)
        
        Module._free(dataHeap.byteOffset);
    }
}