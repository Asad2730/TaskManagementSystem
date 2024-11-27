import React, { useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../../db/db";
import { CustomButton, CustomInput } from "./components/customUi";
import { login } from "../../store/authSlice";


const auth = getAuth(app);

const Auth = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const buttonLabel = useMemo(() => (loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"), [loading, isSignUp]);

  const toggleText = useMemo(() => (isSignUp ? "Already have an account?" : "Don't have an account?"), [isSignUp]);

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleAuthMode = useCallback(() => {
    setIsSignUp((prev) => !prev);
  }, []);

  const handleAuth = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { email, password } = formData;
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;
      dispatch(login({ email: user.email, uid: user.uid })); 
      alert(isSignUp ? "Account created successfully!" : "Logged in successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [formData, isSignUp, dispatch]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">{isSignUp ? "Sign Up" : "Sign In"}</h2>
        <form onSubmit={handleAuth}>
          {["email", "password"].map((field) => (
            <CustomInput
              key={field}
              id={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              type={field}
              value={formData[field]}
              onChange={handleChange}
            />
          ))}
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          <CustomButton label={buttonLabel} loading={loading} disabled={loading} type="submit" />
        </form>
        <p className="text-sm text-center mt-4">
          {toggleText}{" "}
          <button type="button" className="text-blue-500 underline" onClick={toggleAuthMode} disabled={loading}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
