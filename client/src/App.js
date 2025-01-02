import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthProvider from "./contexts/Auth/AuthContext";
import UserProvider from "./contexts/User/UserContext";
import Post from "./pages/Post";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <AuthProvider>
        <UserProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<Navigate to="/main" />} />
              <Route path="/main" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/post/:postId" element={<Post />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </UserProvider>
      </AuthProvider>
    </>
  );
}

export default App;
