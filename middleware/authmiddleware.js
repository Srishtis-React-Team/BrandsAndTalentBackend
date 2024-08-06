const auth = require('../middleware/auth'); 

const authenticateToken = async (req, res, next) => {
    const token = req.headers["x-access-token"];
    const userId = req.body.user_id || req.params.user_id;

    if (!token || !userId) {
        return res.status(200).json({ status: false, msg: 'Authentication failed: Token or userId missing' });
    }

    try {
        const authResult = await new auth().CheckAuth(token, userId);
        if (!authResult) {
            return res.status(200).json({ status: false, msg: 'Authentication failed' });
        }
        next();
    } catch (error) {
        return res.status(200).json({ status: false, msg: 'Authentication error: ' + error });
    }
};

module.exports = authenticateToken;