const fs = require('fs');
const PCDFormat = require('../build/pcd-format');

function read(path) {

    console.log("Read PCD >>>>>>>>>>>>>>>>>>>> " + path)

    let dataBuffer = fs.readFileSync(path);

    let pcd = PCDFormat.parse(dataBuffer.buffer)
    var buf = Buffer.from(pcd.header.raw, 'ascii');

    console.log("Header:")
    console.log(pcd.header)

    console.log("First Point:")
    console.log(pcd.items[0])
    console.log("Last Point:")
    console.log(pcd.items[pcd.items.length - 1])


    /*
    console.log(buf.byteLength)
    console.log(pcd.header.raw.length)

    console.log(pcd.header.points * pcd.header.rowSize)
    console.log(buf.byteLength + pcd.header.points * pcd.header.rowSize)
    console.log(dataBuffer.byteLength)

    console.log(pcd.header.points)
    console.log(pcd.items.length)

    */

    return pcd;

}

function save(pcd, path) {

    console.log("Save PCD >>>>>>>>>>>>>>>>>>>> " + path)
    let arrayBuffer = PCDFormat.stringify(pcd.header, pcd.items)


    let pcd2 = PCDFormat.parse(arrayBuffer)

    console.log("Header:")
    console.log(pcd2.header)

    console.log("First Point:")
    console.log(pcd2.items[0])
    console.log("Last Point:")
    console.log(pcd2.items[pcd2.items.length - 1])

    var wstream = fs.createWriteStream(path);
    wstream.write(Buffer.from(arrayBuffer));
    wstream.end();
}

let pcd = read('./test/read.pcd')

save(pcd, './test/save.pcd')