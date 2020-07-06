//POST /api/returns {customerId, courseId}

//Return 401 if the client is not logged in
//Return 400 if customerId is not provided
//Return 400 if the courseId is not provided
//Return 404 if no rental found for this customer/movie
//Return 400 if rental is already purchased
//Return 200 if the request is valid
//set the return date
//calculate the rental fee
//increase the stock
//return the rental