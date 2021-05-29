# Motion-Planning-Demos
 Robotics motion planning demonstrations written in P5.js and THREE.js
 

Hosted as a github page at: https://mahmoodmahmood.github.io/Motion-Planning-Demos/ or http://mpdemos.xyz/

___
## Compilation Instructions

### Step 1:
Install emscripten by following the instructions here: https://emscripten.org/docs/getting_started/downloads.html

### Step 2:
> You can skip this if you already have python 3.7 or greater

Create a python 3.8 virtual environment and activate

> `python3.8 -m venv mpdemos_env`
>
> `source mpdemos_env/bin/activate`

### Step 3:
Compile the web assembly client using emcc
> `emcc -std=c++17 webassembly/client.cpp -o webassembly/occupancy_grid.js -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' -s EXPORTED_FUNCTIONS='["_free"]'`