
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-abba-black">
      <div className="text-center">
        <img 
          src="/lovable-uploads/a7cf582e-5718-4f64-912a-e05c747864bf.png" 
          alt="Abba Digital" 
          className="w-16 h-16 mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold mb-4 text-abba-text">Abba Digital Manager</h1>
        <p className="text-xl text-gray-400">Redirecionando...</p>
      </div>
    </div>
  );
};

export default Index;
