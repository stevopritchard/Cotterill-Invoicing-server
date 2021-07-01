const fs = require('fs');
const _ = require('lodash')


const getText = (result, blocksMap) => {
    let text = "";
  
    if (_.has(result, "Relationships")) {
      result.Relationships.forEach(relationship => {
        if (relationship.Type === "CHILD") {
          relationship.Ids.forEach(childId => {
            const word = blocksMap[childId];
            if (word.BlockType === "WORD") {
              text += `${word.Text} `;
            }
            if (word.BlockType === "SELECTION_ELEMENT") {
              if (word.SelectionStatus === "SELECTED") {
                text += `X `;
              }
            }
          });
        }
      });
    }
  
    return text.trim();
  };
  
  const findValueBlock = (keyBlock, valueMap) => {
    let valueBlock;
    keyBlock.Relationships.forEach(relationship => {
      if (relationship.Type === "VALUE") {
        relationship.Ids.every(valueId => {
          if (_.has(valueMap, valueId)) {
            valueBlock = valueMap[valueId];
            return false;
          }
        });
      }
    });
  
    return valueBlock;
  };
  
  const getKeyValueRelationship = (keyMap, valueMap, blockMap) => {
    const keyValues = {};
  
    const keyMapValues = _.values(keyMap);
  
    keyMapValues.forEach(keyMapValue => {
      const valueBlock = findValueBlock(keyMapValue, valueMap);
      const key = getText(keyMapValue, blockMap);
      const value = getText(valueBlock, blockMap);
      keyValues[key] = value;
    });
  
    return keyValues;
  };
  
  const getKeyValueMap = blocks => {
    const keyMap = {};
    const valueMap = {};
    const blockMap = {};
  
    let blockId;
    blocks.forEach(block => {
      blockId = block.Id;
      blockMap[blockId] = block;
  
      if (block.BlockType === "KEY_VALUE_SET") {
        if (_.includes(block.EntityTypes, "KEY")) {
          keyMap[blockId] = block;
        } else {
          valueMap[blockId] = block;
        }
      }
    });
  
    return { keyMap, valueMap, blockMap };
  };

const textractForm = (req, res, textract) => {

  // var obj = []
  var requests = (
    req.files.map(async (file, index) => {
      const filepath = fs.readFileSync(file.path)
      const params = {
          Document: {
              Bytes: filepath
          },
          FeatureTypes: ["FORMS"]
      };

      const request = textract.analyzeDocument(params);
      const data = await request.promise();

      if(data && data.Blocks) {
        const { keyMap, valueMap, blockMap } = getKeyValueMap(data.Blocks);
        const keyValues = getKeyValueRelationship(keyMap, valueMap, blockMap);
        const fileInfo = {
          name: file.originalname,
          purchaseOrders: [],
          validNumber: '',
          date: '',
          updated: false
        }
        Object.values(keyValues).forEach((value, index) => {
          if( value.length === 6 && !isNaN(value) && /[.,\/#!$%\^&\*;:{}=\-_`~()]/g.test(value) == false ) {
            fileInfo.purchaseOrders.push(value)
          }
          if ( value.match(/\d{2}([\/.-])\d{2}\1\d{4}/g) && Object.keys(keyValues)[index].includes("Invoice")) {
            fileInfo.date = value
          }
        })
        return fileInfo
      }
    })
  )
  Promise.all(requests)
  .then(data => res.json(data))
  .catch(err => console.log("Error:", err))
}


module.exports = {
    textractForm: textractForm
}