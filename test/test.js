const fs = require('fs');
const PCDFormat = require('../build/pcd-format');

function read(path) {

    console.log("Read PCD >>>>>>>>>>>>>>>>>>>> " + path)

    let dataBuffer = fs.readFileSync(path);

    let pcd = PCDFormat.parse(dataBuffer.buffer, false)
    var buf = Buffer.from(pcd.header.raw, 'ascii');

    console.log("Header:")
    console.log(pcd.header)

    console.log("Points Size:")
    console.log(pcd.points.length)
    console.log("First Point:")
    console.log(pcd.points[0])
    console.log("Last Point:")
    console.log(pcd.points[pcd.points.length - 1])

    return pcd;
}

function save(pcd, path) {

    console.log("Save PCD >>>>>>>>>>>>>>>>>>>> " + path)
    let arrayBuffer = PCDFormat.stringify(pcd.header, pcd.points, false)

    fs.writeFileSync(path, Buffer.from(arrayBuffer));
}


let asciiPCD = read('./test/ascii.pcd')
save(asciiPCD, './test/ascii.save.pcd')
read('./test/ascii.save.pcd')

let binaryPCD = read('./test/binary.pcd')
save(binaryPCD, './test/binary.save.pcd')
read('./test/binary.save.pcd')

let binaryCompressedPCD = read('./test/binary_compressed.pcd')
save(binaryCompressedPCD, './test/binary_compressed.save.pcd')
read('./test/binary_compressed.save.pcd')