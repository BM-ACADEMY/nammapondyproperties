import "./App.css";
import AppRoutes from "./AppRoute";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NavProvider } from "./context/NavContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <div>
        <Toaster position="top-center" reverseOrder={false} />
        <AuthProvider>
          <NavProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </NavProvider>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { ConfigProvider } from 'antd';
// import Login from './components/Auth/Login';
// import Signup from './components/Auth/Signup';
// import OtpVerify from './components/Auth/OtpVerify';
// import ResendOtp from './components/Auth/ResendOtp';
// import ResetPassword from './components/Auth/ResetPassword';
// import ForgotPassword from './components/Auth/ForgotPassword';

// // Placeholder for protected/home page
// const Home = () => <div className="p-8 text-2xl">Welcome! You are logged in 🎉</div>;

// function App() {
//   return (
//     <ConfigProvider
//       theme={{
//         token: {
//           colorPrimary: '#1890ff',
//           borderRadius: 6,
//         },
//       }}
//     >
//       <Router>
//         <div className="min-h-screen bg-gray-50">
//           <Routes>
//             <Route path="/" element={<Navigate to="/login" replace />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//             <Route path="/otp-verify" element={<OtpVerify />} />
//             <Route path="/resend-otp" element={<ResendOtp />} />
//              <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route path="/reset-password" element={<ResetPassword />} />
//             <Route path="/home" element={<Home />} />

//             {/* Catch-all */}
//             <Route path="*" element={<div>404 - Not Found</div>} />
//           </Routes>
//         </div>
//       </Router>
//     </ConfigProvider>
//   );

// }

// export default App;
