import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Link } from '@tanstack/react-router';
import { LogIn } from 'lucide-react';

export function LoginCallToAction() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mt-12 flex justify-center">
      <Card className="border-primary/20 bg-primary/5 inline-block">
        <CardContent className="py-2 px-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Registered for one of these tournaments?</h3>
          <p className="text-muted-foreground mb-4">Log in to set your prize preferences.</p>
          <Button asChild size="lg">
            <Link to="/login">
              <LogIn />
              Log In and Choose Prizes
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
