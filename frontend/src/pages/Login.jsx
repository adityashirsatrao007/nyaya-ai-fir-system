import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { motion } from "framer-motion";
import { Scale, LogIn } from "lucide-react";
import { login } from "../services/auth";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/app");
      } else {
        setError(result.error || "Authentication failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-nyaya-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-16 h-16 rounded-full bg-nyaya-500/10 border border-nyaya-500/20 flex items-center justify-center">
              <Scale size={28} className="text-nyaya-500" />
            </div>
            <h1 className="text-3xl font-bold font-heading text-white tracking-tight">
              Nyaya <span className="text-amber-500">AI</span>
            </h1>
            <p className="text-stone-500 text-sm font-medium">Judicial Authentication Portal</p>
          </div>
        </div>

        <Card className="bg-surface/80 backdrop-blur-xl border border-white/5 shadow-glow overflow-hidden rounded-2xl">
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border-l-4 border-red-600 text-red-400 px-4 py-3 rounded text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="bordered"
                  classNames={{
                    label: "text-stone-300 font-semibold",
                    inputWrapper: "bg-white/5 border-white/10 focus-within:!border-nyaya-500 data-[hover=true]:border-white/20",
                    input: "text-white placeholder:text-stone-600",
                  }}
                />

                <Input
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="bordered"
                  classNames={{
                    label: "text-stone-300 font-semibold",
                    inputWrapper: "bg-white/5 border-white/10 focus-within:!border-nyaya-500 data-[hover=true]:border-white/20",
                    input: "text-white placeholder:text-stone-600",
                  }}
                />
              </div>

              <Button
                type="submit"
                className="w-full font-bold bg-nyaya-500 text-white shadow-glow hover:bg-nyaya-600"
                size="lg"
                isLoading={isLoading}
                endContent={<LogIn size={16} className="text-white/70" />}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-stone-500 space-y-2">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="text-nyaya-500 hover:text-nyaya-400 font-bold">
                  Sign up
                </Link>
              </p>
              <p>
                <Link to="/" className="text-stone-600 hover:text-stone-400 font-medium">
                  Return to Home
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

export default Login;
