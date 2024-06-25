import controller from "../controllers/user.js";

export default (() => [
    {
        path: '/',
        method: 'GET',
        handler: controller.welcome
    },
    {
        path: '/user-details',
        method: 'GET',
        handler: controller.getAllUsers,
    },
    {
        path: '/register',
        method: 'POST',
        handler: controller.registerUser,
        options: {auth: false}
    },
    {
        path: '/login',
        method: 'POST',
        handler: controller.loginUser,
        config: {auth: false}
    },
    {
        path: '/logout',
        method: 'GET',
        handler: controller.logoutUser,
    },
])();