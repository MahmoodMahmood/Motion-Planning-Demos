#include "occupancy_grid.h"
#include <cmath>
#include <iostream>
#include <vector>
#include <stdint.h>

namespace mapping {
template <class T>
OccupancyGrid<T>::OccupancyGrid(T x_min, T x_max, T y_min, T y_max, T z_min, T z_max, T cell_size)
    : x_min{x_min}, x_max{x_max}, y_min{y_min}, y_max{y_max}, z_min{z_min}, z_max{z_max}, cell_size{cell_size}
{
    nrows = std::ceil((x_max - x_min) / cell_size);
    ncols = std::ceil((z_max - z_min) / cell_size);
    grid.resize(nrows * ncols, 0.5);
}

template <class T>
void OccupancyGrid<T>::updateOccupancyGrid(const std::vector<Point<T>> point_cloud, const Point<T>cur_pose)
{
    for (auto &pt : point_cloud) {
        // std::cout << "x: " << pt.x << ", y: " << pt.y << ", z: " << pt.z << std::endl;
    }
}

template <class T>
bool OccupancyGrid<T>::pointInYRange(const Point<T> &p)
{
    return p.y > y_min && p.y < y_max;
}

template <class T>
bool OccupancyGrid<T>::pointInXZRange(const Point<T> &p)
{
    return p.x > x_min && p.x < x_max && p.z > z_min && p.z < z_max;
}

template <class T>
void filterPoints(const std::vector<Point<T>> &point_cloud)
{
    point_cloud.erase(
        std::remove_if(
            std::begin(point_cloud), 
            std::end(point_cloud), 
            [](Point<T> p){ return pointInRange(p); }
        ),
        std::end(point_cloud)
    );
}

template <class T>
const std::vector<T> OccupancyGrid<T>::getGrid()
{
    return grid;
}

template <class T>
T OccupancyGrid<T>::get(int x, int z)
{
    return grid[x + z*nrows];
}

template <class T>
void OccupancyGrid<T>::print()
{
    for (int z = 0; z < nrows; z++) {
        for (int x = 0; x < ncols; x++) {
            std::cout << get(x, z) << " ";
        } 
        std::cout << std::endl;
    }
}

template <class T>
void OccupancyGrid<T>::set(int x, int z, T val)
{
    grid[x + z*nrows] = val;
}

template <class T>
std::optional<std::pair<int, int>> OccupancyGrid<T>::getContainingCell(const Point<T> &pt)
{
    if (!pointInXZRange(pt)) return std::nullopt;
    
    std::pair<int, int> p{
        std::floor(ncols*(pt.x - x_min)/(x_max - x_min)),
        std::floor(nrows*(pt.z - z_min)/(z_max - z_min))
    };
    return std::make_optional(p);
}

template <class T>
void OccupancyGrid<T>::updateYRanges(T y_min, T y_max)
{
    this->y_min = y_min;
    this->y_max = y_max;
}

template <class T>
T OccupancyGrid<T>::getNRows()
{
    return nrows;
}

template <class T>
T OccupancyGrid<T>::getNCols()
{
    return ncols;
}

} // namespace mapping