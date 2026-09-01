import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAccess = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (mounted) {
            setAuthorized(false);
            setLoading(false);
          }
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error(
            "[ProtectedRoute] Failed to load profile:",
            error
          );

          if (mounted) {
            setAuthorized(false);
            setLoading(false);
          }

          return;
        }

        const userRole = profile?.role;

        const hasAccess =
          allowedRoles.length === 0 ||
          allowedRoles.includes(userRole);

        if (mounted) {
          setAuthorized(hasAccess);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "[ProtectedRoute] Access check failed:",
          error
        );

        if (mounted) {
          setAuthorized(false);
          setLoading(false);
        }
      }
    };

    checkAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAccess();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-semibold">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;