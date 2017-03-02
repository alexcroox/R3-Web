import axios from 'axios'

let axiosInstance = axios.create({
    baseURL: settings.apiBase, // defined in home.blade.php
    timeout: 10000
});

export default axiosInstance
