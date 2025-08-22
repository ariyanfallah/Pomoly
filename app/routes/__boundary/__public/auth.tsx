import { LoginForm } from "../../../components/auth/LoginForm";
import { SignUpForm } from "../../../components/auth/SignUpForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to TikoTocka</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
