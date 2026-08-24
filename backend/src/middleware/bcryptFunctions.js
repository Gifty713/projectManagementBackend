import bcrypt from "bcrypt";
const hashPassword=(password)=>{
    return bcrypt.hash(password, 10);
}

const comparePasswords=(newpwd, oldpwd)=>{
    return bcrypt.compare(newpwd, oldpwd);
}

export {hashPassword, comparePasswords};