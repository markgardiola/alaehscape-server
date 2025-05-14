const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');

//users only
router.get('/get_user_info', verifyToken, userController.getUserInfo);
router.post('/update_user', verifyToken, userController.updateUser);

//admins only
router.get('/users', userController.getAllUsers)
router.get('/total_users', userController.getTotalUsers);
router.put('/users/:id', userController.adminUpdateUser);
router.delete('/users/:id', userController.deleteUser);


module.exports = router;
