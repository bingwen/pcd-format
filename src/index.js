function ab2str(array) {
    let s = '';
    for (let i = 0, il = array.length; i < il; i++) {
            s += String.fromCharCode(array[i]);
    }
    return s;
}

function str2ab(str) {
    const array = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        array[i] = str.charCodeAt(i);
    }
    return array.buffer;
}

export function parseHeader(textData) {

    let header = {};
    let dataStart = textData.search(/[\r\n]DATA\s(\S*)\s*/i);
    if(dataStart == -1) {
        throw "PCD-Format: not found DATA";
    }

    let result = /[\r\n]DATA\s(\S*)\s*/i.exec(textData);
    header.raw = textData.substr(0, dataStart + result[0].length);
    header.str = header.raw.replace(/\#.*/gi, '');

    // parse
    header.version = /VERSION (.*)/i.exec(header.str);
    header.fields = /FIELDS (.*)/i.exec(header.str);
    header.size = /SIZE (.*)/i.exec(header.str);
    header.type = /TYPE (.*)/i.exec(header.str);
    header.count = /COUNT (.*)/i.exec(header.str);
    header.width = /WIDTH (.*)/i.exec(header.str);
    header.height = /HEIGHT (.*)/i.exec(header.str);
    header.viewpoint = /VIEWPOINT (.*)/i.exec(header.str);
    header.points = /POINTS (.*)/i.exec(header.str);
    header.data = /DATA (.*)/i.exec(header.str);

    // evaluate
    if (header.version !== null)
        header.version = parseFloat(header.version[1]);

    if (header.fields !== null)
        header.fields = header.fields[1].split(' ');

    if (header.type !== null)
        header.type = header.type[1].split(' ');

    if (header.width !== null)
        header.width = parseInt(header.width[1]);

    if (header.height !== null)
        header.height = parseInt(header.height[1]);

    if (header.viewpoint !== null)
        header.viewpoint = header.viewpoint[1];

    if (header.points !== null)
        header.points = parseInt(header.points[1], 10);

    if (header.points === null)
        header.points = header.width * header.height;

    if (header.data !== null)
        header.data = header.data[1];

    if (header.size !== null) {
        header.size = header.size[1].split(' ').map(function (x) {
            return parseInt(x, 10);
        });
    }

    if (header.count !== null) {
        header.count = header.count[1].split(' ').map(function (x) {
            return parseInt(x, 10);
        });
    } else {
        header.count = [];
        for (let i = 0, l = header.fields.length; i < l; i++) {
            header.count.push(1);
        }
    }

    header.offset = [];
    let sizeSum = 0;
    for (let i = 0, l = header.fields.length; i < l; i++) {
        if (header.data === 'ascii') {
            header.offset.push(i);
        } else {
            header.offset.push(sizeSum);
            sizeSum += header.size[i] * header.count[i];
        }
    }

    // for binary only
    header.rowSize = sizeSum;

    return header;
}

function getFromText(text, type) {
    switch (type) {
        case 'F':
            return parseFloat(text);
        case 'U':
        case 'I':
            return parseInt(text);
        default:
            break;
    }
    throw "PCD-Format: parse data failed";
}

function getFromDataView(dataview, offset, littleEndian, type, size) {
    switch (type) {
        case 'F':
            switch (size) {
                case 4:
                    return dataview.getFloat32(offset, littleEndian);
                case 8:
                    return dataview.getFloat64(offset, littleEndian);
                default:
                    break;
            }
            break;
        case 'U':
            switch (size) {
                case 1:
                    return dataview.getUint8(offset, littleEndian);
                case 2:
                    return dataview.getUint16(offset, littleEndian);
                case 4:
                    return dataview.getUint32(offset, littleEndian);
                default:
                    break;
            }
            break;
        case 'I':
            switch (size) {
                case 1:
                    return dataview.getInt8(offset, littleEndian);
                case 2:
                    return dataview.getInt16(offset, littleEndian);
                case 4:
                    return dataview.getInt32(offset, littleEndian);
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
    throw "PCD-Format: parse data failed";
}

function setToDataView(dataview, offset, littleEndian, type, size, data) {
    switch (type) {
        case 'F':
            switch (size) {
                case 4:
                    dataview.setFloat32(offset, data, littleEndian);
                    return;
                case 8:
                    dataview.setFloat64(offset, data, littleEndian);
                    return;
                default:
                    break;
            }
            break;
        case 'U':
            switch (size) {
                case 1:
                    dataview.setUint8(offset, data, littleEndian);
                    return;
                case 2:
                    dataview.setUint16(offset, data, littleEndian);
                    return;
                case 4:
                    dataview.setUint32(offset, data, littleEndian);
                    return;
                default:
                    break;
            }
            break;
        case 'I':
            switch (size) {
                case 1:
                    dataview.setInt8(offset, data, littleEndian);
                    return;
                case 2:
                    dataview.setInt16(offset, data, littleEndian);
                    return;
                case 4:
                    dataview.setInt32(offset, data, littleEndian);
                    return;
                default:
                    break;
            }
            break;
        default:
            break;
    }
    throw "PCD-Format: set data failed";
}

export function parse(arrayBuffer, littleEndian=true) {

    const textData = ab2str(new Uint8Array(arrayBuffer));
    const header = parseHeader(textData);

    // parse data
    let items = [];

    if (header.data === 'ascii') {
        let pcdData = textData.substr(header.raw.length);
        let lines = pcdData.split('\n');

        for (let i = 0; i < lines.length; i++) {
            if (lines[i] === '')
                continue;
            let line = lines[i].split(' ');
            let lineItems = [];
            for (let index = 0; index < header.type.length; index++) {
                const text = line[index];
                const type = header.type[index];
                const count = header.count[index];
                let item;
                if (count == 1) {
                    item = getFromText(text, type);
                } else if (count > 1) {
                    item = [];
                    for (let c = 0; c < count; c++) {
                        item.push(getFromText(text, type));
                    }
                }
                lineItems.push(item);
            }
            items.push(lineItems);
        }
    } else if (header.data === 'binary') {

        let dataview = new DataView(arrayBuffer, header.raw.length);

        for (let i = 0, row = 0; i < header.points; i++ , row += header.rowSize) {
            let lineItems = [];
            for (let index = 0; index < header.type.length; index++) {
                const type = header.type[index];
                const size = header.size[index];
                const count = header.count[index];
                const offset = header.offset[index];

                let item;
                if(count == 1) {
                    item = getFromDataView(dataview, row + offset, littleEndian, type, size);
                } else if (count > 1) {
                    item = [];
                    for (let c = 0; c < count; c++) {
                        item.push(getFromDataView(dataview, row + offset + c * size, littleEndian, type, size));
                    }       
                }
                lineItems.push(item);
            }
            items.push(lineItems);
        }
    }

    return {
        header, 
        items
    }
};

export function stringify(header, items, littleEndian=true) {

    if (header.data === 'ascii') {
        let textData = '' + header.raw;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            for (let j = 0; j < item.length; j++) {
                if(item[j] instanceof Array) {
                    textData += item[j].join(' ');
                } else {
                    textData += item;
                }
            }
            textData += '\n';
        }

        return str2ab(textData);

    } else if (header.data === 'binary') {

        const bufferSize = header.raw.length + header.points * header.rowSize;
        const arrayBuffer = new ArrayBuffer(bufferSize);

        // write header
        const headerView = new Uint8Array(arrayBuffer, 0, header.raw.length);
        for (let i = 0; i < header.raw.length; i++) {
            headerView[i] = header.raw.charCodeAt(i);
        }

        // write data
        const dataview = new DataView(arrayBuffer, header.raw.length);

        for (let i = 0, row = 0; i < items.length; i++, row += header.rowSize) {
            const item = items[i];
            for (let j = 0; j < item.length; j++) {
                const type = header.type[j];
                const size = header.size[j];
                const count = header.count[j];
                const offset = header.offset[j];

                if (count == 1) {
                    setToDataView(dataview, row + offset, littleEndian, type, size, item);
                } else if (count > 1 && item[j] instanceof Array) {
                    for (let c = 0; c < count; c++) {
                        setToDataView(dataview, row + offset + c * size, littleEndian, type, size, item[c]);
                    }
                } else {
                    throw "PCD-Format: set data failed";
                }
            }
        }
        return arrayBuffer;
    }
}