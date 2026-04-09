import { useNavigate } from "react-router-dom";
import { isAuthenticated, getRole} from "../services/auth";

const navigate= useNavigate();

const AuthRoute = ({ children, requiredRole})=>{
  if (!isAuthenticated()){
    //If the user is not logged in,redirect to login page
    navigate('/login');
  }
  const userRole = getRole();
  if (requiredRole && userRole !== requiredRole){
    //If the user does not have premission, redirect to home page "/"
    navigate('/')
  }
  return children
}

export default AuthRoute;