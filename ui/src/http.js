import axios from 'axios'

let axiosInstance = axios.create({
    baseURL: apiBase, // defined in index.html
    timeout: 10000
});

export default axiosInstance
