import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path if needed, assuming relative to modules/common-pages
import { Button, Result } from 'antd';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    // Determine role - matching logic from PrivateRoute
    const role = (
      user?.user?.role?.role ||
      user?.role?.role ||
      user?.role?.name ||
      user?.role_id?.role_name
    )?.toUpperCase();

    if (role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'SELLER') {
      navigate('/seller/dashboard', { replace: true });
    } else if (role === 'USER') {
      navigate('/user/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={handleGoBack}>
            Back to Home
          </Button>
        }
      />
    </div>
  );
};

export default Unauthorized;
