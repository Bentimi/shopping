const express =  require('express');
const router = express.Router();
const isAuth = require('../config/auth');

const { signup, login, getAllUsers, updateprofile, editprofile, deleteprofile } = require('../controller/user.controller');

router.post('/signup', signup);
router.post('/login', login);
router.get('/all-users', isAuth, getAllUsers);
router.patch('/edit-profile', isAuth, updateprofile );
router.patch('/edit-user-profile/:profileId', isAuth, editprofile );
router.post('/delete-user/:profileId', isAuth, deleteprofile );

module.exports = router;