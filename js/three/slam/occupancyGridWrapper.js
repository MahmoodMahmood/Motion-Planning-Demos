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

    updatePoints(points) {
        let arr = points.geometry.attributes.position.array
        console.log(arr)
        this.updateGrid(this.occupancyGrid, arr, arr.length)
        // for (let i = 0; i < arr.length; i+=3) {
        //     const x = arr[i]
        //     const y = arr[i+1]
        //     const z = arr[i+2]
        // }
    }
}