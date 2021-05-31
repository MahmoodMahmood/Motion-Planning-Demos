#ifndef MPDEMOS_WASM_OCCUPANCY_GRID_H_
#define MPDEMOS_WASM_OCCUPANCY_GRID_H_

#include <vector>

namespace mapping {

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
    OccupancyGrid(T x_min, T x_max, T z_min, T z_max, T cell_size);
    void updateOccupancyGrid(const std::vector<Point<T>> point_cloud, const Point<T>cur_pose);
    const std::vector<std::vector<T>> getGrid();

private:
    std::vector<std::vector<T>> grid;
    T x_min, x_max, z_min, z_max, cell_size;
    bool pointInRange(const Point<T> &p);
    void filterPoints(const std::vector<Point<T>> &point_cloud);
};

} // namespace mapping

// NOTE: adding the cpp file include here is not ideal but the standard solution
// of adding 'template class ClassName<type>;` to the cpp file did not solve the 
// linker errors for me, not actually sure why
#include "occupancy_grid.cpp"

#endif // MPDEMOS_WASM_OCCUPANCY_GRID_H_