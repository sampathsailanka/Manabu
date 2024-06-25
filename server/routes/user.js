import controller from "../controllers/user.js";

export default (() => [
    {
        path: '/',
        method: 'GET',
        handler: controller.welcome
    },
    {
        path: '/register',
        method: 'POST',
        handler: controller.register
    },
])();