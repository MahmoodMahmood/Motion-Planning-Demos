#include <cmath>
#include <iostream>
#include <vector>

#include <emscripten.h>
#include <stdint.h>

template <typename T>
struct Point
{
    T x;
    T y;
    T z;
};

template <class T>
class OccupancyGrid
{
public:
    OccupancyGrid(T x_min, T x_max, T z_min, T z_max, T cell_size)
        : x_min{x_min}, x_max{x_max}, z_min{z_min}, z_max{z_max}, cell_size{cell_size}
    {
        std::cout << "inside the occupancy grid constructor!" << std::endl;
        size_t nrows = std::ceil((x_max - x_min) / cell_size);
        size_t ncols = std::ceil((z_max - z_min) / cell_size);
        grid.resize(nrows, std::vector<T>(ncols, 0.5));
        std::cout << "x_min: " << x_min << ", x_max: " << x_max << ", z_min: " << z_min << ", z_max: " << z_max << ", cell_size: " << cell_size << std::endl;
    }

    void updateOccupancyGrid(std::vector<Point<T>> point_cloud){
        for (auto &pt : point_cloud) {
            // std::cout << "x: " << pt.x << ", y: " << pt.y << ", z: " << pt.z << std::endl;
        }
    }

private:
    std::vector<std::vector<T>> grid;
    T x_min, x_max, z_min, z_max, cell_size;
};

template <typename T>
std::vector<Point<T>> pointBufferToPointsVector(T *new_points, size_t num_pts)
{
    std::vector<Point<T>> res(num_pts/3, {0.f});
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
extern "C" void updateOccupancyGridFloat(OccupancyGrid<float> *grid, float *new_points, int32_t num_pts)
{
    std::vector<Point<float>> ptsVec = pointBufferToPointsVector<float>(new_points, num_pts);
    grid->updateOccupancyGrid(ptsVec);
};

EMSCRIPTEN_KEEPALIVE
extern "C" OccupancyGrid<float> *initGridFloat(float x_min, float x_max, float z_min, float z_max, float cell_size)
{
    return new OccupancyGrid<float>(x_min, x_max, z_min, z_max, cell_size);
}
