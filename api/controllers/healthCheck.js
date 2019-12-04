const healthCheck = function(req, res){
    const response = {
        "version": "1.0.0",
        "status": "operational"
    };
    res.send(response);
}

module.exports = healthCheck;