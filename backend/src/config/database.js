import {Pool} from "pg";

const pool = new Pool({
    host:"localhost",
    user:"postgres",
    port:5432,
    password:"2233",
    database:"project_management_app"
})

export default pool;