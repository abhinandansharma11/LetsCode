const mongoose = require('mongoose');
const {Schema} = mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard'],
        required:true,
    },
    tags:{
    type: String,
    enum: [
        'array',
        'string',
        'hash-table',
        'dynamic-programming',
        'math',
        'sorting',
        'greedy',
        'depth-first-search',
        'binary-search',
        'breadth-first-search',
        'tree',
        'matrix',
        'two-pointers',
        'bit-manipulation',
        'stack',
        'graph',
        'heap',
        'sliding-window',
        'backtracking',
        'linked-list',
        'recursion',
        'divide-and-conquer',
        'queue',
        'dp'
    ],
    required: true
},
    visibleTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],

    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            }
        }
    ],

    startCode: [
        {
            language:{
                type:String,
                required:true,
            },
            initialCode:{
                type:String,
                required:true
            }
        }
    ],

    referenceSolution:[
        {
            language:{
                type:String,
                required:true,
            },
            completeCode:{
                type:String,
                required:true
            }
        }
    ],

    codeWrapper:[
        {
            language:{
                type:String,
                required:true,
            },
            wrapperCode:{
                type:String,
                required:true
            }
        }
    ],

    problemCreator:{
        type: Schema.Types.ObjectId,
        ref:'user',
        required:true
    }
})


const Problem = mongoose.model('problem',problemSchema);

module.exports = Problem;


