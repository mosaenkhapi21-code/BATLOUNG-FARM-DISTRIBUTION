const notFound = (req, res) => {
    res.status(404).json({ message: 'API route not found' });
};

const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;

    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        err.message = 'A record with the same unique value already exists';
    } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        err.message = 'Related record does not exist';
    } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        statusCode = 409;
        err.message = 'This record is used by other records and cannot be deleted';
    } else if (err.code === 'ER_DATA_TOO_LONG') {
        statusCode = 400;
        err.message = 'One or more values are too long';
    } else if (err.code === 'ER_TRUNCATED_WRONG_VALUE') {
        statusCode = 400;
        err.message = 'One or more values have an invalid format';
    }

    if (statusCode >= 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        message: err.message || 'Internal server error'
    });
};

module.exports = { notFound, errorMiddleware };
