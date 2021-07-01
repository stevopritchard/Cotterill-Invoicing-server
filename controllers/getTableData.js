const fs = require('fs');

function csvJSON(csv) {
    const tables = csv.split("\n\n\n")
    var jsTable = []
    tables.forEach(table => { 
        if (table !== "") {
            var lines=table.split("\n");
            var result = [];
            var header=lines[0].split(",");
                for(var i = 1; i < lines.length; i++){
                    var obj = {};
                    var currentline=lines[i].split(",");
                    obj[header[i-1]] = []
                    // console.log(header)
                    for(var j = 0 ;j<header.length; j++){
                        obj[header[i-1]][j] = currentline[j];
                    }
                result.push(obj);
            }  
            // console.log(result)
            // console.log(JSON.stringify(result))
            // return result; //JavaScript object
            jsTable.push(result); //JSON string
        }
    });
    return jsTable
}

function csvJSONVertical(csv) {
    const tables = csv.split("\n\n\n")
    var jsTable
    tables.forEach(table => {
        if (table !== "") {
            var lines = csv.split("\n");
            var result = [];
            // var headers = []
            for (var i = 0; i < lines.length; i++) {
                var obj = {}
                var currentLine = lines[i].split(" ,")
                var header = currentLine[0]
                if (header !== "") {
                    obj[header] = []
                    // console.log(obj)
                    for (var j = 1; j<currentLine.length; j++) {
                        // console.log(currentLine[j+1])
                        if (currentLine[j] !== "") {
                            obj[header][j-1] = currentLine[j]
                        }
                    }
                    // console.log(result)
                    result.push(obj)
                }
            }
            jsTable = result;
        }
    })
    return jsTable
}

const getRowsColumnsMap = (tableResult, blocksMap) => {
    let rows = [];
    tableResult.Relationships.forEach((relationship) => {
        if (relationship.Type === "CHILD") {
        relationship.Ids.forEach((childId) => {
            const cell = blocksMap[childId];
            if (cell.BlockType === "CELL") {
            let rowIndex = cell.RowIndex - 1;
            let colIndex = cell.ColumnIndex - 1;
            if (!rows[rowIndex]) {
                rows[rowIndex] = []
            }
            rows[rowIndex][colIndex] = getTableText(cell, blocksMap)
            }
        })
        }
    })
    return rows
}
  
const getTableText = (result, blocksMap) => {
    text = '';
    if (result.Relationships) {
        result.Relationships.forEach((relationship) => {
        if (relationship.Type === 'CHILD') {
            relationship.Ids.forEach((childId) => {
            const word = blocksMap[childId];
            if(word.BlockType === "WORD") {
                noCommas = word.Text.replace(',','')
                text += noCommas+' '
            } else if (word.BlockType === "SELECTION_ELEMENT") {
                if (word.SelectionStatus === "SELECTED") {
                text += 'X '
                }
            }
            })
        }
        })
    }
    return text;
}
  
const getTableCsvResults = blocks => {
    const blocksMap = {};
    const tableBlocks = [];
  
    blocks.forEach(block => {
      blocksMap[block.Id] = block;
  
      if(block.BlockType === "TABLE") {
        tableBlocks.push(block);
      }
    })
  
    if (tableBlocks.length <= 0) {
      return '<b> NO Table FOUND </b>'
    }
    
    let csvString = ''
  
    tableBlocks.forEach((table, index) => {
      csvString += generateTableCSV(table, blocksMap, index+1)
      csvString += '\n\n'
    })
  
    fs.writeFileSync('output.csv', csvString)
    // csv()
    // .fromString(csvString)
    // .then((jsonObj) => {
    //     console.log(jsonObj)
    //     return(jsonObj)
    // })
    // return csvString
    // console.log(csvString)
    const csvToJson = csvJSON(csvString)
    const csvToJsonY = csvJSONVertical(csvString)
    // console.log(csvToJsonY)
    // csvJSONVertical(csvString)
    return csvToJson
}
  
const generateTableCSV = (tableResult, blocksMap, tableIndex) => {
    rows = getRowsColumnsMap(tableResult, blocksMap)
    let tableId = `Table_${tableIndex}`
    
    let csv =''
    // let csv = `Table: ${tableId}\n\n`
    Object.values(rows).forEach((cols, rowIndex) => {
      Object.values(cols).forEach((text, colIndex) => {
        csv += `${text},`
      })
      csv += '\n'
    })
    csv += '\n\n\n'
    
    return csv
}

const textractTable = async (req, res, textract) => {
    const file = fs.readFileSync(req.file.path)
    const params = {
        Document: {
          Bytes: file
        },
        FeatureTypes: ["TABLES"]
    };

    const request = textract.analyzeDocument(params);
    const data = await request.promise();

    if (data && data.Blocks) {

    const tableToJson = getTableCsvResults(data.Blocks)
    
    res.json(tableToJson)
    }
}

module.exports = {
    textractTable: textractTable
}