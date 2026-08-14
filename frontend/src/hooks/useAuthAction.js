import { useNavigate, useLocation } from 'react-router-dom';

export const useAuthAction = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = (actionCallback) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/auth', { 
        state: { 
          error: 'Vui lòng đăng nhập để thêm vào giỏ hàng hoặc mua hàng.',
          returnUrl: location.pathname 
        } 
      });
      return false;
    }
    
    if (typeof actionCallback === 'function') {
      actionCallback();
    }
    return true;
  };

  return requireAuth;
};
