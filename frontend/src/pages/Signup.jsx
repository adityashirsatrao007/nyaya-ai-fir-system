import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Card, CardBody, Input, Select, SelectItem } from "@nextui-org/react";
import { motion } from "framer-motion";
import { Scale, UserPlus } from "lucide-react";
import { register } from "../services/auth";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "analyst",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { key: "judiciary", label: "Judiciary" },
    { key: "officer", label: "Law Enforcement" },
    { key: "legal", label: "Legal Counsel" },
    { key: "analyst", label: "Analyst" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        navigate("/app");
      } else {
        setError(result.error || "Registration failed.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
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
              Join <span className="text-amber-500">Nyaya</span>
            </h1>
            <p className="text-stone-500 text-sm font-medium">Authorized Personnel Registration</p>
          </div>
        </div>

        <Card className="bg-surface/80 backdrop-blur-xl border border-white/5 shadow-glow overflow-hidden rounded-2xl">
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border-l-4 border-red-600 text-red-400 px-4 py-3 rounded text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  type="text"
                  label="Name"
                  placeholder="Enter your name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  variant="bordered"
                  classNames={{
                    label: "text-stone-300 font-semibold",
                    inputWrapper: "bg-white/5 border-white/10 focus-within:!border-nyaya-500 data-[hover=true]:border-white/20",
                    input: "text-white placeholder:text-stone-600",
                  }}
                />

                <Input
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="bordered"
                  classNames={{
                    label: "text-stone-300 font-semibold",
                    inputWrapper: "bg-white/5 border-white/10 focus-within:!border-nyaya-500 data-[hover=true]:border-white/20",
                    input: "text-white placeholder:text-stone-600",
                  }}
                />

                <Select
                  label="Role"
                  placeholder="Select a role"
                  selectedKeys={[formData.role]}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  variant="bordered"
                  classNames={{
                    label: "text-stone-300 font-semibold",
                    trigger: "bg-white/5 border-white/10 focus-within:!border-nyaya-500 data-[hover=true]:border-white/20 text-white",
                    popoverContent: "bg-surface border border-white/10 text-white",
                    value: "text-white",
                  }}
                >
                  {roles.map((role) => (
                    <SelectItem key={role.key} value={role.key} className="text-white">
                      {role.label}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
                className="w-full font-bold bg-nyaya-500 text-white shadow-glow hover:bg-nyaya-600 mt-2"
                size="lg"
                isLoading={isLoading}
                endContent={<UserPlus size={16} className="text-white/70" />}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-stone-500 space-y-2">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-nyaya-500 hover:text-nyaya-400 font-bold">
                  Sign in
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

export default Signup;
