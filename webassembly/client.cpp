#include <cmath>
#include <iostream>
#include <vector>

#include <emscripten.h>
#include <stdint.h>

#include "occupancy_grid/occupancy_grid.h"

template <typename T>
std::vector<mapping::Point<T>> pointBufferToPointsVector(T *new_points, size_t num_pts)
{
    std::vector<mapping::Point<T>> res(num_pts/3, {0.f});
    for (int i = 0; i < num_pts; i+=3)
    {
        res[i/3].x = new_points[i+0];
        res[i/3].y = new_points[i+1];
        res[i/3].z = new_points[i+2];
    }
    return res;
}

/**
 * @brief updates the occupancy grid with the appropriate length variable
 *        we need to do this in a function outside the class since webassembly does not seem to 
 *        allow accessing class member functions directly
 * 
 * @param grid       pointer to occupancy grid we are interacting with
 * @param new_points float array including all the new lidar points
 * @param num_pts    number of new points detected
 */
EMSCRIPTEN_KEEPALIVE
extern "C" void updateOccupancyGridFloat(mapping::OccupancyGrid<float> *grid, float *new_points, int32_t num_pts, 
    float x_cur, float y_cur, float z_cur)
{
    std::vector<mapping::Point<float>> ptsVec = pointBufferToPointsVector<float>(new_points, num_pts);
    mapping::Point<float> cur_pose = { x_cur, y_cur, z_cur };
    grid->updateOccupancyGrid(ptsVec, cur_pose);
};

EMSCRIPTEN_KEEPALIVE
extern "C" mapping::OccupancyGrid<float> *initGridFloat(float x_min, float x_max, float z_min, float z_max, float cell_size)
{
    return new mapping::OccupancyGrid<float>(x_min, x_max, z_min, z_max, cell_size);
}
