import axios from 'axios'

export default axios.create({
    baseURL: settings.apiBase, // defined in home.blade.php
    timeout: 10000
});
