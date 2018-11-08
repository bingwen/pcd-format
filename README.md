```
 _______  _______  ______          _______  _______  _______  _______  _______ _________
(  ____ )(  ____ \(  __  \        (  ____ \(  ___  )(  ____ )(       )(  ___  )\__   __/
| (    )|| (    \/| (  \  )       | (    \/| (   ) || (    )|| () () || (   ) |   ) (   
| (____)|| |      | |   ) | _____ | (__    | |   | || (____)|| || || || (___) |   | |   
|  _____)| |      | |   | |(_____)|  __)   | |   | ||     __)| |(_)| ||  ___  |   | |   
| (      | |      | |   ) |       | (      | |   | || (\ (   | |   | || (   ) |   | |   
| )      | (____/\| (__/  )       | )      | (___) || ) \ \__| )   ( || )   ( |   | |   
|/       (_______/(______/        |/       (_______)|/   \__/|/     \||/     \|   )_(   
                                                                                        
```

> pcd-format is a js lib to encode 3D Point Cloud to ArrayBuffer or decode from ArrayBuffer.
> [PCD File Format](http://pointclouds.org/documentation/tutorials/pcd_file_format.php)
> [C++ PCD IO](https://github.com/PointCloudLibrary/pcl/blob/master/io/src/pcd_io.cpp)

## Install

    npm install pcd-format --save

or

    yarn add pcd-format

## Usage

    const fs = require('fs');
    const PCDFormat = require('pcd-format');

    // Read & Parse
    let dataBuffer = fs.readFileSync(path);
    let pcd = PCDFormat.parse(dataBuffer.buffer, false)

    console.log("Header:")
    console.log(pcd.header)

    console.log("Points Size:")
    console.log(pcd.points.length)
    console.log("First Point:")
    console.log(pcd.points[0])
    console.log("Last Point:")
    console.log(pcd.points[pcd.points.length - 1])

    // Stringify & Save
    let arrayBuffer = PCDFormat.stringify(pcd.header, pcd.points, false)
    fs.writeFileSync(path, Buffer.from(arrayBuffer));