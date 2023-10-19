

const mongoose = require('mongoose');


const queriesInTransactions = async(queryFunctions)=>{
    const transaction = await mongoose.startSession();
    transaction.startTransaction()
    let transactionResponse;
    try{
        const queryResults = await Promise.all([
            ...queryFunctions.map(queryFn=>queryFn())
        ])
        await session.commitTransaction()
        transactionResponse = queryResults;
    
    }
    catch(err){
        await session.abortTransaction();
        throw err
    }
    finally{
        session.endSession();
        if(transactionResponse){
            return transactionResponse
        }
    }


}


module.exports = {
    queriesInTransactions
};