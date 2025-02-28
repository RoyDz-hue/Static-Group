import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Navbar() {
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully"
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive"
      });
    }
  };

  return (
    <nav className="border-b py-4 px-6 flex justify-between items-center bg-background">
      <div className="flex items-center gap-6">
        <Link href="/">
          <a className="text-xl font-bold">Group Manager</a>
        </Link>
        <Link href="/dashboard">
          <a className="text-muted-foreground hover:text-foreground">Dashboard</a>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </nav>
  );
}
